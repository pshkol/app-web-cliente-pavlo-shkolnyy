import { crearCard, mostrarMensaje, mostrarSkeleton, obtenerProductos } from "./productos.js";

const consulta = (new URLSearchParams(window.location.search).get("q") || "").trim();
const campo = document.querySelector("#buscar-productos");
const titulo = document.querySelector("#titulo-resultados");
const estado = document.querySelector("#estado-busqueda");
const lista = document.querySelector("#resultados-busqueda");
const reintentar = document.querySelector("#reintentar-busqueda");

campo.value = consulta;
titulo.textContent = consulta ? `Resultados para «${consulta}»` : "Todos los productos";
document.title = consulta ? `${consulta} | Buscar en Luz de Cera` : "Buscar productos | Luz de Cera";

function normalizar(texto) {
  return texto.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

async function buscarProductos() {
  reintentar.hidden = true;
  estado.textContent = "Buscando productos…";
  mostrarSkeleton(lista, 6);

  try {
    const productos = await obtenerProductos();
    const palabras = normalizar(consulta).split(/\s+/).filter(Boolean);
    const resultados = productos.filter((producto) => {
      const texto = normalizar([
        producto.nombre,
        producto.nombreDetalle,
        producto.descripcion,
        producto.categoria.replaceAll("-", " "),
      ].join(" "));

      return palabras.every((palabra) => texto.includes(palabra));
    });

    if (resultados.length === 0) {
      mostrarMensaje(lista, "Probá con otro nombre, aroma o categoría, o buscá sin texto para ver todos los productos.");
      estado.textContent = "No encontramos productos para tu búsqueda.";
      return;
    }

    lista.replaceChildren(...resultados.map((producto) => crearCard(producto, "h3")));
    lista.removeAttribute("aria-busy");
    estado.textContent = resultados.length === 1
      ? "Encontramos 1 producto."
      : `Encontramos ${resultados.length} productos.`;
  } catch (error) {
    console.error(error);
    mostrarMensaje(lista, "Revisá tu conexión y volvé a intentarlo.");
    estado.textContent = "No pudimos cargar los resultados.";
    reintentar.hidden = false;
  }
}

reintentar.addEventListener("click", buscarProductos);
buscarProductos();
