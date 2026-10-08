/**
 * ============================================================================
 * SOFTPROCA - PANEL PRIVADO DE ADMINISTRACIÓN & GESTIÓN DE INVENTARIO
 * ============================================================================
 * Maneja de forma 100% aislada:
 * - Autenticación privada por PIN y gestión de sesión (sessionStorage)
 * - CRUD completo de productos (Crear, Editar, Borrar)
 * - Optimización y compresión automática de imágenes vía HTML5 Canvas
 * - Selector rápido de estado de stock en tiempo real
 * - Sincronización instantánea con la tienda pública mediante localStorage
 * - Copias de seguridad (Exportar/Importar JSON) y cambio de PIN
 * ============================================================================
 */

document.addEventListener('DOMContentLoaded', () => {

  // =========================================================================
  // 1. CONFIGURACIÓN, ALMACENAMIENTO Y PRODUCTOS POR DEFECTO
  // =========================================================================
  const STORAGE_KEY_CATALOG = 'softproca-products-catalog';
  const STORAGE_KEY_PIN = 'softproca-admin-pin';
  const STORAGE_KEY_THEME = 'softproca-theme';
  const SESSION_AUTH_KEY = 'softproca-admin-session';
  const DEFAULT_PIN = '1234';

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
  const toastContainer = document.getElementById('toast-container');

  function showToast(message, type = 'success') {
    if (!toastContainer) return;
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;

    let icon = 'fa-check-circle';
    if (type === 'error') icon = 'fa-triangle-exclamation';
    if (type === 'warning') icon = 'fa-bell';
    if (type === 'info') icon = 'fa-circle-info';

    toast.innerHTML = `<i class="fa-solid ${icon}"></i> <span>${message}</span>`;
    toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.style.animation = 'slideToastOut 0.3s forwards';
      setTimeout(() => toast.remove(), 300);
    }, 3500);
  }

  // =========================================================================
  // 3. CONTROL DE TEMA (CLARO / OSCURO)
  // =========================================================================
  const themeToggleBtn = document.getElementById('theme-toggle-btn');
  const themeIcon = document.getElementById('theme-icon');
  const themeText = document.getElementById('theme-text');

  function updateThemeUI(theme) {
    const isDark = theme === 'dark';
    if (themeIcon) {
      themeIcon.className = isDark ? 'fa-solid fa-sun theme-icon' : 'fa-solid fa-moon theme-icon';
    }
    if (themeText) {
      themeText.textContent = isDark ? 'Modo Claro' : 'Modo Oscuro';
    }
  }

  const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
  updateThemeUI(currentTheme);

  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', () => {
      const activeTheme = document.documentElement.getAttribute('data-theme') || 'light';
      const newTheme = activeTheme === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', newTheme);
      try {
        localStorage.setItem(STORAGE_KEY_THEME, newTheme);
      } catch (e) {
        console.warn('Error al guardar tema:', e);
      }
      updateThemeUI(newTheme);
      showToast(`Tema cambiado a ${newTheme === 'dark' ? 'Modo Oscuro' : 'Modo Claro'}`, 'info');
    });
  }

  // =========================================================================
  // 4. AUTENTICACIÓN Y GESTIÓN DE SESIÓN PRIVADA
  // =========================================================================
  const loginScreen = document.getElementById('admin-login-screen');
  const dashboardScreen = document.getElementById('admin-dashboard-screen');
  const loginForm = document.getElementById('admin-login-form');
  const pinInput = document.getElementById('admin-pin-input');
  const pinError = document.getElementById('admin-pin-error');
  const pinErrorText = document.getElementById('admin-pin-error-text');
  const pinToggleBtn = document.getElementById('admin-pin-toggle-btn');
  const pinEyeIcon = document.getElementById('admin-pin-eye-icon');
  const logoutBtn = document.getElementById('admin-logout-btn');

  function getStoredPin() {
    try {
      return localStorage.getItem(STORAGE_KEY_PIN) || DEFAULT_PIN;
    } catch (e) {
      return DEFAULT_PIN;
    }
  }

  function isAuthenticated() {
    try {
      return sessionStorage.getItem(SESSION_AUTH_KEY) === 'true';
    } catch (e) {
      return false;
    }
  }

  function setAuthenticated(status) {
    try {
      if (status) {
        sessionStorage.setItem(SESSION_AUTH_KEY, 'true');
      } else {
        sessionStorage.removeItem(SESSION_AUTH_KEY);
      }
    } catch (e) {
      console.warn('Error gestionando sesión:', e);
    }
  }

  function showDashboard() {
    if (loginScreen) loginScreen.style.display = 'none';
    if (dashboardScreen) dashboardScreen.style.display = 'flex';
    loadCatalog();
    renderInventory();
    updateKpis();
  }

  function showLogin() {
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

  // Comprobar estado al cargar la página
  if (isAuthenticated()) {
    showDashboard();
  } else {
    showLogin();
  }

  // Alternar visibilidad de PIN
  if (pinToggleBtn && pinInput && pinEyeIcon) {
    pinToggleBtn.addEventListener('click', () => {
      const isPassword = pinInput.getAttribute('type') === 'password';
      pinInput.setAttribute('type', isPassword ? 'text' : 'password');
      pinEyeIcon.className = isPassword ? 'fa-solid fa-eye-slash' : 'fa-solid fa-eye';
    });
  }

  // Enviar formulario de login
  if (loginForm && pinInput) {
    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const enteredPin = pinInput.value.trim();
      const validPin = getStoredPin();

      if (enteredPin === validPin) {
        setAuthenticated(true);
        if (pinError) pinError.style.display = 'none';
        showDashboard();
        showToast('¡Acceso verificado! Bienvenido al Administrador SOFTPROCA.', 'success');
      } else {
        if (pinError) {
          pinError.style.display = 'flex';
          pinErrorText.textContent = 'Código PIN incorrecto. Intenta de nuevo.';
          pinInput.value = '';
          pinInput.focus();
        }
      }
    });
  }

  // Cerrar sesión
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      setAuthenticated(false);
      showLogin();
      showToast('Sesión administrativa cerrada correctamente.', 'info');
    });
  }

  // =========================================================================
  // 5. CARGA Y PERSISTENCIA DE DATOS DE PRODUCTOS
  // =========================================================================
  function loadCatalog() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_CATALOG);
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
      console.warn('Error cargando catálogo desde localStorage:', e);
    }
    productsData = JSON.parse(JSON.stringify(DEFAULT_PRODUCTS));
    saveCatalog(false);
  }

  function saveCatalog(triggerRerender = true) {
    try {
      localStorage.setItem(STORAGE_KEY_CATALOG, JSON.stringify(productsData));
    } catch (e) {
      console.error('Error guardando en localStorage:', e);
      showToast('Error de almacenamiento. Si subiste una imagen muy pesada, elimínala e intenta de nuevo.', 'error');
    }
    if (triggerRerender) {
      renderInventory();
      updateKpis();
    }
  }

  // =========================================================================
  // 6. ACTUALIZACIÓN DE TARJETAS KPIS Y CONTADORES
  // =========================================================================
  const kpiTotal = document.getElementById('kpi-total-products');
  const kpiInStock = document.getElementById('kpi-in-stock');
  const kpiLowStock = document.getElementById('kpi-low-stock');
  const kpiOutOfStock = document.getElementById('kpi-out-of-stock');
  const tabInventoryCounter = document.getElementById('tab-inventory-counter');

  function updateKpis() {
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

  // =========================================================================
  // 7. SISTEMA DE PESTAÑAS (TABS)
  // =========================================================================
  const tabBtns = document.querySelectorAll('.admin-tab-btn');
  const tabContents = document.querySelectorAll('.admin-tab-content');
  const btnQuickNewProduct = document.getElementById('btn-quick-new-product');

  function switchTab(targetTabId) {
    tabBtns.forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-tab') === targetTabId);
    });
    tabContents.forEach(content => {
      content.classList.toggle('active', content.id === targetTabId);
    });
  }

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetId = btn.getAttribute('data-tab');
      switchTab(targetId);
    });
  });

  if (btnQuickNewProduct) {
    btnQuickNewProduct.addEventListener('click', () => {
      resetProductForm();
      switchTab('tab-publish');
    });
  }

  // =========================================================================
  // 8. LISTADO Y GESTIÓN EN TIEMPO REAL DEL INVENTARIO
  // =========================================================================
  const inventoryList = document.getElementById('admin-inventory-list');
  const searchInput = document.getElementById('admin-search-input');
  const filterCategory = document.getElementById('admin-filter-category');
  const filterStock = document.getElementById('admin-filter-stock');
  const refreshBtn = document.getElementById('admin-refresh-btn');

  function renderInventory() {
    if (!inventoryList) return;

    const searchTerm = (searchInput ? searchInput.value : '').toLowerCase().trim();
    const catFilter = filterCategory ? filterCategory.value : 'all';
    const stockFilter = filterStock ? filterStock.value : 'all';

    const filtered = productsData.filter(product => {
      const matchSearch = product.name.toLowerCase().includes(searchTerm) ||
                          (product.specs && product.specs.toLowerCase().includes(searchTerm)) ||
                          (product.badge && product.badge.toLowerCase().includes(searchTerm));
      const matchCat = catFilter === 'all' || product.category === catFilter;
      const matchStock = stockFilter === 'all' || product.stockStatus === stockFilter;
      return matchSearch && matchCat && matchStock;
    });

    if (filtered.length === 0) {
      inventoryList.innerHTML = `
        <div style="text-align: center; padding: 40px 20px; background: var(--sp-bg-inner); border-radius: var(--sp-radius-md); border: 1px dashed var(--sp-border);">
          <i class="fa-solid fa-box-archive" style="font-size: 2.2rem; color: var(--sp-text-muted); margin-bottom: 12px; display: block;"></i>
          <h4 style="color: var(--sp-heading-color); margin-bottom: 6px;">No se encontraron productos</h4>
          <p style="font-size: 0.85rem; color: var(--sp-text-secondary); margin-bottom: 16px;">Prueba ajustando los filtros de búsqueda o publica un nuevo producto.</p>
          <button type="button" class="btn btn-primary btn-sm" id="btn-empty-create">
            <i class="fa-solid fa-plus"></i> Publicar Nuevo Producto
          </button>
        </div>
      `;
      const btnEmptyCreate = document.getElementById('btn-empty-create');
      if (btnEmptyCreate) {
        btnEmptyCreate.addEventListener('click', () => {
          resetProductForm();
          switchTab('tab-publish');
        });
      }
      return;
    }

    inventoryList.innerHTML = filtered.map(product => {
      const thumbContent = product.image
        ? `<img src="${product.image}" alt="${product.name}" onerror="this.outerHTML='<i class=\\\'fa-solid ${product.icon || 'fa-hard-drive'}\\\'></i>'">`
        : `<i class="fa-solid ${product.icon || 'fa-hard-drive'}"></i>`;

      const categoryLabel = {
        'ssd': 'Discos SSD',
        'ram': 'Memorias RAM',
        'componentes': 'Componentes',
        'software': 'Software'
      }[product.category] || product.category;

      return `
        <div class="admin-inventory-item" data-id="${product.id}">
          <div class="admin-item-thumb">
            ${thumbContent}
          </div>

          <div class="admin-item-info">
            <h4>${product.name}</h4>
            <div class="admin-item-meta">
              <span><i class="fa-solid fa-tag"></i> ${categoryLabel}</span>
              ${product.badge ? `<span>&bull; <strong style="color: var(--sp-orange);">${product.badge}</strong></span>` : ''}
            </div>
          </div>

          <div class="admin-item-price">
            $${Number(product.price).toFixed(2)}
          </div>

          <div>
            <select class="admin-stock-select ${product.stockStatus || 'in_stock'}" data-stock-id="${product.id}">
              <option value="in_stock" ${product.stockStatus === 'in_stock' ? 'selected' : ''}>🟢 En Stock</option>
              <option value="low_stock" ${product.stockStatus === 'low_stock' ? 'selected' : ''}>🟡 Pocas Unidades</option>
              <option value="out_of_stock" ${product.stockStatus === 'out_of_stock' ? 'selected' : ''}>🔴 Agotado</option>
            </select>
          </div>

          <div class="admin-item-actions">
            <button class="btn-icon-action btn-edit-product" data-id="${product.id}" title="Editar producto">
              <i class="fa-solid fa-pen-to-square"></i>
            </button>
            <button class="btn-icon-action delete btn-delete-product" data-id="${product.id}" title="Eliminar producto">
              <i class="fa-solid fa-trash-can"></i>
            </button>
          </div>
        </div>
      `;
    }).join('');

    // Eventos de selector rápido de stock
    inventoryList.querySelectorAll('.admin-stock-select').forEach(select => {
      select.addEventListener('change', (e) => {
        const prodId = select.getAttribute('data-stock-id');
        const newStatus = select.value;
        const targetProd = productsData.find(p => p.id === prodId);
        if (targetProd) {
          targetProd.stockStatus = newStatus;
          saveCatalog(false);
          updateKpis();
          select.className = `admin-stock-select ${newStatus}`;
          
          const label = newStatus === 'in_stock' ? 'En Stock' : (newStatus === 'low_stock' ? 'Pocas Unidades' : 'Agotado');
          showToast(`Estado de "${targetProd.name}" actualizado a "${label}". Sincronizado con la tienda.`, 'success');
        }
      });
    });

    // Eventos de editar producto
    inventoryList.querySelectorAll('.btn-edit-product').forEach(btn => {
      btn.addEventListener('click', () => {
        const prodId = btn.getAttribute('data-id');
        editProduct(prodId);
      });
    });

    // Eventos de eliminar producto
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
      showToast('Lista de inventario actualizada.', 'info');
    });
  }

  // =========================================================================
  // 9. FORMULARIO DE CREACIÓN / EDICIÓN & COMPRESIÓN DE IMÁGENES
  // =========================================================================
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

  // Compresión automática de imágenes usando Canvas para no agotar localStorage
  if (imageFileInput) {
    imageFileInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;

      if (!file.type.startsWith('image/')) {
        showToast('El archivo seleccionado debe ser una imagen (JPG, PNG, WebP).', 'error');
        imageFileInput.value = '';
        return;
      }

      const reader = new FileReader();
      reader.onload = (readerEvent) => {
        const img = new Image();
        img.onload = () => {
          // Escalar proporcionalmente a un máximo de 600x600 px
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

          // Comprimir a JPEG con calidad 0.82
          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.82);
          imageDataInput.value = compressedDataUrl;
          imagePreviewImg.src = compressedDataUrl;
          imagePreviewImg.style.display = 'block';
          imagePlaceholder.style.display = 'none';
          btnRemoveImage.style.display = 'flex';
          showToast('Imagen cargada y optimizada con éxito.', 'success');
        };
        img.src = readerEvent.target.result;
      };
      reader.readAsDataURL(file);
    });
  }

  // Quitar vista previa de imagen
  if (btnRemoveImage) {
    btnRemoveImage.addEventListener('click', () => {
      imageDataInput.value = '';
      imagePreviewImg.src = '';
      imagePreviewImg.style.display = 'none';
      imagePlaceholder.style.display = 'block';
      btnRemoveImage.style.display = 'none';
      if (imageFileInput) imageFileInput.value = '';
    });
  }

  function resetProductForm() {
    if (!productForm) return;
    productForm.reset();
    editIdInput.value = '';
    imageDataInput.value = '';
    imagePreviewImg.src = '';
    imagePreviewImg.style.display = 'none';
    imagePlaceholder.style.display = 'block';
    btnRemoveImage.style.display = 'none';
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

    editIdInput.value = product.id;
    nameInput.value = product.name;
    categorySelect.value = product.category;
    priceInput.value = product.price;
    stockSelect.value = product.stockStatus || 'in_stock';
    badgeInput.value = product.badge || '';
    iconSelect.value = product.icon || 'fa-hard-drive';
    specsTextarea.value = product.specs || '';

    if (product.image) {
      imageDataInput.value = product.image;
      imagePreviewImg.src = product.image;
      imagePreviewImg.style.display = 'block';
      imagePlaceholder.style.display = 'none';
      btnRemoveImage.style.display = 'flex';
    } else {
      imageDataInput.value = '';
      imagePreviewImg.src = '';
      imagePreviewImg.style.display = 'none';
      imagePlaceholder.style.display = 'block';
      btnRemoveImage.style.display = 'none';
    }

    if (btnCancelEdit) btnCancelEdit.style.display = 'inline-flex';
    if (btnSubmitText) btnSubmitText.textContent = 'Actualizar Datos del Producto';
    if (formHeadingTitle) {
      formHeadingTitle.innerHTML = `<i class="fa-solid fa-pen-to-square" style="color: var(--sp-orange);"></i> Editar: ${product.name}`;
    }
    if (tabPublishLabel) tabPublishLabel.textContent = 'Editando Producto';

    switchTab('tab-publish');
  }

  function deleteProduct(productId) {
    const product = productsData.find(p => p.id === productId);
    if (!product) return;

    const confirmDelete = window.confirm(`¿Estás seguro de que deseas eliminar permanentemente el producto "${product.name}" del catálogo?`);
    if (confirmDelete) {
      productsData = productsData.filter(p => p.id !== productId);
      saveCatalog();
      showToast(`Producto "${product.name}" eliminado del catálogo.`, 'info');
    }
  }

  if (btnCancelEdit) {
    btnCancelEdit.addEventListener('click', () => {
      resetProductForm();
      switchTab('tab-inventory');
    });
  }

  if (productForm) {
    productForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const editId = editIdInput.value.trim();
      const name = nameInput.value.trim();
      const category = categorySelect.value;
      const price = parseFloat(priceInput.value);
      const stockStatus = stockSelect.value;
      const badge = badgeInput.value.trim();
      const icon = iconSelect.value;
      const specs = specsTextarea.value.trim();
      const image = imageDataInput.value.trim();

      if (!name || isNaN(price) || price <= 0 || !specs) {
        showToast('Por favor completa todos los campos requeridos correctamente.', 'error');
        return;
      }

      if (editId) {
        // Actualizar producto existente
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
          showToast(`Producto "${name}" actualizado con éxito.`, 'success');
        }
      } else {
        // Crear nuevo producto
        const newProduct = {
          id: `prod-${Date.now()}`,
          name,
          category,
          price,
          stockStatus,
          badge: badge || undefined,
          icon,
          specs,
          image: image || undefined
        };
        // Insertar al inicio de la lista
        productsData.unshift(newProduct);
        saveCatalog();
        showToast(`¡Nuevo producto "${name}" publicado exitosamente en la tienda!`, 'success');
      }

      resetProductForm();
      switchTab('tab-inventory');
    });
  }

  // =========================================================================
  // 10. HERRAMIENTAS DE RESPALDO, SEGURIDAD & CAMBIO DE PIN
  // =========================================================================
  const btnExportJson = document.getElementById('btn-export-json');
  const btnTriggerImportJson = document.getElementById('btn-trigger-import-json');
  const inputImportJson = document.getElementById('input-import-json');
  const formChangePin = document.getElementById('form-change-pin');
  const changePinCurrent = document.getElementById('change-pin-current');
  const changePinNew = document.getElementById('change-pin-new');
  const btnResetCatalog = document.getElementById('btn-reset-catalog');

  // Descargar Copia de Seguridad JSON
  if (btnExportJson) {
    btnExportJson.addEventListener('click', () => {
      try {
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(productsData, null, 2));
        const downloadAnchor = document.createElement('a');
        const dateStr = new Date().toISOString().slice(0, 10);
        downloadAnchor.setAttribute("href", dataStr);
        downloadAnchor.setAttribute("download", `catalogo-softproca-backup-${dateStr}.json`);
        document.body.appendChild(downloadAnchor);
        downloadAnchor.click();
        downloadAnchor.remove();
        showToast('Copia de seguridad descargada exitosamente (.JSON).', 'success');
      } catch (e) {
        showToast('Error al exportar la copia de seguridad.', 'error');
      }
    });
  }

  // Restaurar desde archivo JSON
  if (btnTriggerImportJson && inputImportJson) {
    btnTriggerImportJson.addEventListener('click', () => {
      inputImportJson.click();
    });

    inputImportJson.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const parsed = JSON.parse(event.target.result);
          if (Array.isArray(parsed) && parsed.length > 0) {
            productsData = parsed.map(p => ({
              ...p,
              stockStatus: p.stockStatus || 'in_stock'
            }));
            saveCatalog();
            showToast(`¡Catálogo restaurado! Se cargaron ${parsed.length} productos.`, 'success');
            switchTab('tab-inventory');
          } else {
            showToast('El archivo JSON no contiene un catálogo válido.', 'error');
          }
        } catch (err) {
          showToast('Error al leer el archivo JSON. Formato inválido.', 'error');
        }
        inputImportJson.value = '';
      };
      reader.readAsText(file);
    });
  }

  // Cambiar Código PIN de Acceso
  if (formChangePin && changePinCurrent && changePinNew) {
    formChangePin.addEventListener('submit', (e) => {
      e.preventDefault();
      const currentPin = changePinCurrent.value.trim();
      const newPin = changePinNew.value.trim();
      const savedPin = getStoredPin();

      if (currentPin !== savedPin) {
        showToast('El PIN actual ingresado no coincide.', 'error');
        changePinCurrent.focus();
        return;
      }

      if (newPin.length < 4) {
        showToast('El nuevo PIN debe tener al menos 4 dígitos numéricos.', 'warning');
        changePinNew.focus();
        return;
      }

      try {
        localStorage.setItem(STORAGE_KEY_PIN, newPin);
        showToast('¡PIN de acceso actualizado con éxito! Guárdalo en un lugar seguro.', 'success');
        formChangePin.reset();
      } catch (err) {
        showToast('Error al guardar el nuevo PIN.', 'error');
      }
    });
  }

  // Restablecer de Fábrica
  if (btnResetCatalog) {
    btnResetCatalog.addEventListener('click', () => {
      const confirmReset = window.confirm('¿Deseas restablecer el catálogo a los productos originales de SOFTPROCA? Esto eliminará los productos creados manualmente.');
      if (confirmReset) {
        productsData = JSON.parse(JSON.stringify(DEFAULT_PRODUCTS));
        saveCatalog();
        showToast('Catálogo restablecido a los valores originales de SOFTPROCA.', 'info');
        switchTab('tab-inventory');
      }
    });
  }

});
