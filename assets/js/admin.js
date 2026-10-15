/**
 * ============================================================================
 * SOFTPROCA - PANEL PRIVADO DE ADMINISTRACIÓN & GESTIÓN DE INVENTARIO
 * ============================================================================
 * Maneja de forma 100% aislada:
 * - Autenticación privada por PIN y sesión protegida (sessionStorage con fallback)
 * - Publicación, edición y eliminación de productos en tiempo real
 * - Cambio de estado de stock en 1 clic (En Stock, Pocas Unidades, Agotado)
 * - Compresión automática de imágenes vía HTML5 Canvas (máx 600px, Web-Ready)
 * - Sincronización instantánea con la tienda pública (localStorage + storage event)
 * - Respaldos en JSON, cambio de PIN y restablecimiento de fábrica
 * ============================================================================
 */

(function() {
  'use strict';

  // =========================================================================
  // 1. CONSTANTES & ALMACENAMIENTO SEGURO (CON FALLBACK EN MEMORIA)
  // =========================================================================
  const STORAGE_KEY_CATALOG = 'softproca-products-catalog';
  const STORAGE_KEY_PIN = 'softproca-admin-pin';
  const STORAGE_KEY_THEME = 'softproca-theme';
  const SESSION_AUTH_KEY = 'softproca-admin-session';
  const DEFAULT_PIN = '1234';

  const inMemoryStore = {};

  function safeStorageGet(key, isSession = false) {
    try {
      const storage = isSession ? window.sessionStorage : window.localStorage;
      const val = storage.getItem(key);
      if (val !== null) return val;
    } catch (e) {
      // Ignorar restricciones locales del navegador
    }
    return inMemoryStore[key] || null;
  }

  function safeStorageSet(key, val, isSession = false) {
    inMemoryStore[key] = val;
    try {
      const storage = isSession ? window.sessionStorage : window.localStorage;
      storage.setItem(key, val);
    } catch (e) {
      // Fallback ya guardado en memoria
    }
  }

  function safeStorageRemove(key, isSession = false) {
    delete inMemoryStore[key];
    try {
      const storage = isSession ? window.sessionStorage : window.localStorage;
      storage.removeItem(key);
    } catch (e) {
      // Fallback ya borrado en memoria
    }
  }

  // Utilidad para escapar texto HTML y evitar roturas con comillas o caracteres especiales
  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  // Catálogo base de fábrica de SOFTPROCA
  const DEFAULT_PRODUCTS = [
  {
    "id": "motherboard-asrock-z790-wifi",
    "category": "componentes",
    "name": "Tarjeta Madre ASRock Z790 Pro RS WiFi",
    "specs": "Socket LGA1700 compatible con procesadores Intel Core 12va, 13va y 14va Gen. Soporta memoria DDR5, PCIe 5.0, Wi-Fi 6E, audio HD y Polychrome SYNC.",
    "price": 220,
    "stockStatus": "in_stock",
    "badge": "Gama Alta",
    "icon": "fa-microchip",
    "image": "assets/images/productos/motherboard-asrock-z790-wifi.png"
  },
  {
    "id": "impresora-hp-laserjet-p1102",
    "category": "impresoras",
    "name": "Impresora HP LaserJet Pro P1102 (Nueva)",
    "specs": "Impresora láser monocromática compacta de alta velocidad y durabilidad legendaria. Excelente rendimiento de páginas a muy bajo costo.",
    "price": 200,
    "stockStatus": "in_stock",
    "badge": "Nueva en Caja",
    "icon": "fa-print",
    "image": "assets/images/productos/impresora-hp-laserjet-p1102.png"
  },
  {
    "id": "ssd-hp-480gb-sata",
    "category": "ssd",
    "name": "Disco Sólido SSD HP S700 480GB SATA III",
    "specs": "Velocidad hasta 560 MB/s lectura y 515 MB/s escritura. 3D NAND Flash para laptops y PCs de escritorio. Aumenta drásticamente la velocidad del equipo.",
    "price": 90,
    "stockStatus": "in_stock",
    "badge": "Top Ventas",
    "icon": "fa-hard-drive",
    "image": "assets/images/productos/ssd-hp-480gb-sata.png"
  },
  {
    "id": "bateria-laptop-dell-1wnd8",
    "category": "componentes",
    "name": "Batería Original Laptop Dell Tipo 1WND8",
    "specs": "Batería de repuesto garantizada para laptops Dell Inspiron y Latitude. Celdas de iones de litio de alta calidad y máxima autonomía.",
    "price": 50,
    "stockStatus": "in_stock",
    "badge": "Garantizada",
    "icon": "fa-battery-full",
    "image": "assets/images/productos/bateria-laptop-dell-1wnd8.png"
  },
  {
    "id": "ssd-hp-120gb-sata",
    "category": "ssd",
    "name": "Disco Sólido SSD HP 120GB SATA III 2.5\"",
    "specs": "Actualización esencial y económica para arrancar Windows y programas de oficina en segundos. Compatible con cualquier PC o laptop.",
    "price": 35,
    "stockStatus": "in_stock",
    "badge": "Económico",
    "icon": "fa-hard-drive",
    "image": "assets/images/productos/ssd-hp-120gb-sata.png"
  },
  {
    "id": "fuente-de-poder-agiler-600w",
    "category": "componentes",
    "name": "Fuente de Poder Agiler 600W (AGI-PS600)",
    "specs": "600 Watts de potencia con ventilador silencioso de 120mm, conectores SATA, Molex y PCIe. Ideal para computadoras de oficina y gaming medio.",
    "price": 28,
    "stockStatus": "in_stock",
    "badge": "Recomendada",
    "icon": "fa-bolt",
    "image": "assets/images/productos/fuente-de-poder-agiler-600w.png"
  },
  {
    "id": "toner-stamprint-premium",
    "category": "impresoras",
    "name": "Cartucho de Tóner Stamprint Premium",
    "specs": "Cartucho de tóner genérico premium de alto rendimiento y máxima densidad de negro. Textos e imágenes limpias para empresas y colegios.",
    "price": 25,
    "stockStatus": "in_stock",
    "badge": "Rendimiento",
    "icon": "fa-box",
    "image": "assets/images/productos/toner-stamprint-premium.png"
  },
  {
    "id": "toner-laserjet-compatible",
    "category": "impresoras",
    "name": "Cartucho de Tóner HP LaserJet Compatible",
    "specs": "Compatible con impresoras HP LaserJet (modelos 85A / P1102 / M1132). Impresiones nítidas, confiables y de bajo costo.",
    "price": 15,
    "stockStatus": "in_stock",
    "badge": "Ahorro",
    "icon": "fa-box",
    "image": "assets/images/productos/toner-laserjet-compatible.png"
  },
  {
    "id": "cargador-dc-12v-5a",
    "category": "cables",
    "name": "Cargador / Fuente Regulada DC 12V 5A",
    "specs": "Adaptador de poder conmutado 12V a 5 Amperios (conector universal 5.5mm). Para sistemas de cámaras de seguridad, monitores, tiras LED y routers.",
    "price": 15,
    "stockStatus": "in_stock",
    "badge": "Multiuso",
    "icon": "fa-plug",
    "image": "assets/images/productos/cargador-dc-12v-5a.png"
  },
  {
    "id": "teclado-computadora-usb",
    "category": "perifericos",
    "name": "Teclado USB para Computadora (Español)",
    "specs": "Teclado de membrana de tacto suave y respuesta rápida, distribución en español con letra Ñ, teclas resistentes al derrame de líquidos.",
    "price": 10,
    "stockStatus": "in_stock",
    "badge": "Oficina",
    "icon": "fa-keyboard",
    "image": "assets/images/productos/teclado-computadora-usb.png"
  },
  {
    "id": "receptor-wifi-inalambrico",
    "category": "perifericos",
    "name": "Receptor Inalámbrico USB WiFi con Antena",
    "specs": "Antena de alta ganancia USB para conexión inalámbrica veloz. Ideal para dotar de WiFi a PCs de escritorio o laptops con tarjeta dañada.",
    "price": 10,
    "stockStatus": "in_stock",
    "badge": "Conectividad",
    "icon": "fa-wifi",
    "image": "assets/images/productos/receptor-wifi-inalambrico.png"
  },
  {
    "id": "protector-de-voltaje",
    "category": "componentes",
    "name": "Protector de Voltaje para Equipos Electrónicos",
    "specs": "Protege computadoras, televisores e impresoras contra picos de voltaje, sobretensiones y apagones. Indicadores LED de seguridad.",
    "price": 10,
    "stockStatus": "in_stock",
    "badge": "Seguridad",
    "icon": "fa-shield-halved",
    "image": "assets/images/productos/protector-de-voltaje.png"
  },
  {
    "id": "cable-displayport-hd",
    "category": "cables",
    "name": "Cable DisplayPort de Alta Resolución",
    "specs": "Cable DP a DP macho de alto ancho de banda. Soporta altas frecuencias de refresco (144Hz, 165Hz, 240Hz) en monitores gaming y 4K.",
    "price": 10,
    "stockStatus": "in_stock",
    "badge": "Gaming / 144Hz",
    "icon": "fa-tv",
    "image": "assets/images/productos/cable-displayport-hd.png"
  },
  {
    "id": "tinta-negra-static-control",
    "category": "impresoras",
    "name": "Tinta Negra Static Control para Impresoras",
    "specs": "Botella de tinta de alta formulación para recarga de sistemas continuos Epson Ecotank, Canon y HP. Negro intenso y secado rápido.",
    "price": 8,
    "stockStatus": "in_stock",
    "badge": "Universal",
    "icon": "fa-droplet",
    "image": "assets/images/productos/tinta-negra-static-control.png"
  },
  {
    "id": "cable-sata-a-usb-c",
    "category": "cables",
    "name": "Cable Adaptador SATA a USB Tipo C",
    "specs": "Permite conectar cualquier disco SSD o HDD de 2.5\" directo al puerto USB-C de tu laptop o PC sin necesidad de fuente externa.",
    "price": 8,
    "stockStatus": "in_stock",
    "badge": "Práctico",
    "icon": "fa-plug",
    "image": "assets/images/productos/cable-sata-a-usb-c.png"
  },
  {
    "id": "mouse-optico-blanco",
    "category": "perifericos",
    "name": "Mouse Óptico para Computadora (Blanco)",
    "specs": "Diseño ergonómico y minimalista en color blanco, sensor óptico de 1200 DPI, rueda de desplazamiento precisa y conexión USB.",
    "price": 8,
    "stockStatus": "in_stock",
    "badge": "Moderno",
    "icon": "fa-computer-mouse",
    "image": "assets/images/productos/mouse-optico-blanco.png"
  },
  {
    "id": "control-remoto-universal",
    "category": "perifericos",
    "name": "Control Remoto Universal Smart TV",
    "specs": "Compatible con televisores Smart TV y tradicionales (LG, Samsung, Sony, Philips, TCL, etc.). Fácil programación y botones de acceso directo.",
    "price": 7,
    "stockStatus": "in_stock",
    "badge": "Universal",
    "icon": "fa-gamepad",
    "image": "assets/images/productos/control-remoto-universal.png"
  },
  {
    "id": "cable-usb-c-a-c",
    "category": "cables",
    "name": "Cable USB-C a USB-C de Carga Rápida y Datos",
    "specs": "Cable con conectores Type-C en ambos extremos. Soporta protocolos Power Delivery (PD) de alta potencia y transferencia veloz de datos.",
    "price": 6,
    "stockStatus": "in_stock",
    "badge": "Fast Charge",
    "icon": "fa-bolt",
    "image": "assets/images/productos/cable-usb-c-a-c.png"
  },
  {
    "id": "adaptador-dp-hdmi",
    "category": "cables",
    "name": "Adaptador DisplayPort a HDMI",
    "specs": "Conversor compacto macho DisplayPort a hembra HDMI. Permite conectar tarjetas de video modernas a pantallas, proyectores o TVs HDMI.",
    "price": 6,
    "stockStatus": "in_stock",
    "badge": "Video HD",
    "icon": "fa-plug",
    "image": "assets/images/productos/adaptador-dp-hdmi.png"
  },
  {
    "id": "cable-vga-argom",
    "category": "cables",
    "name": "Cable VGA ArgomTech con Filtros de Ferrita",
    "specs": "Cable VGA macho a macho de 1.8 metros con conectores reforzados y núcleos de ferrita para eliminar interferencias de señal en monitores.",
    "price": 6,
    "stockStatus": "in_stock",
    "badge": "ArgomTech",
    "icon": "fa-tv",
    "image": "assets/images/productos/cable-vga-argom.png"
  },
  {
    "id": "adaptador-dahua-12v",
    "category": "cables",
    "name": "Adaptador de Corriente Dahua 12V",
    "specs": "Fuente de poder original Dahua Technology. Diseñada para operar continuamente con cámaras de seguridad y dispositivos de red.",
    "price": 6,
    "stockStatus": "in_stock",
    "badge": "Original",
    "icon": "fa-plug",
    "image": "assets/images/productos/adaptador-dahua-12v.png"
  },
  {
    "id": "mouse-optico-negro",
    "category": "perifericos",
    "name": "Mouse Óptico para Computadora (Negro)",
    "specs": "Mouse USB clásico alámbrico de gran durabilidad y comodidad para largas jornadas de trabajo o estudio. Sensor óptico confiable.",
    "price": 5,
    "stockStatus": "in_stock",
    "badge": "Básico",
    "icon": "fa-computer-mouse",
    "image": "assets/images/productos/mouse-optico-negro.png"
  },
  {
    "id": "hot-wheels-coleccion",
    "category": "coleccion",
    "name": "Autos de Colección Hot Wheels Originales",
    "specs": "Vehículos die-cast a escala 1:64 en empaque original Mattel. Modelos surtidos coleccionables para fanáticos y entusiastas.",
    "price": 5,
    "stockStatus": "in_stock",
    "badge": "Colección $5 c/u",
    "icon": "fa-car",
    "image": "assets/images/productos/hot-wheels-coleccion.png"
  },
  {
    "id": "cable-usb-a-a-c",
    "category": "cables",
    "name": "Cable USB-A a USB Tipo C",
    "specs": "Cable estándar para carga y sincronización de datos de teléfonos móviles, periféricos y accesorios con entrada USB-C.",
    "price": 4,
    "stockStatus": "in_stock",
    "badge": "Universal",
    "icon": "fa-mobile-screen",
    "image": "assets/images/productos/cable-usb-a-a-c.png"
  },
  {
    "id": "cable-de-poder-pc",
    "category": "cables",
    "name": "Cable de Poder AC para PC / Monitor",
    "specs": "Cable de alimentación eléctrica tipo trébol / interlock para conectar computadoras de escritorio, monitores o impresoras a 110V/220V.",
    "price": 4,
    "stockStatus": "in_stock",
    "badge": "Repuesto",
    "icon": "fa-plug",
    "image": "assets/images/productos/cable-de-poder-pc.png"
  },
  {
    "id": "bateria-3v-cr2032",
    "category": "componentes",
    "name": "Batería 3V CR2032 de Litio para Tarjeta Madre",
    "specs": "Pila de litio de alta duración para mantener la hora y configuración del BIOS / CMOS en laptops y PCs de escritorio.",
    "price": 3,
    "stockStatus": "in_stock",
    "badge": "Esencial",
    "icon": "fa-battery-half",
    "image": "assets/images/productos/bateria-3v-cr2032.png"
  },
  {
    "id": "cable-de-red-rj45",
    "category": "cables",
    "name": "Cable de Red Ethernet RJ45 Patch Cord",
    "specs": "Cable de red categoría 5e/6 con conectores RJ45 ponchados de fábrica. Conexión a internet rápida, sin caídas ni pérdidas de paquetes.",
    "price": 3,
    "stockStatus": "in_stock",
    "badge": "Internet",
    "icon": "fa-network-wired",
    "image": "assets/images/productos/cable-de-red-rj45.png"
  },
  {
    "id": "cable-sata-datos",
    "category": "cables",
    "name": "Cable SATA de Datos para Discos y Tarjeta Madre",
    "specs": "Cable SATA III de 6 Gbps con traba metálica de seguridad para conectar discos SSD o HDD mecánicos a la tarjeta madre.",
    "price": 2,
    "stockStatus": "in_stock",
    "badge": "Conector",
    "icon": "fa-hard-drive",
    "image": "assets/images/productos/cable-sata-datos.png"
  },
  {
    "id": "tarjeta-video-rtx-5060",
    "category": "componentes",
    "name": "Tarjeta de Video RTX Gaming (Agotada)",
    "specs": "Unidad gráfica dedicada de alta gama para videojuegos AAA y renderizado. Temporalmente agotada. Consulta disponibilidad de próximos lotes.",
    "price": 0,
    "stockStatus": "out_of_stock",
    "badge": "Agotada",
    "icon": "fa-vr-cardboard",
    "image": "assets/images/productos/tarjeta-video-rtx-5060.png"
  },
  {
    "id": "ssd-nvme-1tb",
    "category": "ssd",
    "name": "SSD M.2 NVMe PCIe Gen3x4 1TB",
    "specs": "Velocidad hasta 3500 MB/s lectura. Formato 2280 estándar para Laptops y PCs de alto rendimiento.",
    "price": 65,
    "stockStatus": "in_stock",
    "badge": "Más Vendido",
    "icon": "fa-hard-drive"
  },
  {
    "id": "ssd-nvme-512gb",
    "category": "ssd",
    "name": "SSD M.2 NVMe PCIe 512GB",
    "specs": "Ideal para revitalizar tu equipo con arranque ultrarrápido y carga instantánea de programas de diseño.",
    "price": 42,
    "stockStatus": "in_stock",
    "badge": "Recomendado",
    "icon": "fa-hard-drive"
  },
  {
    "id": "ssd-2230-512gb",
    "category": "ssd",
    "name": "SSD M.2 2230 NVMe 512GB Compacto",
    "specs": "Formato ultra corto (30mm) para consolas Steam Deck, ROG Ally y tablets Microsoft Surface.",
    "price": 55,
    "stockStatus": "in_stock",
    "badge": "Especial",
    "icon": "fa-microchip"
  },
  {
    "id": "ram-ddr4-16gb",
    "category": "ram",
    "name": "Memoria RAM 16GB DDR4 3200MHz",
    "specs": "Disponible para Laptop (SO-DIMM) y PC Escritorio (UDIMM). Disipador de calor incluido.",
    "price": 42,
    "stockStatus": "in_stock",
    "badge": "Alta Demanda",
    "icon": "fa-memory"
  },
  {
    "id": "pasta-termica-premium",
    "category": "componentes",
    "name": "Pasta Térmica Alta Conductividad 4g",
    "specs": "Compuesto térmico de alto rendimiento sin conductividad eléctrica. Baja temperaturas hasta 12°C.",
    "price": 14,
    "stockStatus": "in_stock",
    "badge": "Mantenimiento",
    "icon": "fa-temperature-arrow-down"
  }
];

  let productsData = [];

  // =========================================================================
  // 2. SISTEMA DE NOTIFICACIONES TOAST FLOTANTES
  // =========================================================================
  function showToast(message, type = 'success') {
    let container = document.getElementById('toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toast-container';
      container.className = 'toast-container';
      document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;

    let icon = 'fa-check-circle';
    if (type === 'error') icon = 'fa-triangle-exclamation';
    if (type === 'warning') icon = 'fa-bell';
    if (type === 'info') icon = 'fa-circle-info';

    toast.innerHTML = `<i class="fa-solid ${icon}"></i> <span>${message}</span>`;
    container.appendChild(toast);

    setTimeout(() => {
      toast.style.animation = 'slideToastOut 0.3s forwards';
      setTimeout(() => toast.remove(), 300);
    }, 3500);
  }

  // =========================================================================
  // 3. INICIALIZACIÓN PRINCIPAL
  // =========================================================================
  function initAdminApp() {
    // Referencias DOM
    const loginScreen = document.getElementById('admin-login-screen');
    const dashboardScreen = document.getElementById('admin-dashboard-screen');
    const loginForm = document.getElementById('admin-login-form');
    const pinInput = document.getElementById('admin-pin-input');
    const pinError = document.getElementById('admin-pin-error');
    const pinErrorText = document.getElementById('admin-pin-error-text');
    const pinToggleBtn = document.getElementById('admin-pin-toggle-btn');
    const pinEyeIcon = document.getElementById('admin-pin-eye-icon');
    const logoutBtn = document.getElementById('admin-logout-btn');
    const quickFillPinBtn = document.getElementById('btn-quick-fill-pin');

    const themeToggleBtn = document.getElementById('theme-toggle-btn');
    const themeIcon = document.getElementById('theme-icon');
    const themeText = document.getElementById('theme-text');

    const kpiTotal = document.getElementById('kpi-total-products');
    const kpiInStock = document.getElementById('kpi-in-stock');
    const kpiLowStock = document.getElementById('kpi-low-stock');
    const kpiOutOfStock = document.getElementById('kpi-out-of-stock');
    const tabInventoryCounter = document.getElementById('tab-inventory-counter');

    const inventoryList = document.getElementById('admin-inventory-list');
    const searchInput = document.getElementById('admin-search-input');
    const filterCategory = document.getElementById('admin-filter-category');
    const filterStock = document.getElementById('admin-filter-stock');
    const refreshBtn = document.getElementById('admin-refresh-btn');

    const productForm = document.getElementById('admin-product-form');
    const editIdInput = document.getElementById('product-edit-id');
    const nameInput = document.getElementById('product-name');
    const categorySelect = document.getElementById('product-category');
    const priceInput = document.getElementById('product-price');
    const stockSelect = document.getElementById('product-stock-status');
    const badgeInput = document.getElementById('product-badge');
    const iconSelect = document.getElementById('product-icon');
    const specsTextarea = document.getElementById('product-specs');
    const imageFileInput = document.getElementById('product-image-file');
    const imageDataInput = document.getElementById('product-image-data');
    const imagePreviewImg = document.getElementById('product-image-preview-img');
    const imagePlaceholder = document.getElementById('product-image-preview-placeholder');
    const btnRemoveImage = document.getElementById('btn-remove-image');
    const btnCancelEdit = document.getElementById('btn-cancel-edit');
    const btnSubmitText = document.getElementById('btn-submit-text');
    const formHeadingTitle = document.getElementById('form-heading-title');
    const tabPublishLabel = document.getElementById('tab-publish-label');
    const btnQuickNewProduct = document.getElementById('btn-quick-new-product');

    const btnExportJson = document.getElementById('btn-export-json');
    const btnTriggerImportJson = document.getElementById('btn-trigger-import-json');
    const inputImportJson = document.getElementById('input-import-json');
    const formChangePin = document.getElementById('form-change-pin');
    const changePinCurrent = document.getElementById('change-pin-current');
    const changePinNew = document.getElementById('change-pin-new');
    const btnResetCatalog = document.getElementById('btn-reset-catalog');

    // -----------------------------------------------------------------------
    // CONTROL DE TEMA (CLARO / OSCURO)
    // -----------------------------------------------------------------------
    function applyThemeUI(theme) {
      const isDark = theme === 'dark';
      document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
      if (themeIcon) {
        themeIcon.className = isDark ? 'fa-solid fa-sun theme-icon' : 'fa-solid fa-moon theme-icon';
      }
      if (themeText) {
        themeText.textContent = isDark ? 'Modo Claro' : 'Modo Oscuro';
      }
    }

    const savedTheme = safeStorageGet(STORAGE_KEY_THEME) || 'light';
    applyThemeUI(savedTheme);

    if (themeToggleBtn) {
      themeToggleBtn.addEventListener('click', () => {
        const current = document.documentElement.getAttribute('data-theme') || 'light';
        const next = current === 'dark' ? 'light' : 'dark';
        safeStorageSet(STORAGE_KEY_THEME, next);
        applyThemeUI(next);
        showToast(`Tema cambiado a ${next === 'dark' ? 'Modo Oscuro' : 'Modo Claro'}`, 'info');
      });
    }

    // -----------------------------------------------------------------------
    // CONTROL DE PESTAÑAS (TABS) - ULTRA ROBUSTO
    // -----------------------------------------------------------------------
    function switchTab(targetTabId) {
      if (!targetTabId) return;

      // Extraer la clave base: 'inventory', 'publish' o 'settings'
      const key = String(targetTabId).toLowerCase().replace(/^(tab-)?(content-)?/, '');

      const tabBtns = document.querySelectorAll('.admin-tab-btn');
      const tabContents = document.querySelectorAll('.admin-tab-content');

      tabBtns.forEach(btn => {
        const btnKey = (btn.getAttribute('data-tab') || '').toLowerCase().replace(/^(tab-)?(content-)?/, '');
        const isActive = btnKey === key;
        btn.classList.toggle('active', isActive);
        btn.setAttribute('aria-selected', isActive ? 'true' : 'false');
      });

      tabContents.forEach(content => {
        const contentKey = (content.id || '').toLowerCase().replace(/^(tab-)?(content-)?/, '');
        const isActive = contentKey === key;
        content.classList.toggle('active', isActive);
        content.style.display = isActive ? 'block' : 'none';
      });
    }

    // Delegación de eventos para clicks en pestañas
    document.addEventListener('click', (e) => {
      const tabBtn = e.target.closest('.admin-tab-btn');
      if (tabBtn) {
        const tabTarget = tabBtn.getAttribute('data-tab');
        switchTab(tabTarget);
      }
    });

    if (btnQuickNewProduct) {
      btnQuickNewProduct.addEventListener('click', () => {
        resetProductForm();
        switchTab('publish');
        if (nameInput) nameInput.focus();
      });
    }

    // -----------------------------------------------------------------------
    // CARGA Y PERSISTENCIA DE DATOS
    // -----------------------------------------------------------------------
    const CATALOG_VERSION_KEY = 'softproca-catalog-v2026-10-15';

    function loadCatalog() {
      try {
        const storedVersion = safeStorageGet('softproca-catalog-version');
        const stored = safeStorageGet(STORAGE_KEY_CATALOG);
        if (stored && storedVersion === CATALOG_VERSION_KEY) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) {
            productsData = parsed.map(p => ({
              ...p,
              id: p.id || `prod-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
              name: p.name || 'Producto',
              category: p.category || 'ssd',
              price: Number(p.price) || 0,
              stockStatus: p.stockStatus || 'in_stock'
            }));
            return;
          }
        }
      } catch (e) {
        console.warn('Error al cargar catálogo desde almacenamiento:', e);
      }
      productsData = JSON.parse(JSON.stringify(DEFAULT_PRODUCTS));
      saveCatalog(false);
      safeStorageSet('softproca-catalog-version', CATALOG_VERSION_KEY);
    }

    function saveCatalog(triggerRerender = true) {
      try {
        const rawJson = JSON.stringify(productsData);
        safeStorageSet(STORAGE_KEY_CATALOG, rawJson);

        // Emitir a través de BroadcastChannel a todas las pestañas de la tienda
        try {
          if (typeof BroadcastChannel !== 'undefined') {
            const bc = new BroadcastChannel('softproca_catalog_channel');
            bc.postMessage({ type: 'CATALOG_UPDATED', timestamp: Date.now() });
          }
        } catch (bcErr) {}

        // Emitir evento local en window
        window.dispatchEvent(new CustomEvent('softproca-catalog-changed', { detail: { products: productsData } }));
      } catch (e) {
        console.error('Error guardando catálogo:', e);
        showToast('Error de almacenamiento. Si usaste una imagen muy pesada, elimínala.', 'error');
      }

      if (triggerRerender) {
        renderInventory();
        updateKpis();
      }
    }

    // -----------------------------------------------------------------------
    // ACTUALIZACIÓN DE CONTADORES / KPIS
    // -----------------------------------------------------------------------
    function updateKpis() {
      if (!Array.isArray(productsData)) return;

      const total = productsData.length;
      const inStock = productsData.filter(p => p.stockStatus === 'in_stock').length;
      const lowStock = productsData.filter(p => p.stockStatus === 'low_stock').length;
      const outOfStock = productsData.filter(p => p.stockStatus === 'out_of_stock').length;

      if (kpiTotal) kpiTotal.textContent = total;
      if (kpiInStock) kpiInStock.textContent = inStock;
      if (kpiLowStock) kpiLowStock.textContent = lowStock;
      if (kpiOutOfStock) kpiOutOfStock.textContent = outOfStock;
      if (tabInventoryCounter) tabInventoryCounter.textContent = total;
    }

    // -----------------------------------------------------------------------
    // RENDERIZADO DE INVENTARIO
    // -----------------------------------------------------------------------
    function renderInventory() {
      if (!inventoryList) return;

      const searchTerm = (searchInput ? searchInput.value : '').toLowerCase().trim();
      const catFilter = filterCategory ? filterCategory.value : 'all';
      const stockFilter = filterStock ? filterStock.value : 'all';

      const filtered = productsData.filter(product => {
        const nameMatch = (product.name || '').toLowerCase().includes(searchTerm);
        const specsMatch = (product.specs || '').toLowerCase().includes(searchTerm);
        const badgeMatch = (product.badge || '').toLowerCase().includes(searchTerm);
        const matchSearch = !searchTerm || nameMatch || specsMatch || badgeMatch;

        const matchCat = catFilter === 'all' || product.category === catFilter;
        const matchStock = stockFilter === 'all' || product.stockStatus === stockFilter;

        return matchSearch && matchCat && matchStock;
      });

      if (filtered.length === 0) {
        inventoryList.innerHTML = `
          <div style="text-align: center; padding: 40px 20px; background: var(--sp-bg-inner); border-radius: var(--sp-radius-md); border: 1px dashed var(--sp-border);">
            <i class="fa-solid fa-box-archive" style="font-size: 2.2rem; color: var(--sp-text-muted); margin-bottom: 12px; display: block;"></i>
            <h4 style="color: var(--sp-heading-color); margin-bottom: 6px;">No se encontraron productos</h4>
            <p style="font-size: 0.85rem; color: var(--sp-text-secondary); margin-bottom: 16px;">Prueba ajustando los filtros o publica un nuevo producto ahora.</p>
            <button type="button" class="btn btn-primary btn-sm" id="btn-empty-create">
              <i class="fa-solid fa-plus"></i> Publicar Nuevo Producto
            </button>
          </div>
        `;
        const btnEmptyCreate = document.getElementById('btn-empty-create');
        if (btnEmptyCreate) {
          btnEmptyCreate.addEventListener('click', () => {
            resetProductForm();
            switchTab('publish');
          });
        }
        return;
      }

      const categoryLabels = {
        'ssd': 'Discos SSD',
        'componentes': 'Componentes & Hardware',
        'cables': 'Cables & Adaptadores',
        'perifericos': 'Periféricos',
        'impresoras': 'Impresoras & Tóner',
        'ram': 'Memorias RAM',
        'coleccion': 'Colección',
        'software': 'Software'
      };

      inventoryList.innerHTML = filtered.map(product => {
        const safeId = escapeHtml(product.id);
        const safeName = escapeHtml(product.name);
        const safeCategory = escapeHtml(categoryLabels[product.category] || product.category || 'General');
        const safeBadge = product.badge ? escapeHtml(product.badge) : '';
        const safePrice = Number(product.price || 0).toFixed(2);
        const safeIcon = escapeHtml(product.icon || 'fa-hard-drive');
        const currentStock = product.stockStatus || 'in_stock';

        const thumbHtml = product.image
          ? `<img src="${product.image}" alt="${safeName}">`
          : `<i class="fa-solid ${safeIcon}"></i>`;

        return `
          <div class="admin-inventory-item" data-id="${safeId}">
            <div class="admin-item-thumb">
              ${thumbHtml}
            </div>

            <div class="admin-item-info">
              <h4>${safeName}</h4>
              <div class="admin-item-meta">
                <span><i class="fa-solid fa-tag"></i> ${safeCategory}</span>
                ${safeBadge ? `<span>&bull; <strong style="color: var(--sp-orange);">${safeBadge}</strong></span>` : ''}
              </div>
            </div>

            <div class="admin-item-price">
              $${safePrice}
            </div>

            <div>
              <select class="admin-stock-select ${currentStock}" data-stock-id="${safeId}" aria-label="Cambiar disponibilidad de ${safeName}">
                <option value="in_stock" ${currentStock === 'in_stock' ? 'selected' : ''}>🟢 En Stock</option>
                <option value="low_stock" ${currentStock === 'low_stock' ? 'selected' : ''}>🟡 Pocas Unidades</option>
                <option value="out_of_stock" ${currentStock === 'out_of_stock' ? 'selected' : ''}>🔴 Agotado</option>
              </select>
            </div>

            <div class="admin-item-actions">
              <button class="btn-icon-action btn-edit-product" data-id="${safeId}" title="Editar producto">
                <i class="fa-solid fa-pen-to-square"></i>
              </button>
              <button class="btn-icon-action delete btn-delete-product" data-id="${safeId}" title="Eliminar producto">
                <i class="fa-solid fa-trash-can"></i>
              </button>
            </div>
          </div>
        `;
      }).join('');

      // Eventos para el selector rápido de stock
      inventoryList.querySelectorAll('.admin-stock-select').forEach(select => {
        select.addEventListener('change', () => {
          const prodId = select.getAttribute('data-stock-id');
          const newStatus = select.value;
          const targetProd = productsData.find(p => p.id === prodId);
          if (targetProd) {
            targetProd.stockStatus = newStatus;
            saveCatalog(false);
            updateKpis();
            select.className = `admin-stock-select ${newStatus}`;

            const labelMap = {
              'in_stock': 'En Stock (Disponible)',
              'low_stock': 'Pocas Unidades',
              'out_of_stock': 'Agotado'
            };
            showToast(`"${targetProd.name}" cambiado a: ${labelMap[newStatus] || newStatus}`, 'success');
          }
        });
      });

      // Eventos para editar producto
      inventoryList.querySelectorAll('.btn-edit-product').forEach(btn => {
        btn.addEventListener('click', () => {
          const prodId = btn.getAttribute('data-id');
          editProduct(prodId);
        });
      });

      // Eventos para eliminar producto
      inventoryList.querySelectorAll('.btn-delete-product').forEach(btn => {
        btn.addEventListener('click', () => {
          const prodId = btn.getAttribute('data-id');
          deleteProduct(prodId);
        });
      });
    }

    if (searchInput) searchInput.addEventListener('input', renderInventory);
    if (filterCategory) filterCategory.addEventListener('change', renderInventory);
    if (filterStock) filterStock.addEventListener('change', renderInventory);
    if (refreshBtn) {
      refreshBtn.addEventListener('click', () => {
        loadCatalog();
        renderInventory();
        updateKpis();
        showToast('Catálogo sincronizado.', 'info');
      });
    }

    // -----------------------------------------------------------------------
    // GESTIÓN DEL FORMULARIO DE PUBLICACIÓN / EDICIÓN
    // -----------------------------------------------------------------------
    function resetProductForm() {
      if (!productForm) return;
      productForm.reset();
      if (editIdInput) editIdInput.value = '';
      if (imageDataInput) imageDataInput.value = '';
      if (imageFileInput) imageFileInput.value = '';

      if (imagePreviewImg) {
        imagePreviewImg.src = '';
        imagePreviewImg.style.display = 'none';
      }
      if (imagePlaceholder) imagePlaceholder.style.display = 'block';
      if (btnRemoveImage) btnRemoveImage.style.display = 'none';
      if (btnCancelEdit) btnCancelEdit.style.display = 'none';

      if (btnSubmitText) btnSubmitText.textContent = 'Guardar y Publicar en Tienda';
      if (formHeadingTitle) {
        formHeadingTitle.innerHTML = '<i class="fa-solid fa-plus-circle" style="color: var(--sp-orange);"></i> Publicar Nuevo Producto';
      }
      if (tabPublishLabel) tabPublishLabel.textContent = 'Publicar Producto';
    }

    function editProduct(productId) {
      const product = productsData.find(p => p.id === productId);
      if (!product) return;

      if (editIdInput) editIdInput.value = product.id;
      if (nameInput) nameInput.value = product.name || '';
      if (categorySelect) categorySelect.value = product.category || 'ssd';
      if (priceInput) priceInput.value = product.price || '';
      if (stockSelect) stockSelect.value = product.stockStatus || 'in_stock';
      if (badgeInput) badgeInput.value = product.badge || '';
      if (iconSelect) iconSelect.value = product.icon || 'fa-hard-drive';
      if (specsTextarea) specsTextarea.value = product.specs || '';

      if (product.image) {
        if (imageDataInput) imageDataInput.value = product.image;
        if (imagePreviewImg) {
          imagePreviewImg.src = product.image;
          imagePreviewImg.style.display = 'block';
        }
        if (imagePlaceholder) imagePlaceholder.style.display = 'none';
        if (btnRemoveImage) btnRemoveImage.style.display = 'flex';
      } else {
        if (imageDataInput) imageDataInput.value = '';
        if (imagePreviewImg) {
          imagePreviewImg.src = '';
          imagePreviewImg.style.display = 'none';
        }
        if (imagePlaceholder) imagePlaceholder.style.display = 'block';
        if (btnRemoveImage) btnRemoveImage.style.display = 'none';
      }

      if (btnCancelEdit) btnCancelEdit.style.display = 'inline-flex';
      if (btnSubmitText) btnSubmitText.textContent = 'Actualizar Datos del Producto';
      if (formHeadingTitle) {
        formHeadingTitle.innerHTML = `<i class="fa-solid fa-pen-to-square" style="color: var(--sp-orange);"></i> Editar: ${escapeHtml(product.name)}`;
      }
      if (tabPublishLabel) tabPublishLabel.textContent = 'Editando Producto';

      switchTab('publish');
      if (nameInput) nameInput.focus();
    }

    function deleteProduct(productId) {
      const product = productsData.find(p => p.id === productId);
      if (!product) return;

      const confirmDelete = window.confirm(`¿Estás seguro de que deseas eliminar permanentemente "${product.name}" del catálogo?`);
      if (confirmDelete) {
        productsData = productsData.filter(p => p.id !== productId);
        saveCatalog();
        showToast(`"${product.name}" eliminado del catálogo.`, 'info');
      }
    }

    if (btnCancelEdit) {
      btnCancelEdit.addEventListener('click', () => {
        resetProductForm();
        switchTab('inventory');
      });
    }

    // Compresión automática de imágenes mediante HTML5 Canvas
    if (imageFileInput) {
      imageFileInput.addEventListener('change', (e) => {
        const file = e.target.files && e.target.files[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
          showToast('El archivo seleccionado debe ser una imagen válida.', 'error');
          imageFileInput.value = '';
          return;
        }

        const reader = new FileReader();
        reader.onload = (readerEvent) => {
          const img = new Image();
          img.onload = () => {
            const MAX_SIZE = 600;
            let width = img.width;
            let height = img.height;

            if (width > height) {
              if (width > MAX_SIZE) {
                height = Math.round((height * MAX_SIZE) / width);
                width = MAX_SIZE;
              }
            } else {
              if (height > MAX_SIZE) {
                width = Math.round((width * MAX_SIZE) / height);
                height = MAX_SIZE;
              }
            }

            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, width, height);

            const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.82);
            if (imageDataInput) imageDataInput.value = compressedDataUrl;
            if (imagePreviewImg) {
              imagePreviewImg.src = compressedDataUrl;
              imagePreviewImg.style.display = 'block';
            }
            if (imagePlaceholder) imagePlaceholder.style.display = 'none';
            if (btnRemoveImage) btnRemoveImage.style.display = 'flex';
            showToast('Foto optimizada y lista para publicar.', 'success');
          };
          img.src = readerEvent.target.result;
        };
        reader.readAsDataURL(file);
      });
    }

    if (btnRemoveImage) {
      btnRemoveImage.addEventListener('click', () => {
        if (imageDataInput) imageDataInput.value = '';
        if (imagePreviewImg) {
          imagePreviewImg.src = '';
          imagePreviewImg.style.display = 'none';
        }
        if (imagePlaceholder) imagePlaceholder.style.display = 'block';
        if (btnRemoveImage) btnRemoveImage.style.display = 'none';
        if (imageFileInput) imageFileInput.value = '';
      });
    }

    // Envío del formulario de producto
    if (productForm) {
      productForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const editId = editIdInput ? editIdInput.value.trim() : '';
        const name = nameInput ? nameInput.value.trim() : '';
        const category = categorySelect ? categorySelect.value : 'ssd';
        const price = priceInput ? parseFloat(priceInput.value) : 0;
        const stockStatus = stockSelect ? stockSelect.value : 'in_stock';
        const badge = badgeInput ? badgeInput.value.trim() : '';
        const icon = iconSelect ? iconSelect.value : 'fa-hard-drive';
        const specs = specsTextarea ? specsTextarea.value.trim() : '';
        const image = imageDataInput ? imageDataInput.value.trim() : '';

        if (!name) {
          showToast('Escribe el nombre del producto.', 'warning');
          if (nameInput) nameInput.focus();
          return;
        }

        if (isNaN(price) || price <= 0) {
          showToast('Escribe un precio en USD válido (mayor a 0).', 'warning');
          if (priceInput) priceInput.focus();
          return;
        }

        if (!specs) {
          showToast('Escribe las especificaciones o descripción del producto.', 'warning');
          if (specsTextarea) specsTextarea.focus();
          return;
        }

        if (editId) {
          // Edición
          const index = productsData.findIndex(p => p.id === editId);
          if (index !== -1) {
            productsData[index] = {
              ...productsData[index],
              name,
              category,
              price,
              stockStatus,
              badge: badge || undefined,
              icon,
              specs,
              image: image || undefined
            };
            saveCatalog();
            showToast(`¡"${name}" actualizado exitosamente!`, 'success');
          }
        } else {
          // Creación
          const newProduct = {
            id: `prod-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
            name,
            category,
            price,
            stockStatus,
            badge: badge || undefined,
            icon,
            specs,
            image: image || undefined
          };
          productsData.unshift(newProduct);
          saveCatalog();
          showToast(`¡"${name}" publicado en la tienda pública!`, 'success');
        }

        resetProductForm();
        switchTab('inventory');
      });
    }

    // -----------------------------------------------------------------------
    // HERRAMIENTAS DE RESPALDO, SEGURIDAD & PIN
    // -----------------------------------------------------------------------
    if (btnExportJson) {
      btnExportJson.addEventListener('click', () => {
        try {
          const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(productsData, null, 2));
          const downloadAnchor = document.createElement('a');
          const dateStr = new Date().toISOString().slice(0, 10);
          downloadAnchor.setAttribute('href', dataStr);
          downloadAnchor.setAttribute('download', `catalogo-softproca-backup-${dateStr}.json`);
          document.body.appendChild(downloadAnchor);
          downloadAnchor.click();
          downloadAnchor.remove();
          showToast('Copia de seguridad descargada (.JSON).', 'success');
        } catch (e) {
          showToast('Error al exportar catálogo.', 'error');
        }
      });
    }

    if (btnTriggerImportJson && inputImportJson) {
      btnTriggerImportJson.addEventListener('click', () => {
        inputImportJson.click();
      });

      inputImportJson.addEventListener('change', (e) => {
        const file = e.target.files && e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
          try {
            const parsed = JSON.parse(event.target.result);
            if (Array.isArray(parsed) && parsed.length > 0) {
              productsData = parsed.map(p => ({
                ...p,
                id: p.id || `prod-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
                stockStatus: p.stockStatus || 'in_stock'
              }));
              saveCatalog();
              showToast(`¡Catálogo restaurado! ${parsed.length} productos cargados.`, 'success');
              switchTab('inventory');
            } else {
              showToast('El archivo JSON no contiene un catálogo válido.', 'error');
            }
          } catch (err) {
            showToast('Formato JSON inválido.', 'error');
          }
          inputImportJson.value = '';
        };
        reader.readAsText(file);
      });
    }

    if (formChangePin && changePinCurrent && changePinNew) {
      formChangePin.addEventListener('submit', (e) => {
        e.preventDefault();
        const cur = changePinCurrent.value.trim();
        const nw = changePinNew.value.trim();
        const validPin = safeStorageGet(STORAGE_KEY_PIN) || DEFAULT_PIN;

        if (cur !== validPin) {
          showToast('El PIN actual no coincide.', 'error');
          changePinCurrent.focus();
          return;
        }

        if (nw.length < 4) {
          showToast('El nuevo PIN debe tener al menos 4 dígitos.', 'warning');
          changePinNew.focus();
          return;
        }

        safeStorageSet(STORAGE_KEY_PIN, nw);
        showToast('¡PIN de acceso actualizado con éxito!', 'success');
        formChangePin.reset();
      });
    }

    if (btnResetCatalog) {
      btnResetCatalog.addEventListener('click', () => {
        const confirmReset = window.confirm('¿Restablecer el catálogo a los productos originales de SOFTPROCA? Se perderán las modificaciones manuales.');
        if (confirmReset) {
          productsData = JSON.parse(JSON.stringify(DEFAULT_PRODUCTS));
          saveCatalog();
          showToast('Catálogo restablecido de fábrica.', 'info');
          switchTab('inventory');
        }
      });
    }

    // -----------------------------------------------------------------------
    // GESTIÓN DE SESIÓN & LOGIN POR PIN
    // -----------------------------------------------------------------------
    function showDashboardView() {
      if (loginScreen) loginScreen.style.display = 'none';
      if (dashboardScreen) dashboardScreen.style.display = 'flex';
      loadCatalog();
      renderInventory();
      updateKpis();
      switchTab('inventory');
    }

    function showLoginView() {
      if (dashboardScreen) dashboardScreen.style.display = 'none';
      if (loginScreen) {
        loginScreen.style.display = 'flex';
        if (pinInput) {
          pinInput.value = '';
          pinInput.focus();
        }
        if (pinError) pinError.style.display = 'none';
      }
    }

    // Comprobación inicial de sesión
    const isAuthed = safeStorageGet(SESSION_AUTH_KEY, true) === 'true';
    if (isAuthed) {
      showDashboardView();
    } else {
      showLoginView();
    }

    // Alternar visibilidad del PIN
    if (pinToggleBtn && pinInput && pinEyeIcon) {
      pinToggleBtn.addEventListener('click', () => {
        const isPassword = pinInput.getAttribute('type') === 'password';
        pinInput.setAttribute('type', isPassword ? 'text' : 'password');
        pinEyeIcon.className = isPassword ? 'fa-solid fa-eye-slash' : 'fa-solid fa-eye';
      });
    }

    // Botón de ayuda para autocompletar 1234
    if (quickFillPinBtn && pinInput) {
      quickFillPinBtn.addEventListener('click', () => {
        pinInput.value = safeStorageGet(STORAGE_KEY_PIN) || DEFAULT_PIN;
        pinInput.focus();
      });
    }

    // Formulario de login
    if (loginForm && pinInput) {
      loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const entered = pinInput.value.trim();
        const validPin = safeStorageGet(STORAGE_KEY_PIN) || DEFAULT_PIN;

        if (entered === validPin) {
          safeStorageSet(SESSION_AUTH_KEY, 'true', true);
          if (pinError) pinError.style.display = 'none';
          showDashboardView();
          showToast('¡Acceso concedido! Bienvenido al panel privado.', 'success');
        } else {
          if (pinError) {
            pinError.style.display = 'flex';
            if (pinErrorText) pinErrorText.textContent = 'PIN incorrecto. Intenta nuevamente.';
          }
          pinInput.value = '';
          pinInput.focus();
        }
      });
    }

    // Cerrar sesión
    if (logoutBtn) {
      logoutBtn.addEventListener('click', () => {
        safeStorageRemove(SESSION_AUTH_KEY, true);
        showLoginView();
        showToast('Sesión cerrada.', 'info');
      });
    }
  }

  // Ejecutar inmediatamente o al cargar el DOM
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAdminApp);
  } else {
    initAdminApp();
  }

})();
