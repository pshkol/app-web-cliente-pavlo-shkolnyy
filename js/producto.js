import { obtenerProducto } from "./supabase.js";

const id = new URLSearchParams(window.location.search).get("id");
const detalle = document.querySelector("#detalle-producto");
const estado = document.querySelector("#estado-producto");
const reintentar = document.querySelector("#reintentar-producto");
const categorias = new Map([
  ["mas-vendidas", "Las más vendidas"],
  ["animales", "Animales"],
  ["aromaticas", "Aromáticas"],
]);
const formatoPrecio = new Intl.NumberFormat("es-AR");

function mostrarProducto(producto) {
  const nombre = producto.nombreDetalle;
  document.title = `${nombre} | Luz de Cera`;
  document.querySelector('meta[name="description"]').content = producto.descripcion;
  document.querySelector("#nombre-producto").textContent = nombre;
  document.querySelector("#miga-producto").textContent = nombre;
  document.querySelector("#descripcion-producto").textContent = producto.descripcion;
  document.querySelector("#precio-producto").textContent = `$${formatoPrecio.format(producto.precio)}`;
  document.querySelector("#disponibilidad-producto").textContent = producto.disponibilidad;
  document.querySelector("#id-producto").value = producto.id;

  const imagen = document.querySelector("#imagen-producto");
  imagen.src = producto.imagen.src;
  imagen.alt = producto.imagen.alt;

  const pieFoto = document.querySelector("#credito-producto");
  const credito = producto.imagen.credito;
  pieFoto.replaceChildren();
  pieFoto.hidden = !credito.nombre;
  if (credito.nombre) {
    if (credito.url) {
      const enlace = document.createElement("a");
      enlace.href = credito.url;
      enlace.textContent = credito.nombre;
      pieFoto.append("Foto de ", enlace, ".");
    } else {
      pieFoto.textContent = `Foto de ${credito.nombre}.`;
    }
  }

  const categoria = categorias.get(producto.categoria) || "Productos";
  const urlCategoria = categorias.has(producto.categoria)
    ? `index.html#${producto.categoria}`
    : "index.html#productos";
  const enlaceCategoria = document.querySelector("#categoria-producto");
  enlaceCategoria.textContent = categoria;
  enlaceCategoria.href = urlCategoria;
  const volver = document.querySelector("#volver-categoria");
  volver.textContent = `Volver a ${categoria}`;
  volver.href = urlCategoria;

  const whatsapp = new URL("https://wa.me/541112345678");
  whatsapp.searchParams.set("text", `Hola, quiero pedir la ${nombre}`);
  document.querySelector("#whatsapp-producto").href = whatsapp.href;
  detalle.hidden = false;
}

async function cargarProducto() {
  detalle.hidden = true;
  detalle.setAttribute("aria-busy", "true");
  reintentar.hidden = true;
  estado.textContent = "Cargando producto…";

  try {
    const producto = await obtenerProducto(id);
    if (!producto) {
      document.title = "Producto no encontrado | Luz de Cera";
      estado.textContent = "No encontramos este producto. Podés volver al catálogo desde el enlace Productos.";
      return;
    }

    mostrarProducto(producto);
    estado.textContent = "";
  } catch (error) {
    console.error(error);
    estado.textContent = "No pudimos cargar el producto. Revisá tu conexión y volvé a intentarlo.";
    reintentar.hidden = false;
  } finally {
    detalle.removeAttribute("aria-busy");
  }
}

reintentar.addEventListener("click", cargarProducto);
cargarProducto();
