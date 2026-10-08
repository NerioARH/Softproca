# SOFTPROCA - Sitio Web Oficial

> **"¡Somos tu aliado tecnológico!"**

Sitio web moderno desarrollado a la medida para la empresa **SOFTPROCA (Softpro C.A.)**, ubicada en Maracaibo, Estado Zulia, Venezuela.

---

## 🚀 Características Principales

1. **Identidad Visual Corporativa & Soporte Bitemático (Modo Claro Predeterminado + Modo Oscuro Opcional)**:
   - **Tono Claro Predeterminado**: Respetando la identidad de la marca donde predomina el blanco puro (`#FFFFFF`) y grises tecnológicos sutiles, con acentos en Naranja Neón (`#FF5A00`).
   - **Selector Manual**: Botón en la barra de navegación para alternar instantáneamente a **Modo Oscuro** (o regresar a Modo Claro) según el gusto del usuario.
   - **Persistencia**: Recuerda la elección del usuario en `localStorage` sin parpadeos al navegar o recargar la página.
   - **Mapa Dinámico Adaptativo**: El mapa interactivo se adapta automáticamente con azulejos claros y oscuros según el modo activo.
   - Uso de logotipos originales (emblema de circuitos SP y banner institucional).
   - Estilo tech con microinteracciones y tipografía moderna (*Rajdhani* e *Inter*).

2. **Sección de Servicios Especializados**:
   - **Instalación de Software de Diseño Gráfico & Arquitectura**:
     - *Autodesk*: AutoCAD, 3ds Max, Revit.
     - *3D & Render*: SketchUp Pro, Chaos V-Ray.
     - *Adobe CC*: Photoshop, Illustrator, InDesign.
     - *Corel*: CorelDRAW Graphics Suite.
   - **Actualización y Clonación de Discos SSD**: M.2 NVMe PCIe y SATA.
   - **Mantenimiento Térmico Preventivo**: Compuestos térmicos premium y limpieza profunda adaptada al clima de Maracaibo.

3. **Catálogo de Productos & Gestor de Inventario en Tiempo Real**:
   - **Tienda Pública 100% Limpia (`productos.html`)**: Los visitantes y clientes solo ven el catálogo, filtros, buscador y carrito/cotizador. No tienen acceso ni visualización de ningún botón o herramienta de edición o publicación.
   - **Panel Privado de Administración (`admin.html`)**:
     - Acceso privado y exclusivo mediante URL directa y protección con código PIN (PIN de fábrica: `1234`).
     - No indexable por motores de búsqueda (`noindex, nofollow`).
     - **Publicación de Artículos**: Formulario para agregar productos con nombre, categoría, precio en USD, badges destacados ("Más Vendido", "Oferta", "Nuevo"), especificaciones y soporte para fotos reales desde la computadora/teléfono (con compresión automática mediante Canvas) o selección de íconos tech.
     - **Control de Stock al Instante**: Selector rápido para alternar entre *Disponible (En Stock)*, *Pocas Unidades* y *Agotado*. Los cambios se reflejan al instante en la tienda pública sin necesidad de recargar.
     - **Edición y Eliminación**: Modificación inmediata de precios, fotos y eliminación de artículos obsoletos.
     - **Respaldo & Sincronización**: Exportación e importación de catálogo en formato JSON (`catalogo-softproca.json`), cambio de PIN de seguridad y restauración de valores de fábrica con un clic.
   - Catálogo interactivo con filtrado dinámico en tiempo real, buscador y cotizador integrado.

4. **Sistema Interactivo para Agendar Citas o Llamadas**:
   - Selección de modalidad: *En Tienda (Edif. Flamingo)*, *A Domicilio*, *Soporte Remoto (AnyDesk)* o *Llamada Telefónica*.
   - Generación de ticket y resumen interactivo en pantalla.
   - Envío instantáneo por WhatsApp con mensaje preformateado hacia **+58 4246402032**.

5. **Ubicación & Contacto**:
   - Dirección oficial: **MCBO, EDO ZULIA, AV 5 DE JULIO CON CALLE 71. EDIF. FLAMINGO, P/B. Diagonal a la E/S.**
   - Puntos de referencia: E/S Los Almendros, Domesa Indio Mara, DHL Express, Plaza de las Madres.
   - Mapa interactivo con Leaflet.js centrado en las coordenadas de Maracaibo con marcador personalizado.
   - Lightbox para ver en alta resolución los flyers oficiales con croquis y código QR.

6. **Canal Directo de Soporte**:
   - Botón flotante siempre visible de WhatsApp enlazado a **+58 4246402032**.
   - Botones rápidos de consulta en cada producto y servicio.

---

## 📂 Estructura de Páginas & Archivos (Sitio Multi-página)

```
softproca-web/
├── index.html                   # Portal de Inicio (Visión institucional y accesos directos)
├── servicios.html               # Página de Servicios (Software de diseño 3D, mantenimiento, upgrades)
├── productos.html               # Página Pública de Productos (Catálogo, buscador, cotizador/carrito)
├── admin.html                   # Panel Privado de Administración (Acceso restringido por PIN para el cliente)
├── tips.html                    # Página de Tips Tech (Guía interactiva de medidas SSD M.2 y artículos)
├── citas-ubicacion.html         # Página de Agendar Citas & Ubicación (Asistente de citas y mapa interactivo)
├── assets/
│   ├── css/
│   │   └── styles.css           # Estilos tech, soporte bitemático (Dark/Light) y diseño responsivo
│   ├── js/
│   │   ├── main.js              # Lógica interactiva pública (tema, carrito persistente, buscador, mapa)
│   │   └── admin.js             # Lógica privada del administrador (autenticación PIN, CRUD, stock, backups)
│   └── images/
│       ├── logo-banner.png      # Banner corporativo SOFTPROCA
│       ├── logo-sq.jpg          # Logo cuadrado con textura
│       ├── logo-icon.svg        # Ícono vectorial SVG para favicons y navbar
│       ├── flyer-software.jpg   # Flyer de programas de diseño y arquitectura
│       ├── flyer-location.jpg   # Flyer de mapa, dirección y código QR
│       └── flyer-ssd.jpg        # Flyer de modelos y medidas SSD M.2
└── README.md                    # Documentación del proyecto
```

---

## 🌐 Cómo Visualizar el Proyecto

Puedes abrir directamente el archivo `index.html` en cualquier navegador web moderno (Chrome, Edge, Firefox, Brave) o levantarlo con un servidor local:

```bash
# Con Python
python -m http.server 8080

# O con npx
npx serve .
```

Luego abre en tu navegador: `http://localhost:8080`
