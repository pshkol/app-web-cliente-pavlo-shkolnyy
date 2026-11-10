import {
  observarCarrito, cambiarCantidad, quitarProducto, finalizarCompra,
  calcularTotales, precioFormateado, MAX_CANTIDAD,
} from "./carrito-estado.js";

const lista = document.querySelector("#lista-carrito");
const plantilla = document.querySelector("#producto-carrito");
const estado = document.querySelector("#estado-carrito");
const formulario = document.querySelector("#formulario-carrito");
const finalizar = document.querySelector("#finalizar-compra");
let comprando = false;

function mostrarCarrito(items) {
  const ids = new Set(items.map((item) => item.id));
  for (const fila of [...lista.children]) {
    if (!ids.has(fila.dataset.id)) fila.remove();
  }
  for (const item of items) {
    let fila = lista.querySelector(`[data-id="${item.id}"]`);
    if (!fila) {
      fila = plantilla.content.firstElementChild.cloneNode(true);
      fila.dataset.id = item.id;
      const input = fila.querySelector("input");
      input.id = `cantidad-${item.id}`;
      input.name = input.id;
      input.max = MAX_CANTIDAD;
      fila.querySelector("label").htmlFor = input.id;
      fila.querySelector("button").setAttribute("aria-label", `Quitar ${item.nombre} del carrito`);
      lista.append(fila);
    }
    const enlace = fila.querySelector("h3 a");
    enlace.href = `producto.html?id=${encodeURIComponent(item.id)}`;
    enlace.textContent = item.nombre;
    const imagen = fila.querySelector("img");
    imagen.src = item.imagen.src;
    imagen.alt = item.imagen.alt;
    fila.querySelector("[data-precio]").textContent = precioFormateado(item.precio);
    const input = fila.querySelector("input");
    if (input.valueAsNumber !== item.cantidad) input.value = item.cantidad;
    fila.querySelector("[data-subtotal]").textContent = precioFormateado(Math.round(item.precio * 100) * item.cantidad / 100);
  }

  const totales = calcularTotales(items);
  document.querySelector("#cantidad-carrito").textContent = totales.cantidad
    ? `Tenés ${totales.cantidad} ${totales.cantidad === 1 ? "producto agregado" : "productos agregados"}.`
    : "Tu carrito está vacío. Elegí una vela para iluminar tus momentos.";
  document.querySelector("#carrito-vacio").hidden = items.length > 0;
  for (const campo of ["subtotal", "envio", "total"]) {
    document.querySelector(`#${campo}-carrito`).textContent = precioFormateado(totales[campo]);
  }
  finalizar.disabled = comprando || items.length === 0;
}

formulario.addEventListener("submit", (evento) => evento.preventDefault());

lista.addEventListener("input", async (evento) => {
  const input = evento.target.closest('input[type="number"]');
  if (!input) return;
  if (!input.validity.valid) {
    estado.textContent = `Ingresá una cantidad entera entre 1 y ${MAX_CANTIDAD}.`;
    return;
  }
  try {
    await cambiarCantidad(input.closest("li").dataset.id, input.valueAsNumber);
    estado.textContent = "Cantidad y total actualizados.";
  } catch (error) {
    estado.textContent = error.message;
  }
});

lista.addEventListener("click", async (evento) => {
  const boton = evento.target.closest("button[data-quitar]");
  if (!boton) return;
  const fila = boton.closest("li");
  const siguiente = fila.nextElementSibling || fila.previousElementSibling;
  try {
    await quitarProducto(fila.dataset.id);
    estado.textContent = "Producto quitado del carrito.";
    (siguiente?.querySelector("input") || document.querySelector("#seguir-comprando")).focus();
  } catch (error) {
    estado.textContent = error.message;
  }
});

document.querySelector("#formulario-compra").addEventListener("submit", async (evento) => {
  evento.preventDefault();
  if (comprando || !formulario.reportValidity()) return;
  comprando = true;
  finalizar.disabled = true;
  try {
    await finalizarCompra();
    window.location.assign("gracias.html");
  } catch (error) {
    comprando = false;
    finalizar.disabled = lista.children.length === 0;
    estado.textContent = error.message;
  }
});

observarCarrito(mostrarCarrito);

window.addEventListener("pageshow", () => {
  comprando = false;
  finalizar.disabled = lista.children.length === 0;
});
