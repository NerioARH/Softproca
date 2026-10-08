/**
 * SOFTPROCA - Plataforma Web Oficial
 * "¡Somos tu aliado tecnológico!"
 * Teléfono / Soporte WhatsApp: +58 4246402032
 */

document.addEventListener('DOMContentLoaded', () => {
  // Configuración Global
  const WHATSAPP_PHONE = '584246402032';

  // =========================================================================
  // GESTOR DE TEMA (MODO OSCURO / CLARO / DETECCIÓN AUTOMÁTICA DEL DISPOSITIVO)
  // =========================================================================
  const themeToggleBtn = document.getElementById('theme-toggle-btn');
  const themeIcon = document.getElementById('theme-icon');
  const themeText = document.getElementById('theme-text');

  // Referencias seguras para el mapa (previene TDZ ReferenceError)
  let mapInstance = null;
  let currentMapTileLayer = null;

  function updateMapTileTheme(theme) {
    try {
      if (!mapInstance || typeof L === 'undefined') return;
      if (currentMapTileLayer) {
        mapInstance.removeLayer(currentMapTileLayer);
      }

      // Capa de mapa: Dark Matter para tema oscuro, Voyager para tema claro
      const tileUrl = theme === 'dark'
        ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
        : 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png';

      currentMapTileLayer = L.tileLayer(tileUrl, {
        attribution: '&copy; <a href="https://carto.com/">CARTO</a> &copy; OpenStreetMap',
        maxZoom: 19
      }).addTo(mapInstance);
    } catch (err) {
      console.warn('Map theme update ignored:', err);
    }
  }

  function safeGetStoredTheme() {
    try {
      return localStorage.getItem('softproca-theme');
    } catch (e) {
      return null;
    }
  }

  function safeSetStoredTheme(theme) {
    try {
      localStorage.setItem('softproca-theme', theme);
    } catch (e) {
      // Ignorar si el navegador bloquea localStorage en entorno local/sandbox
    }
  }

  function applyTheme(theme, isManual = false) {
    try {
      const activeTheme = theme === 'dark' ? 'dark' : 'light';
      document.documentElement.setAttribute('data-theme', activeTheme);
      if (document.body) {
        document.body.setAttribute('data-theme', activeTheme);
      }

      if (isManual) {
        safeSetStoredTheme(activeTheme);
      }

      // Actualizar texto e icono del botón
      const currentIcon = document.getElementById('theme-icon') || themeIcon;
      const currentText = document.getElementById('theme-text') || themeText;
      const currentBtn = document.getElementById('theme-toggle-btn') || themeToggleBtn;

      if (activeTheme === 'dark') {
        if (currentIcon) currentIcon.className = 'fa-solid fa-sun theme-icon';
        if (currentText) currentText.textContent = 'Modo Claro';
        if (currentBtn) {
          currentBtn.setAttribute('title', 'Modo Oscuro activo. Clic para cambiar a Modo Claro');
          currentBtn.setAttribute('aria-pressed', 'true');
        }
      } else {
        if (currentIcon) currentIcon.className = 'fa-solid fa-moon theme-icon';
        if (currentText) currentText.textContent = 'Modo Oscuro';
        if (currentBtn) {
          currentBtn.setAttribute('title', 'Modo Claro activo. Clic para cambiar a Modo Oscuro');
          currentBtn.setAttribute('aria-pressed', 'false');
        }
      }

      // Actualizar mapa si está inicializado
      updateMapTileTheme(activeTheme);
    } catch (e) {
      console.error('Error applying theme:', e);
    }
  }

  // Cargar preferencia guardada o por defecto MODO CLARO (blanco predominante de la marca)
  const savedTheme = safeGetStoredTheme();
  const initialTheme = savedTheme === 'dark' ? 'dark' : 'light';
  applyTheme(initialTheme, false);

  // Función para alternar el tema
  function toggleThemeAction(e) {
    if (e && e.preventDefault) {
      e.preventDefault();
    }
    const current = document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
    const next = current === 'dark' ? 'light' : 'dark';
    applyTheme(next, true);
  }

  // Exponer a nivel global para que funcione también vía onclick inline o consola
  window.toggleSoftprocaTheme = toggleThemeAction;

  // Escuchar clic manual en el botón de tema
  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', toggleThemeAction);
  }

  // Delegación de eventos para capturar clicks incluso en iconos o spans internos
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('#theme-toggle-btn');
    if (btn && btn !== themeToggleBtn) {
      toggleThemeAction(e);
    }
  });

  // Escuchar cambios del sistema en tiempo real si el usuario no ha forzado uno manual
  if (window.matchMedia) {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleSystemChange = (e) => {
      const manual = safeGetStoredTheme();
      if (!manual) {
        applyTheme(e.matches ? 'dark' : 'light', false);
      }
    };
    if (typeof mediaQuery.addEventListener === 'function') {
      mediaQuery.addEventListener('change', handleSystemChange);
    } else if (typeof mediaQuery.addListener === 'function') {
      mediaQuery.addListener(handleSystemChange);
    }
  }

  // =========================================================================
  // 1. NAVEGACIÓN Y NAVBAR SCROLL
  // =========================================================================
  const navbar = document.querySelector('.navbar');
  const mobileToggle = document.querySelector('.mobile-toggle');
  const navLinks = document.querySelector('.nav-links');

  window.addEventListener('scroll', () => {
    if (window.scrollY > 40) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  });

  if (mobileToggle && navLinks) {
    mobileToggle.addEventListener('click', () => {
      navLinks.classList.toggle('active');
      const icon = mobileToggle.querySelector('i');
      if (icon) {
        icon.classList.toggle('fa-bars');
        icon.classList.toggle('fa-xmark');
      }
    });

    // Cerrar al dar click en un enlace en móvil
    navLinks.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        navLinks.classList.remove('active');
        const icon = mobileToggle.querySelector('i');
        if (icon) {
          icon.classList.add('fa-bars');
          icon.classList.remove('fa-xmark');
        }
      });
    });
  }

  // =========================================================================
  // SISTEMA DE NOTIFICACIONES TOAST (FEEDBACK FLOTANTE)
  // =========================================================================
  function showToast(message, type = 'success') {
    const container = document.getElementById('toast-container');
    if (!container) return;
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    let icon = 'fa-circle-check';
    if (type === 'error') icon = 'fa-circle-xmark';
    if (type === 'warning') icon = 'fa-triangle-exclamation';
    if (type === 'info') icon = 'fa-circle-info';

    toast.innerHTML = `<i class="fa-solid ${icon}"></i> <span>${message}</span>`;
    container.appendChild(toast);

    setTimeout(() => {
      toast.style.animation = 'slideToastOut 0.3s forwards';
      setTimeout(() => toast.remove(), 300);
    }, 3500);
  }

  // =========================================================================
  // 2. SISTEMA DE PRODUCTOS, INVENTARIO Y CARRITO / COTIZADOR
  // =========================================================================
  const DEFAULT_PRODUCTS = [
    {
      id: 'ssd-nvme-1tb',
      category: 'ssd',
      name: 'SSD M.2 NVMe PCIe Gen3x4 1TB',
      specs: 'Velocidad hasta 3500 MB/s lectura. Formato 2280 estándar para Laptops y PCs de alto rendimiento.',
      price: 65,
      stockStatus: 'in_stock',
      badge: 'Más Vendido',
      icon: 'fa-hard-drive'
    },
    {
      id: 'ssd-nvme-512gb',
      category: 'ssd',
      name: 'SSD M.2 NVMe PCIe 512GB',
      specs: 'Ideal para revitalizar tu equipo con arranque ultrarrápido y carga instantánea de programas de diseño.',
      price: 42,
      stockStatus: 'in_stock',
      badge: 'Recomendado',
      icon: 'fa-hard-drive'
    },
    {
      id: 'ssd-sata-m2',
      category: 'ssd',
      name: 'SSD M.2 SATA III 512GB (B&M Key)',
      specs: 'Compatibilidad con laptops ultradelgadas y tarjetas madres con puertos M.2 SATA (550 MB/s).',
      price: 38,
      stockStatus: 'in_stock',
      badge: 'Compatibilidad',
      icon: 'fa-hard-drive'
    },
    {
      id: 'ssd-2230-512gb',
      category: 'ssd',
      name: 'SSD M.2 2230 NVMe 512GB Compacto',
      specs: 'Formato ultra corto (30mm) para consolas Steam Deck, ROG Ally y tablets Microsoft Surface.',
      price: 55,
      stockStatus: 'in_stock',
      badge: 'Especial',
      icon: 'fa-microchip'
    },
    {
      id: 'ssd-sata-25-1tb',
      category: 'ssd',
      name: 'SSD 2.5" SATA III 1TB (Reemplazo HDD)',
      specs: 'Actualización directa para laptops y computadoras tradicionales. 10x más rápido que disco mecánico.',
      price: 58,
      stockStatus: 'in_stock',
      badge: 'Upgrade Clásico',
      icon: 'fa-database'
    },
    {
      id: 'ram-ddr4-16gb',
      category: 'ram',
      name: 'Memoria RAM 16GB DDR4 3200MHz',
      specs: 'Disponible para Laptop (SO-DIMM) y PC Escritorio (UDIMM). Disipador de calor incluido.',
      price: 42,
      stockStatus: 'in_stock',
      badge: 'Alta Demanda',
      icon: 'fa-memory'
    },
    {
      id: 'ram-ddr5-16gb',
      category: 'ram',
      name: 'Memoria RAM 16GB DDR5 5200MHz',
      specs: 'Máximo ancho de banda para Workstations modernas de arquitectura, render y renderizado 3D.',
      price: 59,
      stockStatus: 'in_stock',
      badge: 'Next-Gen',
      icon: 'fa-memory'
    },
    {
      id: 'caddy-hdd-adapter',
      category: 'componentes',
      name: 'Adaptador Caddy 9.5mm / 12.7mm',
      specs: 'Permite conservar tu disco HDD original en la bahía de DVD y poner el SSD en la bahía principal.',
      price: 12,
      stockStatus: 'in_stock',
      badge: 'Accesorio',
      icon: 'fa-screwdriver-wrench'
    },
    {
      id: 'pasta-termica-premium',
      category: 'componentes',
      name: 'Pasta Térmica Alta Conductividad 4g',
      specs: 'Compuesto térmico de alto rendimiento sin conductividad eléctrica. Baja temperaturas hasta 12°C.',
      price: 14,
      stockStatus: 'in_stock',
      badge: 'Mantenimiento',
      icon: 'fa-temperature-arrow-down'
    },
    {
      id: 'soft-pack-diseno',
      category: 'software',
      name: 'Pack Instalación Diseño & Arquitectura',
      specs: 'Instalación garantizada y optimizada de AutoCAD + Revit + 3ds Max + V-Ray + Adobe Suite.',
      price: 25,
      stockStatus: 'in_stock',
      badge: 'Servicio Top',
      icon: 'fa-laptop-code'
    }
  ];

  let productsData = [];

  function loadProductsCatalog() {
    try {
      const stored = localStorage.getItem('softproca-products-catalog');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          productsData = parsed.map(p => ({
            ...p,
            stockStatus: p.stockStatus || 'in_stock'
          }));
          return;
        }
      }
    } catch (e) {
      console.warn('Error cargando catálogo desde almacenamiento:', e);
    }
    productsData = JSON.parse(JSON.stringify(DEFAULT_PRODUCTS));
    saveProductsCatalog(false);
  }

  function saveProductsCatalog(reRender = true) {
    try {
      localStorage.setItem('softproca-products-catalog', JSON.stringify(productsData));
    } catch (e) {
      console.warn('Error guardando catálogo en localStorage:', e);
    }
    if (reRender) {
      if (typeof renderCatalog === 'function') renderCatalog();
      if (typeof renderAdminInventoryList === 'function') renderAdminInventoryList();
      if (typeof updateAdminStats === 'function') updateAdminStats();
    }
  }

  // Carga inicial del catálogo
  loadProductsCatalog();

  // Carga persistente de carrito entre páginas
  let cart = [];
  try {
    const storedCart = localStorage.getItem('softproca-cart');
    if (storedCart) cart = JSON.parse(storedCart);
  } catch (e) {
    cart = [];
  }

  // Renderizado del catálogo
  const catalogGrid = document.getElementById('products-catalog-grid');
  const filterButtons = document.querySelectorAll('.filter-btn');
  const productSearchInput = document.getElementById('product-search');
  let currentCategory = 'all';
  let currentSearchQuery = '';

  function renderCatalog() {
    if (!catalogGrid) return;
    catalogGrid.innerHTML = '';

    const filtered = productsData.filter(p => {
      const matchCat = currentCategory === 'all' || p.category === currentCategory;
      const matchSearch = !currentSearchQuery || 
        p.name.toLowerCase().includes(currentSearchQuery) || 
        p.specs.toLowerCase().includes(currentSearchQuery);
      return matchCat && matchSearch;
    });

    if (filtered.length === 0) {
      catalogGrid.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 40px 20px; color: var(--sp-text-muted);">
          <i class="fa-solid fa-magnifying-glass" style="font-size: 2.5rem; margin-bottom: 12px; display: block; opacity: 0.4;"></i>
          <h4 style="font-size: 1.2rem; color: var(--sp-heading-color); margin-bottom: 6px;">No encontramos productos coincidentes</h4>
          <p>Intenta con otro término de búsqueda o selecciona otra categoría.</p>
        </div>
      `;
      return;
    }

    filtered.forEach(prod => {
      const card = document.createElement('div');
      card.className = 'product-card';
      if (prod.stockStatus === 'out_of_stock') {
        card.style.opacity = '0.78';
      }

      // Visual de Stock
      let stockHtml = `<div class="product-stock in-stock" style="color: #10B981;"><i class="fa-solid fa-circle-check"></i> Disponible</div>`;
      if (prod.stockStatus === 'low_stock') {
        stockHtml = `<div class="product-stock low-stock" style="color: #F59E0B;"><i class="fa-solid fa-triangle-exclamation"></i> Pocas Unidades</div>`;
      } else if (prod.stockStatus === 'out_of_stock') {
        stockHtml = `<div class="product-stock out-of-stock" style="color: #EF4444;"><i class="fa-solid fa-circle-xmark"></i> Agotado</div>`;
      }

      // Visual de Imagen o Icono
      const visualHtml = prod.image
        ? `<img src="${prod.image}" alt="${prod.name}" style="max-width: 100%; max-height: 100%; object-fit: contain;">`
        : `<i class="fa-solid ${prod.icon || 'fa-box'} product-icon-visual"></i>`;

      // Botones de acción según stock
      let actionsHtml = `
        <button class="btn btn-secondary btn-sm btn-add-cart" data-id="${prod.id}">
          <i class="fa-solid fa-cart-plus"></i> Cotizar
        </button>
        <button class="btn btn-primary btn-sm btn-quick-wa" data-id="${prod.id}">
          <i class="fa-brands fa-whatsapp"></i> Pedir
        </button>
      `;

      if (prod.stockStatus === 'out_of_stock') {
        actionsHtml = `
          <button class="btn btn-secondary btn-sm" disabled style="opacity: 0.55; cursor: not-allowed;">
            <i class="fa-solid fa-ban"></i> Sin Stock
          </button>
          <button class="btn btn-whatsapp btn-sm btn-ask-arrival" data-id="${prod.id}" title="Consultar cuándo llegará">
            <i class="fa-brands fa-whatsapp"></i> Consultar
          </button>
        `;
      }

      card.innerHTML = `
        ${prod.badge ? `<span class="product-badge-corner">${prod.badge}</span>` : ''}
        <div class="product-image-container">
          ${visualHtml}
        </div>
        <div class="product-category-label">${(prod.category || 'general').toUpperCase()}</div>
        <h4 class="product-title">${prod.name}</h4>
        <p class="product-specs-list">${prod.specs}</p>
        <div class="product-price-row">
          <div class="product-price"><span>$</span>${Number(prod.price).toFixed(2)}</div>
          ${stockHtml}
        </div>
        <div class="product-actions">
          ${actionsHtml}
        </div>
      `;
      catalogGrid.appendChild(card);
    });

    attachProductListeners();
  }

  function attachProductListeners() {
    // Agregar al carrito
    document.querySelectorAll('.btn-add-cart').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        addToCart(id);
      });
    });

    // Pedido directo WhatsApp
    document.querySelectorAll('.btn-quick-wa').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        const prod = productsData.find(p => p.id === id);
        if (prod) {
          const text = encodeURIComponent(
            `Hola Softproca! 👋\nMe gustaría consultar disponibilidad y comprar el producto:\n` +
            `🔹 *${prod.name}*\n` +
            `💰 Precio Ref: $${Number(prod.price).toFixed(2)}\n\n` +
            `¿Tienen entrega inmediata en su tienda de Calle 71 / 5 de Julio?`
          );
          window.open(`https://wa.me/${WHATSAPP_PHONE}?text=${text}`, '_blank');
        }
      });
    });

    // Consulta de llegada para productos agotados
    document.querySelectorAll('.btn-ask-arrival').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        const prod = productsData.find(p => p.id === id);
        if (prod) {
          const text = encodeURIComponent(
            `Hola Softproca! 👋\nConsulto sobre la próxima llegada o encargo del producto agotado:\n` +
            `🔹 *${prod.name}*\n` +
            `💰 Precio Ref: $${Number(prod.price).toFixed(2)}\n\n` +
            `¿Cuándo dispondrán de más unidades en tienda?`
          );
          window.open(`https://wa.me/${WHATSAPP_PHONE}?text=${text}`, '_blank');
        }
      });
    });
  }

  // Filtrado de productos por categoría
  filterButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      filterButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentCategory = btn.getAttribute('data-filter') || 'all';
      renderCatalog();
    });
  });

  // Búsqueda en tiempo real
  if (productSearchInput) {
    productSearchInput.addEventListener('input', (e) => {
      currentSearchQuery = e.target.value.trim().toLowerCase();
      renderCatalog();
    });
  }

  // Funciones de Carrito / Cotizador
  const cartBadge = document.getElementById('cart-badge');
  const cartDrawer = document.getElementById('cart-drawer');
  const cartOverlay = document.getElementById('cart-drawer-overlay');
  const cartToggleBtn = document.getElementById('cart-toggle-btn');
  const cartCloseBtn = document.getElementById('cart-close-btn');
  const cartItemsContainer = document.getElementById('cart-items-container');
  const cartTotalAmount = document.getElementById('cart-total-amount');
  const btnCheckoutWa = document.getElementById('btn-checkout-wa');

  function openCart() {
    if (cartDrawer) cartDrawer.classList.add('active');
    if (cartOverlay) cartOverlay.classList.add('active');
  }

  function closeCart() {
    if (cartDrawer) cartDrawer.classList.remove('active');
    if (cartOverlay) cartOverlay.classList.remove('active');
  }

  if (cartToggleBtn) cartToggleBtn.addEventListener('click', openCart);
  if (cartCloseBtn) cartCloseBtn.addEventListener('click', closeCart);
  if (cartOverlay) cartOverlay.addEventListener('click', closeCart);

  function addToCart(productId) {
    const prod = productsData.find(p => p.id === productId);
    if (!prod) return;

    const existing = cart.find(item => item.id === productId);
    if (existing) {
      existing.qty += 1;
    } else {
      cart.push({ ...prod, qty: 1 });
    }

    try {
      localStorage.setItem('softproca-cart', JSON.stringify(cart));
    } catch (e) {}

    updateCartUI();
    openCart();
  }

  function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    try {
      localStorage.setItem('softproca-cart', JSON.stringify(cart));
    } catch (e) {}
    updateCartUI();
  }

  function updateCartUI() {
    const totalItems = cart.reduce((acc, curr) => acc + curr.qty, 0);
    if (cartBadge) cartBadge.textContent = totalItems;

    if (!cartItemsContainer) return;

    if (cart.length === 0) {
      cartItemsContainer.innerHTML = `
        <div class="cart-empty-message">
          <i class="fa-solid fa-cart-shopping"></i>
          <p>Tu lista de cotización está vacía.</p>
          <small>Selecciona los SSDs, memorias o servicios que deseas cotizar.</small>
        </div>
      `;
      if (cartTotalAmount) cartTotalAmount.textContent = '$0.00';
      if (btnCheckoutWa) btnCheckoutWa.disabled = true;
      return;
    }

    cartItemsContainer.innerHTML = '';
    let total = 0;

    cart.forEach(item => {
      const itemSubtotal = item.price * item.qty;
      total += itemSubtotal;

      const itemEl = document.createElement('div');
      itemEl.className = 'cart-item';
      itemEl.innerHTML = `
        <div style="flex:1;">
          <div class="cart-item-title">${item.name}</div>
          <div class="cart-item-price">$${item.price.toFixed(2)} x ${item.qty} = <strong>$${itemSubtotal.toFixed(2)}</strong></div>
        </div>
        <button class="cart-item-remove" data-remove="${item.id}" title="Eliminar">
          <i class="fa-solid fa-trash-can"></i>
        </button>
      `;
      cartItemsContainer.appendChild(itemEl);
    });

    if (cartTotalAmount) cartTotalAmount.textContent = `$${total.toFixed(2)}`;
    if (btnCheckoutWa) btnCheckoutWa.disabled = false;

    // Listeners para remover
    cartItemsContainer.querySelectorAll('.cart-item-remove').forEach(btn => {
      btn.addEventListener('click', () => {
        const removeId = btn.getAttribute('data-remove');
        removeFromCart(removeId);
      });
    });
  }

  // Enviar lista completa de cotización a WhatsApp
  if (btnCheckoutWa) {
    btnCheckoutWa.addEventListener('click', () => {
      if (cart.length === 0) return;

      let msg = `Hola SOFTPROCA! 👋 Deseo solicitar cotización para los siguientes artículos:\n\n`;
      let grandTotal = 0;

      cart.forEach((item, index) => {
        const sub = item.price * item.qty;
        grandTotal += sub;
        msg += `${index + 1}. *${item.name}* (Cant: ${item.qty}) -> $${sub.toFixed(2)}\n`;
      });

      msg += `\n💰 *Total Estimado: $${grandTotal.toFixed(2)}*\n`;
      msg += `📍 ¿Están disponibles en su sede de Edif. Flamingo, Maracaibo?`;

      window.open(`https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(msg)}`, '_blank');
    });
  }

  // Inicializar estado del carrito y catálogo en la página actual
  updateCartUI();
  if (catalogGrid) {
    renderCatalog();
  }

  // =========================================================================
  // SINCRONIZACIÓN EN TIEMPO REAL ENTRE ADMIN Y TIENDA PÚBLICA
  // =========================================================================
  function reloadAndSyncCatalog() {
    loadProductsCatalog();
    if (catalogGrid) {
      renderCatalog();
    }
    updateCartUI();
  }

  // 1. Escuchar eventos storage estándar (cuando son pestañas con HTTP/HTTPS)
  window.addEventListener('storage', (e) => {
    if (e.key === 'softproca-products-catalog') {
      reloadAndSyncCatalog();
    }
  });

  // 2. Escuchar canal de difusión en tiempo real (BroadcastChannel entre pestañas)
  try {
    if (typeof BroadcastChannel !== 'undefined') {
      const bc = new BroadcastChannel('softproca_catalog_channel');
      bc.onmessage = (event) => {
        if (event.data && event.data.type === 'CATALOG_UPDATED') {
          reloadAndSyncCatalog();
        }
      };
    }
  } catch (bcErr) {}

  // 3. Sincronización instantánea al cambiar de pestaña o volver a la tienda
  window.addEventListener('focus', reloadAndSyncCatalog);
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      reloadAndSyncCatalog();
    }
  });
  window.addEventListener('pageshow', reloadAndSyncCatalog);
  window.addEventListener('softproca-catalog-changed', reloadAndSyncCatalog);

  // 4. Polling ultra ligero y seguro para entornos locales file:/// (detecta cambios cada 1.2s)
  let lastCatalogCache = '';
  try {
    lastCatalogCache = localStorage.getItem('softproca-products-catalog') || '';
  } catch (e) {}

  setInterval(() => {
    try {
      const currentStored = localStorage.getItem('softproca-products-catalog') || '';
      if (currentStored && currentStored !== lastCatalogCache) {
        lastCatalogCache = currentStored;
        reloadAndSyncCatalog();
      }
    } catch (e) {}
  }, 1200);

  // =========================================================================
  // 3. EXPLORADOR INTERACTIVO DE MODELOS SSD M.2 (Flyer Informativo)
  // =========================================================================
  const ssdSpecInfo = {
    '2280': {
      title: 'SSD M.2 Formato 2280 (22mm x 80mm)',
      speed: 'Hasta 7500 MB/s (NVMe Gen4) o 550 MB/s (SATA)',
      usage: 'El estándar más utilizado en laptops modernas, PCs de escritorio y consolas PS5. Excelente disipación y variedad de capacidades (hasta 4TB).'
    },
    '2260': {
      title: 'SSD M.2 Formato 2260 (22mm x 60mm)',
      speed: 'Hasta 3500 MB/s (NVMe)',
      usage: 'Utilizado en ciertas laptops compactas de marcas como Dell, HP y Lenovo con tarjetas madres personalizadas.'
    },
    '2242': {
      title: 'SSD M.2 Formato 2242 (22mm x 42mm)',
      speed: 'Hasta 3500 MB/s (NVMe)',
      usage: 'Muy frecuente como segundo puerto de expansión o unidad principal en laptops Lenovo ThinkPad / IdeaPad y mini PCs.'
    },
    '2230': {
      title: 'SSD M.2 Formato 2230 (22mm x 30mm)',
      speed: 'Hasta 5000 MB/s (NVMe PCIe 4.0)',
      usage: 'Ultra compacto. Es el formato exclusivo para Steam Deck, ASUS ROG Ally, Lenovo Legion Go y Microsoft Surface Pro.'
    },
    '22110': {
      title: 'SSD M.2 Formato 22110 (22mm x 110mm)',
      speed: 'Hasta 7000+ MB/s',
      usage: 'Formato largo para servidores empresariales y workstations de alto rendimiento con condensadores de protección contra cortes de energía.'
    },
    'msata': {
      title: 'Formato mSATA (Mini-SATA)',
      speed: 'Hasta 550 MB/s',
      usage: 'Anterior al estándar M.2. Muy común en laptops de generaciones anteriores que requieren revivir su velocidad sin cambiar de equipo.'
    }
  };

  const ssdCards = document.querySelectorAll('.ssd-spec-card');
  const ssdActiveTitle = document.getElementById('ssd-active-title');
  const ssdActiveSpeed = document.getElementById('ssd-active-speed');
  const ssdActiveUsage = document.getElementById('ssd-active-usage');

  ssdCards.forEach(card => {
    card.addEventListener('click', () => {
      ssdCards.forEach(c => c.classList.remove('active'));
      card.classList.add('active');
      const key = card.getAttribute('data-ssd');
      const data = ssdSpecInfo[key];
      if (data && ssdActiveTitle && ssdActiveSpeed && ssdActiveUsage) {
        ssdActiveTitle.textContent = data.title;
        ssdActiveSpeed.textContent = `Rendimiento: ${data.speed}`;
        ssdActiveUsage.textContent = data.usage;
      }
    });
  });

  // =========================================================================
  // 4. AGENDAMIENTO DE CITAS O LLAMADAS INTERACTIVO
  // =========================================================================
  const modalityCards = document.querySelectorAll('.modality-card');
  let selectedModality = 'Presencial en Tienda (Edif. Flamingo)';

  modalityCards.forEach(card => {
    card.addEventListener('click', () => {
      modalityCards.forEach(c => c.classList.remove('selected'));
      card.classList.add('selected');
      selectedModality = card.getAttribute('data-modality');
      updateBookingPreview();
    });
  });

  const bookingService = document.getElementById('booking-service');
  const bookingDate = document.getElementById('booking-date');
  const bookingTime = document.getElementById('booking-time');
  const bookingName = document.getElementById('booking-name');
  const bookingPhone = document.getElementById('booking-phone');
  const bookingDetails = document.getElementById('booking-details');
  const bookingSummaryText = document.getElementById('booking-summary-text');
  const btnSubmitBooking = document.getElementById('btn-submit-booking');

  // Establecer fecha mínima como hoy
  if (bookingDate) {
    const today = new Date().toISOString().split('T')[0];
    bookingDate.min = today;
  }

  function updateBookingPreview() {
    if (!bookingSummaryText) return;

    const service = bookingService ? bookingService.value : 'Instalación de Programas';
    const date = bookingDate && bookingDate.value ? bookingDate.value : 'Fecha por definir';
    const time = bookingTime ? bookingTime.value : 'Turno Mañana';
    const client = bookingName && bookingName.value.trim() !== '' ? bookingName.value.trim() : 'Cliente';

    bookingSummaryText.innerHTML = `
      <strong>Resumen Preliminar:</strong><br>
      • Cliente: <span>${client}</span><br>
      • Modalidad: <span>${selectedModality}</span><br>
      • Servicio: <span>${service}</span><br>
      • Fecha y Horario: <span>${date} (${time})</span>
    `;
  }

  [bookingService, bookingDate, bookingTime, bookingName, bookingPhone, bookingDetails].forEach(el => {
    if (el) {
      el.addEventListener('input', updateBookingPreview);
      el.addEventListener('change', updateBookingPreview);
    }
  });

  if (btnSubmitBooking) {
    btnSubmitBooking.addEventListener('click', (e) => {
      e.preventDefault();

      const nameVal = bookingName ? bookingName.value.trim() : '';
      const phoneVal = bookingPhone ? bookingPhone.value.trim() : '';
      const serviceVal = bookingService ? bookingService.value : '';
      const dateVal = bookingDate ? bookingDate.value : '';
      const timeVal = bookingTime ? bookingTime.value : '';
      const detailsVal = bookingDetails ? bookingDetails.value.trim() : '';

      if (!nameVal || !phoneVal) {
        alert('Por favor, ingresa tu Nombre y Número de Teléfono / WhatsApp para registrar tu solicitud.');
        return;
      }

      const bookingId = `SP-${Math.floor(1000 + Math.random() * 9000)}`;

      const message = 
        `👋 *SOLICITUD DE CITA / LLAMADA - SOFTPROCA*\n` +
        `🆔 *Ticket:* ${bookingId}\n\n` +
        `👤 *Cliente:* ${nameVal}\n` +
        `📞 *Contacto:* ${phoneVal}\n` +
        `🛠️ *Servicio:* ${serviceVal}\n` +
        `📍 *Modalidad:* ${selectedModality}\n` +
        `📅 *Fecha Deseada:* ${dateVal || 'Por coordinar'}\n` +
        `⏰ *Horario Preferido:* ${timeVal}\n` +
        (detailsVal ? `📝 *Detalles / Modelo del Equipo:* ${detailsVal}\n\n` : `\n`) +
        `¡Hola equipo Softproca! Deseo confirmar la disponibilidad de esta cita.`;

      // Mostrar modal de confirmación o abrir WhatsApp
      window.open(`https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(message)}`, '_blank');
      showQuickModal('¡Solicitud Generada con Éxito!', `
        <div style="text-align: center; padding: 10px 0;">
          <div style="font-size: 3rem; color: #10B981; margin-bottom: 12px;">
            <i class="fa-solid fa-circle-check"></i>
          </div>
          <h3 style="font-size: 1.5rem; margin-bottom: 8px;">Ticket #${bookingId} Creado</h3>
          <p style="color: #9CA3AF; margin-bottom: 20px;">
            Hemos abierto tu WhatsApp con los datos de tu cita para que nuestro equipo técnico te confirme de inmediato.
          </p>
          <div style="background: #090B10; padding: 16px; border-radius: 8px; border: 1px solid rgba(255,90,0,0.3); font-family: monospace; font-size: 0.9rem; text-align: left;">
            <div><strong>Cliente:</strong> ${nameVal}</div>
            <div><strong>Servicio:</strong> ${serviceVal}</div>
            <div><strong>Modalidad:</strong> ${selectedModality}</div>
            <div><strong>Sede:</strong> MCBO, Av 5 de Julio con Calle 71, Edif. Flamingo</div>
          </div>
        </div>
      `);
    });
  }

  // =========================================================================
  // 5. MODAL GENERAL Y LIGHTBOX DE IMÁGENES / TIPS
  // =========================================================================
  const generalModalOverlay = document.getElementById('general-modal-overlay');
  const generalModalContent = document.getElementById('general-modal-body');
  const generalModalClose = document.getElementById('general-modal-close');

  function showQuickModal(title, htmlContent) {
    if (!generalModalOverlay || !generalModalContent) return;
    const titleEl = document.getElementById('general-modal-title');
    if (titleEl) titleEl.textContent = title;
    generalModalContent.innerHTML = htmlContent;
    generalModalOverlay.classList.add('active');
  }

  function hideQuickModal() {
    if (generalModalOverlay) generalModalOverlay.classList.remove('active');
  }

  if (generalModalClose) generalModalClose.addEventListener('click', hideQuickModal);
  if (generalModalOverlay) {
    generalModalOverlay.addEventListener('click', (e) => {
      if (e.target === generalModalOverlay) hideQuickModal();
    });
  }

  // Lightbox para los flyers del cliente
  document.querySelectorAll('[data-zoom-img]').forEach(el => {
    el.addEventListener('click', () => {
      const src = el.getAttribute('data-zoom-img');
      const title = el.getAttribute('data-img-title') || 'Visualización de Flyer';
      showQuickModal(title, `
        <div style="text-align: center;">
          <img src="${src}" alt="${title}" style="max-height: 75vh; margin: 0 auto; border-radius: 8px; box-shadow: 0 10px 30px rgba(0,0,0,0.6);" />
        </div>
      `);
    });
  });

  // Tips Tecnológicos Interactivos (Contenido Completo)
  const tipsData = {
    'tip-ssd': {
      title: '¿Cómo elegir el SSD M.2 adecuado para tu Laptop o PC?',
      content: `
        <p style="margin-bottom: 14px; color: #D1D5DB;">A la hora de actualizar con un SSD M.2, no todos los puertos ni tamaños son iguales. Cometer un error puede hacer que compres un disco físicamente incompatible:</p>
        <ul style="margin-left: 20px; margin-bottom: 16px; color: #9CA3AF; line-height: 1.7;">
          <li><strong>Diferencia de protocolo (NVMe vs SATA):</strong> El protocolo NVMe PCIe utiliza las pistas directas del procesador, alcanzando velocidades entre 2500 MB/s y 7500 MB/s. El protocolo SATA M.2 está limitado a 550 MB/s. Revisa si la ranura de tu laptop tiene una sola muesca (M-Key, generalmente NVMe) o dos muescas (B+M Key, usualmente SATA).</li>
          <li><strong>Factores de forma (2280 vs 2242 vs 2230):</strong> Los números indican el ancho y el largo en milímetros. Un SSD <strong>2280</strong> mide 22mm x 80mm (el 90% de las PCs). Las consolas portátiles como Steam Deck y ROG Ally usan <strong>2230</strong>.</li>
          <li><strong>Disipación de calor:</strong> En laptops compactas, los NVMe Gen4 pueden calentarse más. En SOFTPROCA instalamos thermal pads de alta conductividad para garantizar que no sufra degradación térmica.</li>
        </ul>
        <div style="background: rgba(255,90,0,0.1); border-left: 3px solid #FF5A00; padding: 12px; margin-top: 14px;">
          <strong>Tip SOFTPROCA:</strong> Trae tu equipo a nuestro local en Edif. Flamingo (Maracaibo) y te hacemos el diagnóstico de compatibilidad exacto sin costo adicional al adquirir tu SSD.
        </div>
      `
    },
    'tip-diseno': {
      title: 'Programas de Diseño y Render: Hardware Mínimo Recomendado',
      content: `
        <p style="margin-bottom: 14px; color: #D1D5DB;">Arquitectos, ingenieros y diseñadores gráficos a menudo sufren cuelgues en AutoCAD, 3ds Max o Revit por falta de optimización:</p>
        <ul style="margin-left: 20px; margin-bottom: 16px; color: #9CA3AF; line-height: 1.7;">
          <li><strong>Memoria RAM:</strong> Para AutoCAD en planos 2D, 8GB a 16GB bastan. Pero si trabajas con Revit, SketchUp con texturas complejas o Chaos V-Ray, lo mínimo indispensable para no saturar el sistema son <strong>32GB de RAM</strong>.</li>
          <li><strong>Almacenamiento:</strong> Un disco mecánico (HDD) generará cuellos de botella masivos al cargar familias y texturas. El archivo de render temporal debe residir en un <strong>SSD NVMe ultrarrápido</strong>.</li>
          <li><strong>Tarjeta Gráfica:</strong> Los motores de render actuales (V-Ray GPU, Lumion, Enscape) dependen críticamente de los núcleos CUDA y memoria VRAM de tarjetas NVIDIA GeForce RTX o Quadro.</li>
        </ul>
        <div style="background: rgba(255,90,0,0.1); border-left: 3px solid #FF5A00; padding: 12px; margin-top: 14px;">
          <strong>En SOFTPROCA:</strong> Instalamos y configuramos todas las versiones de Autodesk (AutoCAD, Revit, 3ds Max), Adobe Suite y CorelDRAW con librerías completas y parches de estabilidad.
        </div>
      `
    },
    'tip-temperatura': {
      title: 'Mantenimiento Térmico en Maracaibo: El Enemigo Silencioso',
      content: `
        <p style="margin-bottom: 14px; color: #D1D5DB;">El clima caluroso de Maracaibo acelera drásticamente la degradación de la pasta térmica en computadoras y laptops:</p>
        <ul style="margin-left: 20px; margin-bottom: 16px; color: #9CA3AF; line-height: 1.7;">
          <li><strong>Thermal Throttling:</strong> Cuando el procesador supera los 85°C-90°C, baja automáticamente su velocidad a la mitad para evitar fundirse. Esto hace que tu laptop se sienta lenta o se apague de la nada.</li>
          <li><strong>Frecuencia ideal de servicio:</strong> Recomendamos un mantenimiento preventivo cada <strong>6 a 8 meses</strong> en nuestra región, limpiando el polvo acumulado en disipadores y ventiladores.</li>
          <li><strong>Calidad de los compuestos:</strong> Usar pastas térmicas genéricas blancas de baja calidad puede secarse en apenas 30 días. En SOFTPROCA usamos compuestos de alta conductividad con partículas cerámicas o de carbono de larga vida útil.</li>
        </ul>
      `
    }
  };

  document.querySelectorAll('[data-tip-id]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const id = btn.getAttribute('data-tip-id');
      const tip = tipsData[id];
      if (tip) {
        showQuickModal(tip.title, tip.content);
      }
    });
  });

  // =========================================================================
  // 6. INICIALIZACIÓN DEL MAPA (LEAFLET.JS) Y ADAPTABILIDAD AL TEMA
  // =========================================================================
  const mapElement = document.getElementById('map-container');

  if (mapElement && typeof L !== 'undefined') {
    // Coordenadas para Calle 71 con Av 5 de Julio / E/S Los Almendros, Maracaibo
    const SOFTPROCA_LAT = 10.6698;
    const SOFTPROCA_LNG = -71.6285;

    mapInstance = L.map('map-container', {
      center: [SOFTPROCA_LAT, SOFTPROCA_LNG],
      zoom: 16,
      scrollWheelZoom: false
    });

    // Cargar la capa adecuada según el tema activo actual
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
    updateMapTileTheme(currentTheme);

    // Marcador personalizado Softproca
    const customIcon = L.divIcon({
      className: 'custom-map-pin',
      html: `
        <div style="background: #FF5A00; color: #FFFFFF; width: 44px; height: 44px; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 0 20px #FF5A00; border: 3px solid #FFFFFF;">
          <i class="fa-solid fa-microchip" style="font-size: 20px;"></i>
        </div>
      `,
      iconSize: [44, 44],
      iconAnchor: [22, 22]
    });

    const marker = L.marker([SOFTPROCA_LAT, SOFTPROCA_LNG], { icon: customIcon }).addTo(mapInstance);
    
    marker.bindPopup(`
      <div style="font-family: 'Rajdhani', sans-serif; text-align: center; padding: 4px;">
        <h4 style="font-size: 1.2rem; color: #FF5A00; margin-bottom: 4px; font-weight: 800;">SOFTPROCA C.A.</h4>
        <p style="font-size: 0.85rem; color: #1F2937; margin-bottom: 6px;">
          Av 5 de Julio con Calle 71. Edif. Flamingo, P/B.<br>
          <strong>Diagonal a la E/S Los Almendros</strong>
        </p>
        <a href="https://www.google.com/maps/search/?api=1&query=Av+5+de+Julio+con+Calle+71+Edif+Flamingo+Maracaibo" target="_blank" style="display: inline-block; background: #FF5A00; color: #FFF; padding: 4px 10px; border-radius: 4px; font-weight: bold; font-size: 0.8rem; text-decoration: none;">
          Ver en Google Maps
        </a>
      </div>
    `).openPopup();
  }
});
