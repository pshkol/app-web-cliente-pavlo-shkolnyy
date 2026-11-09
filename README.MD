# Luz de Cera

Sitio web frontend para una tienda ficticia de velas artesanales. El proyecto presenta un catálogo organizado por categorías, páginas de detalle, un carrito de compras simulado y un formulario de contacto.

## Funcionalidades

- Catálogo de productos obtenido de Supabase mediante `fetch` y JavaScript nativo.
- Buscador en el header de todas las páginas, con envío mediante Enter o el botón Buscar.
- Resultados en cards, skeleton durante la carga y estados de búsqueda vacía o fallida con reintento.
- Productos organizados en las categorías más vendidas, animales y aromáticas.
- Una única página de detalle que consulta el producto indicado en la URL.
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
- API REST de Supabase (sin SDK)

El sitio utiliza solamente HTML, CSS y JavaScript. No utiliza npm, frameworks ni dependencias. Un script de JavaScript genera la configuración pública desde `.env` antes de servir el sitio.

## Estructura

```text
.
├── js/
│   ├── busqueda.js          # Filtrado y estados de la búsqueda
│   ├── config.js            # Configuración pública generada (ignorada por Git)
│   ├── producto.js          # Detalle según el parámetro id de la URL
│   ├── productos.js         # Catálogo, cards y skeleton compartidos
│   └── supabase.js          # Consultas REST y adaptación de los datos
├── scripts/
│   └── configurar.mjs       # Genera js/config.js desde las variables de .env
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
├── producto.html           # Página única de detalle
└── index.html
```

## Ejecución local

El catálogo se obtiene con `fetch`, por lo que el proyecto debe abrirse desde un servidor HTTP.

Crear `.env` tomando `.env.example` como referencia (si todavía no existe) y configurar `SUPABASE_API_KEY` con la clave pública `sb_publishable_...` del proyecto. `SUPABASE_URL` es opcional: por defecto se utiliza el proyecto conectado por MCP.

Generar la configuración con Node.js 20.6 o posterior, sin instalar paquetes:

```bash
node --env-file=.env scripts/configurar.mjs
```

Repetir este comando al cambiar `.env`. El navegador utiliza únicamente `js/config.js`, que contiene la URL y la clave pública. Para publicar el sitio, incluir ese archivo generado junto con el HTML, CSS y JS; excluir `.env`, los scripts y los archivos internos del repositorio. Las claves secretas no son válidas para esta integración frontend.

Desde la raíz del proyecto se puede iniciar un servidor con Python:

```bash
python3 -m http.server 8000
```

Después, abrir en el navegador:

```text
http://localhost:8000
```

También se puede utilizar una extensión como Live Server en Visual Studio Code.

## Despliegue en GitHub Pages

El workflow `.github/workflows/pages.yml` publica automáticamente cada cambio en `main`. También se puede ejecutar manualmente desde la pestaña Actions.

Configuración del repositorio:

1. En **Settings → Secrets and variables → Actions**, guardar `SUPABASE_API_KEY` (la clave pública `sb_publishable_...`) y `SUPABASE_URL` como secretos del repositorio.
2. En **Settings → Pages → Source**, seleccionar **GitHub Actions**.

El workflow ejecuta `scripts/configurar.mjs` con esas variables, prepara una carpeta `_site` con los HTML y las carpetas `js` y `styles`, y la publica. No requiere npm ni dependencias. `.env` y los archivos internos del repositorio quedan fuera del despliegue; `js/config.js` se genera durante el workflow y sigue ignorado por Git.

La clave no aparece en los archivos del repositorio, pero **la clave pública sí es visible en el sitio publicado y en las peticiones del navegador**. Nunca configurar una clave secreta o administrativa para este flujo.

## Catálogo de productos

Los productos se administran en la tabla `public.products` del proyecto Supabase conectado. Ese es el nombre real de la tabla verificado mediante MCP; no existe una tabla `productos`. Sus columnas son:

- `id`, `category`.
- `name`, `name_detail`.
- `description`, `price`, `availability`.
- `image_src`, `image_alt`, `image_credit_name`, `image_credit_url`.

`js/supabase.js` consulta `/rest/v1/products` con la cabecera `apikey` usando `SUPABASE_API_KEY`. La lectura pública está sujeta a los permisos y políticas RLS de Supabase. `js/productos.js` agrupa los resultados por categoría y genera las cards en `index.html`.

Todos los enlaces de detalle apuntan a `producto.html?id=...`. Por ejemplo, `producto.html?id=7` consulta únicamente la fila con `id=7` mediante el filtro REST `id=eq.7`. El detalle muestra estados de carga, producto no encontrado y error con reintento.

## Búsqueda

El formulario del header envía la consulta a `busqueda.html?q=...`, por lo que los resultados se pueden compartir mediante su URL. Busca por nombre, descripción y categoría sin distinguir mayúsculas ni tildes. Una consulta vacía muestra todo el catálogo.

Durante la consulta a Supabase se muestran skeletons con las proporciones de las cards. La búsqueda filtra el catálogo recibido sin distinguir mayúsculas ni tildes. La animación respeta la preferencia de movimiento reducido del dispositivo. Si la carga falla, se ofrece un botón para reintentar.

## Alcance actual

Este proyecto es una demostración exclusivamente frontend:

- El carrito contiene información simulada y no conserva cambios entre páginas.
- Los botones para agregar, actualizar o finalizar una compra no se conectan con un backend.
- El formulario de contacto valida los datos, pero no los envía ni almacena.
- El catálogo se lee de Supabase; no existe autenticación de usuarios ni procesamiento de pagos.

## Recursos externos

Las imágenes utilizadas provienen de Pexels. Los créditos y enlaces a sus autores se muestran junto a cada fotografía.
