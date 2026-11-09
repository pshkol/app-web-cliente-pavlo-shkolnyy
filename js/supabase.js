const columnas = [
  "id", "category", "name", "name_detail", "description", "price",
  "availability", "image_src", "image_alt", "image_credit_name", "image_credit_url",
].join(",");

function adaptarProducto(fila) {
  return {
    id: fila.id,
    categoria: fila.category,
    nombre: fila.name,
    nombreDetalle: fila.name_detail,
    descripcion: fila.description,
    precio: fila.price,
    disponibilidad: fila.availability,
    url: `producto.html?id=${encodeURIComponent(fila.id)}`,
    imagen: {
      src: fila.image_src,
      alt: fila.image_alt,
      credito: {
        nombre: fila.image_credit_name,
        url: fila.image_credit_url,
      },
    },
  };
}

async function consultarProductos(filtros = {}) {
  const { SUPABASE_URL, SUPABASE_API_KEY } = await import("./config.js");
  const url = new URL("/rest/v1/products", SUPABASE_URL);
  url.search = new URLSearchParams({ select: columnas, order: "id.asc", ...filtros });

  const respuesta = await fetch(url, {
    headers: { apikey: SUPABASE_API_KEY, Accept: "application/json" },
  });

  if (!respuesta.ok) {
    throw new Error(`No se pudieron cargar los productos (${respuesta.status})`);
  }

  const filas = await respuesta.json();
  if (!Array.isArray(filas)) {
    throw new Error("El catálogo no tiene el formato esperado");
  }

  return filas.map(adaptarProducto);
}

export function obtenerProductos() {
  return consultarProductos();
}

export async function obtenerProducto(id) {
  if (!/^[1-9]\d{0,18}$/.test(id || "")) {
    return null;
  }

  const productos = await consultarProductos({ id: `eq.${id}`, limit: "1" });
  return productos[0] || null;
}
