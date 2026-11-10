import { obtenerProductos } from "./supabase.js";
import { agregarProducto } from "./carrito-estado.js";

export { obtenerProductos };

const listasPorCategoria = new Map(
  Array.from(document.querySelectorAll("[data-lista-productos]"), (lista) => [
    lista.dataset.categoria,
    lista,
  ]),
);

const formatoPrecio = new Intl.NumberFormat("es-AR");

function crearEnlace(href, texto) {
  const enlace = document.createElement("a");
  enlace.href = href;
  enlace.textContent = texto;
  return enlace;
}

export function crearCard(producto, nivelTitulo = "h4") {
  const item = document.createElement("li");
  const articulo = document.createElement("article");
  articulo.dataset.productoId = producto.id;

  const titulo = document.createElement(nivelTitulo);
  titulo.className = "titulo-card";
  titulo.append(crearEnlace(producto.url, producto.nombre));

  const figura = document.createElement("figure");
  const enlaceImagen = crearEnlace(producto.url, "");
  const imagen = document.createElement("img");
  imagen.src = producto.imagen.src;
  imagen.alt = producto.imagen.alt;
  imagen.width = 180;
  imagen.loading = "lazy";
  imagen.decoding = "async";
  enlaceImagen.append(imagen);

  figura.append(enlaceImagen);
  const credito = producto.imagen.credito;
  if (credito.nombre) {
    const pieFoto = document.createElement("figcaption");
    pieFoto.append("Foto de ", credito.url ? crearEnlace(credito.url, credito.nombre) : credito.nombre, ".");
    figura.append(pieFoto);
  }

  const descripcion = document.createElement("p");
  descripcion.textContent = producto.descripcion;

  const precio = document.createElement("p");
  const precioDestacado = document.createElement("strong");
  precioDestacado.textContent = `$${formatoPrecio.format(producto.precio)}`;
  precio.append(precioDestacado);

  const disponibilidad = document.createElement("p");
  disponibilidad.textContent = producto.disponibilidad;

  const detalle = document.createElement("p");
  detalle.className = "enlace-detalle";
  detalle.append(
    crearEnlace(producto.url, `Ver detalle de ${producto.nombreDetalle}`),
  );

  const agregar = document.createElement("button");
  agregar.type = "button";
  agregar.textContent = "Agregar al carrito";
  agregar.setAttribute("aria-label", `Agregar ${producto.nombre} al carrito`);
  const estado = document.createElement("p");
  estado.className = "estado-agregar";
  estado.setAttribute("role", "status");
  agregar.addEventListener("click", async () => {
    agregar.disabled = true;
    try {
      await agregarProducto(producto);
      estado.textContent = "Producto agregado al carrito.";
    } catch (error) {
      estado.textContent = error.message;
    } finally {
      agregar.disabled = false;
    }
  });

  articulo.append(titulo, figura, descripcion, precio, disponibilidad, detalle, agregar, estado);
  item.append(articulo);
  return item;
}

export function mostrarMensaje(lista, mensaje) {
  const item = document.createElement("li");
  item.className = "estado-catalogo";
  item.textContent = mensaje;
  lista.replaceChildren(item);
  lista.removeAttribute("aria-busy");
}

export function mostrarSkeleton(lista, cantidad = 3) {
  lista.setAttribute("aria-busy", "true");
  const items = Array.from({ length: cantidad }, () => {
    const item = document.createElement("li");
    item.className = "skeleton-card";
    item.setAttribute("aria-hidden", "true");

    for (const parte of ["titulo", "imagen", "texto", "texto", "precio", "enlace"]) {
      const bloque = document.createElement("span");
      bloque.className = `skeleton skeleton-${parte}`;
      item.append(bloque);
    }

    return item;
  });
  lista.replaceChildren(...items);
}

async function cargarProductos() {
  for (const lista of listasPorCategoria.values()) {
    mostrarSkeleton(lista);
  }

  try {
    const catalogo = await obtenerProductos();

    for (const [categoria, lista] of listasPorCategoria) {
      const productos = catalogo.filter(
        (producto) => producto.categoria === categoria,
      );

      if (productos.length === 0) {
        mostrarMensaje(
          lista,
          "No hay productos disponibles en esta categoría.",
        );
        continue;
      }

      lista.replaceChildren(...productos.map((producto) => crearCard(producto)));
      lista.removeAttribute("aria-busy");
    }
  } catch (error) {
    console.error(error);

    for (const lista of listasPorCategoria.values()) {
      mostrarMensaje(
        lista,
        "No pudimos cargar los productos. Intentá nuevamente más tarde.",
      );
    }
  }
}

if (listasPorCategoria.size > 0) {
  cargarProductos();
}
