import { CLAVE_COMPRA, MAX_CANTIDAD, calcularTotales, precioFormateado } from "./carrito-estado.js";

function mostrarCompra() {
  try {
    const compra = JSON.parse(sessionStorage.getItem(CLAVE_COMPRA));
    if (!compra?.items?.length || !Array.isArray(compra.items)
      || !Number.isFinite(Date.parse(compra.fecha))
      || !compra.items.every((item) => typeof item.nombre === "string"
        && Number.isFinite(item.precio) && item.precio >= 0
        && Number.isInteger(item.cantidad) && item.cantidad >= 1 && item.cantidad <= MAX_CANTIDAD)) {
      throw new Error("No hay una compra guardada.");
    }
    const lista = document.querySelector("#productos-compra");
    for (const item of compra.items) {
      const fila = document.createElement("li");
      const nombre = document.createElement("span");
      nombre.textContent = `${item.nombre} × ${item.cantidad}`;
      const subtotal = document.createElement("strong");
      subtotal.textContent = precioFormateado(Math.round(item.precio * 100) * item.cantidad / 100);
      fila.append(nombre, subtotal);
      lista.append(fila);
    }
    const totales = calcularTotales(compra.items);
    for (const campo of ["subtotal", "envio", "total"]) {
      document.querySelector(`#${campo}-compra`).textContent = precioFormateado(totales[campo]);
    }
    document.querySelector("#fecha-compra").textContent = new Intl.DateTimeFormat("es-AR", {
      dateStyle: "long", timeStyle: "short",
    }).format(new Date(compra.fecha));
    document.querySelector("#compra-completada").hidden = false;
  } catch {
    document.title = "Tu compra | Luz de Cera";
    document.querySelector("#sin-compra").hidden = false;
  }
}

mostrarCompra();
