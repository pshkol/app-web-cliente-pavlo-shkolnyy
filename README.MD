# Luz de Cera

Sitio web frontend para una tienda ficticia de velas artesanales. El proyecto presenta un catálogo organizado por categorías, páginas de detalle, un carrito de compras simulado y un formulario de contacto.

## Funcionalidades

- Catálogo de productos generado dinámicamente con JavaScript.
- Buscador en el header de todas las páginas, con envío mediante Enter o el botón Buscar.
- Resultados en cards, skeleton durante la carga y estados de búsqueda vacía o fallida con reintento.
- Productos organizados en las categorías más vendidas, animales y aromáticas.
- Páginas individuales con descripción, precio, disponibilidad y fotografía.
- Selector de cantidad y botón simulado para agregar productos al carrito.
- Carrito de compras con edición de cantidades, subtotales y resumen del pedido.
- Formulario de contacto con validaciones nativas de HTML.
- Accesos directos para realizar consultas y pedidos por WhatsApp.
- Diseño responsive para computadoras, tablets y dispositivos móviles.
- Estructura semántica y estados accesibles durante la carga del catálogo.

## Tecnologías

- HTML5
- CSS3
- JavaScript
- JSON

El proyecto no utiliza frameworks, dependencias ni un proceso de compilación.

## Estructura

```text
.
├── data/
│   └── productos.json       # Fuente de datos del catálogo
├── js/
│   ├── busqueda.js          # Filtrado y estados de la búsqueda
│   └── productos.js         # Carga del JSON, cards y skeleton compartidos
├── productos/               # Páginas de detalle de cada producto
├── styles/
│   ├── busqueda.css         # Página de resultados
│   ├── catalogo.css         # Cards y skeleton compartidos
│   ├── carrito.css          # Estilos del carrito
│   ├── comunes.css          # Estilos globales, header y footer
│   ├── contacto.css         # Estilos de contacto
│   ├── inicio.css           # Estilos de la página principal
│   └── producto.css         # Estilos del detalle de producto
├── busqueda.html
├── carrito.html
├── contacto.html
└── index.html
```

## Ejecución local

El catálogo se obtiene con `fetch`, por lo que el proyecto debe abrirse desde un servidor HTTP. Abrir `index.html` directamente mediante `file://` puede impedir la lectura de `data/productos.json` por las restricciones de seguridad del navegador.

Desde la raíz del proyecto se puede iniciar un servidor con Python:

```bash
python3 -m http.server 8000
```

Después, abrir en el navegador:

```text
http://localhost:8000
```

También se puede utilizar una extensión como Live Server en Visual Studio Code.

## Catálogo de productos

Los productos de la página principal se administran desde `data/productos.json`. Cada entrada contiene:

- Identificador y categoría.
- Nombre para la card y para el enlace de detalle.
- Descripción, precio y disponibilidad.
- Ruta de la página individual.
- URL, texto alternativo y crédito de la imagen.

Al cargar la página, `js/productos.js` consulta ese archivo, agrupa los productos por categoría y genera las cards dentro de los contenedores definidos en `index.html`.

## Búsqueda

El formulario del header envía la consulta a `busqueda.html?q=...`, por lo que los resultados se pueden compartir mediante su URL. Busca por nombre, descripción y categoría sin distinguir mayúsculas ni tildes. Una consulta vacía muestra todo el catálogo.

Durante la consulta del JSON se muestran skeletons con las proporciones de las cards. La animación respeta la preferencia de movimiento reducido del dispositivo. Si la carga falla, se ofrece un botón para reintentar.

## Alcance actual

Este proyecto es una demostración exclusivamente frontend:

- El carrito contiene información simulada y no conserva cambios entre páginas.
- Los botones para agregar, actualizar o finalizar una compra no se conectan con un backend.
- El formulario de contacto valida los datos, pero no los envía ni almacena.
- No existe autenticación, base de datos ni procesamiento de pagos.

## Recursos externos

Las imágenes utilizadas provienen de Pexels. Los créditos y enlaces a sus autores se muestran junto a cada fotografía.
