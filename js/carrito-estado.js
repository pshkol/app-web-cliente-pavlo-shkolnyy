const CLAVE = "luz-de-cera:carrito:v1";
export const CLAVE_COMPRA = "luz-de-cera:ultima-compra:v1";
export const MAX_CANTIDAD = 10;
const suscriptores = new Set();
const formato = new Intl.NumberFormat("es-AR", { maximumFractionDigits: 2 });
let canal;

export function precioFormateado(precio) {
  return `$${formato.format(precio)}`;
}

function validarCantidad(cantidad) {
  if (!Number.isInteger(cantidad) || cantidad < 1 || cantidad > MAX_CANTIDAD) {
    throw new Error(`Elegí una cantidad entera entre 1 y ${MAX_CANTIDAD}.`);
  }
}

function normalizarItem(item) {
  validarCantidad(item.cantidad);
  const id = String(item.id);
  if (!/^[1-9]\d{0,18}$/.test(id) || typeof item.nombre !== "string" || !item.nombre.trim()
    || !Number.isFinite(item.precio) || item.precio < 0
    || !Number.isSafeInteger(Math.round(item.precio * 100) * MAX_CANTIDAD)) {
    throw new Error("El producto no tiene datos válidos.");
  }
  const imagen = new URL(item.imagen.src, window.location.href);
  if (!["https:", "http:"].includes(imagen.protocol)) {
    throw new Error("La imagen del producto no es válida.");
  }
  return {
    id,
    nombre: item.nombre,
    precio: Math.round(item.precio * 100) / 100,
    cantidad: item.cantidad,
    imagen: { src: imagen.href, alt: String(item.imagen.alt || item.nombre) },
  };
}

// Los datos dañados se descartan; un fallo de acceso se comunica al intentar guardar.
export function obtenerCarrito() {
  const guardado = localStorage.getItem(CLAVE);
  try {
    const items = JSON.parse(guardado || "[]");
    if (!Array.isArray(items)) return [];
    const normalizados = items.map(normalizarItem);
    if (new Set(normalizados.map((item) => item.id)).size !== normalizados.length) return [];
    return normalizados;
  } catch {
    return [];
  }
}

export function calcularTotales(items) {
  const centavos = items.reduce((total, item) => total + Math.round(item.precio * 100) * item.cantidad, 0);
  const cantidad = items.reduce((total, item) => total + item.cantidad, 0);
  const envio = cantidad > 0 ? 3500 : 0;
  return { cantidad, subtotal: centavos / 100, envio, total: (centavos + envio * 100) / 100 };
}

function notificar() {
  let items;
  try {
    items = obtenerCarrito();
  } catch {
    items = [];
  }
  for (const suscriptor of suscriptores) suscriptor(items);
}

export function observarCarrito(suscriptor) {
  suscriptores.add(suscriptor);
  notificar();
  return () => suscriptores.delete(suscriptor);
}

async function modificarCarrito(modificar) {
  const guardar = () => {
    let items;
    try {
      items = obtenerCarrito();
    } catch {
      throw new Error("No pudimos acceder al carrito. Permití el almacenamiento local y volvé a intentarlo.");
    }
    const resultado = modificar(items);
    try {
      localStorage.setItem(CLAVE, JSON.stringify(items));
    } catch {
      throw new Error("No pudimos guardar el carrito. Revisá el espacio y los permisos de almacenamiento.");
    }
    notificar();
    canal?.postMessage({ tipo: "carrito-actualizado" });
    return resultado;
  };

  // Serializa los cambios de pestañas simultáneas cuando Web Locks está disponible.
  if (navigator.locks) return navigator.locks.request(CLAVE, guardar);
  return guardar();
}

export function agregarProducto(producto, cantidad = 1) {
  return modificarCarrito((items) => {
    validarCantidad(cantidad);
    const item = normalizarItem({ ...producto, cantidad });
    const existente = items.find((actual) => actual.id === item.id);
    if (existente) {
      if (existente.cantidad + cantidad > MAX_CANTIDAD) {
        throw new Error(`Podés agregar hasta ${MAX_CANTIDAD} unidades por producto. Ya tenés ${existente.cantidad} en el carrito.`);
      }
      Object.assign(existente, item, { cantidad: existente.cantidad + cantidad });
    } else {
      items.push(item);
    }
  });
}

export function cambiarCantidad(id, cantidad) {
  return modificarCarrito((items) => {
    validarCantidad(cantidad);
    const item = items.find((actual) => actual.id === String(id));
    if (!item) throw new Error("Este producto ya fue quitado del carrito en otra pestaña.");
    item.cantidad = cantidad;
  });
}

export function quitarProducto(id) {
  return modificarCarrito((items) => {
    const indice = items.findIndex((actual) => actual.id === String(id));
    if (indice !== -1) items.splice(indice, 1);
  });
}

export function finalizarCompra() {
  return modificarCarrito((items) => {
    if (!items.length) throw new Error("Agregá productos al carrito antes de finalizar la compra.");
    const compra = { items: [...items], ...calcularTotales(items), fecha: new Date().toISOString() };
    try {
      sessionStorage.setItem(CLAVE_COMPRA, JSON.stringify(compra));
    } catch {
      throw new Error("No pudimos guardar el resumen de la compra. Permití el almacenamiento y volvé a intentarlo.");
    }
    items.splice(0);
    return compra;
  });
}

try {
  canal = new BroadcastChannel(CLAVE);
  // Se lee siempre la versión persistida, incluso si llegan mensajes fuera de orden.
  canal.addEventListener("message", (evento) => {
    if (evento.data?.tipo === "carrito-actualizado") notificar();
  });
} catch {
  // El evento storage también sincroniza navegadores sin BroadcastChannel.
}
window.addEventListener("storage", (evento) => {
  if (evento.key === CLAVE || evento.key === null) notificar();
});
window.addEventListener("pageshow", notificar);

observarCarrito((items) => {
  const { cantidad } = calcularTotales(items);
  for (const contador of document.querySelectorAll("[data-contador-carrito]")) {
    contador.textContent = `Carrito (${cantidad})`;
  }
});
