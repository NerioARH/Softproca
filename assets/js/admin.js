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
    function loadCatalog() {
      try {
        const stored = safeStorageGet(STORAGE_KEY_CATALOG);
        if (stored) {
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
        'ram': 'Memorias RAM',
        'componentes': 'Componentes',
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
