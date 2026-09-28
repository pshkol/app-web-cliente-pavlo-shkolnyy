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

function crearCard(producto) {
  const item = document.createElement("li");
  const articulo = document.createElement("article");
  articulo.dataset.productoId = producto.id;

  const titulo = document.createElement("h4");
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

  const pieFoto = document.createElement("figcaption");
  pieFoto.append(
    "Foto de ",
    crearEnlace(producto.imagen.credito.url, producto.imagen.credito.nombre),
    ".",
  );
  figura.append(enlaceImagen, pieFoto);

  const descripcion = document.createElement("p");
  descripcion.textContent = producto.descripcion;

  const precio = document.createElement("p");
  const precioDestacado = document.createElement("strong");
  precioDestacado.textContent = `$${formatoPrecio.format(producto.precio)}`;
  precio.append(precioDestacado);

  const disponibilidad = document.createElement("p");
  disponibilidad.textContent = producto.disponibilidad;

  const detalle = document.createElement("p");
  detalle.append(
    crearEnlace(producto.url, `Ver detalle de ${producto.nombreDetalle}`),
  );

  articulo.append(titulo, figura, descripcion, precio, disponibilidad, detalle);
  item.append(articulo);
  return item;
}

function mostrarMensaje(lista, mensaje) {
  const item = document.createElement("li");
  item.className = "estado-catalogo";
  item.textContent = mensaje;
  lista.replaceChildren(item);
  lista.removeAttribute("aria-busy");
}

async function cargarProductos() {
  try {
    const respuesta = await fetch("data/productos.json");

    if (!respuesta.ok) {
      throw new Error(`No se pudo cargar el catálogo (${respuesta.status})`);
    }

    const datos = await respuesta.json();

    if (!Array.isArray(datos.productos)) {
      throw new Error("El catálogo no tiene el formato esperado");
    }

    for (const [categoria, lista] of listasPorCategoria) {
      const productos = datos.productos.filter(
        (producto) => producto.categoria === categoria,
      );

      if (productos.length === 0) {
        mostrarMensaje(
          lista,
          "No hay productos disponibles en esta categoría.",
        );
        continue;
      }

      lista.replaceChildren(...productos.map(crearCard));
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

cargarProductos();
