/* =====================================================
   sidebar.js  –  Métodos Cuantitativos IPN · UPIIZ
   Lógica compartida de la sidebar y navbar.
   Incluir en todas las páginas del proyecto.
   ===================================================== */

(function () {
    'use strict';

    /* ---- Referencias ---- */
    const sidebar     = document.getElementById('sidebar');
    const mainWrapper = document.getElementById('mainWrapper');
    const toggleBtn   = document.getElementById('sidebarToggle');

    if (!sidebar || !mainWrapper || !toggleBtn) return;

    /* ---- Toggle sidebar ---- */
    toggleBtn.addEventListener('click', () => {
        const isNowCollapsed = sidebar.classList.toggle('collapsed');
        mainWrapper.classList.toggle('expanded', isNowCollapsed);
        toggleBtn.classList.toggle('collapsed', isNowCollapsed);
    });

    /* ---- Marcar enlace activo según la URL actual ---- */
    const currentPath = window.location.pathname;
    document.querySelectorAll('.nav-menu a').forEach(link => {
        const href = link.getAttribute('href');
        if (href && currentPath.endsWith(href.replace(/^\//, ''))) {
            link.classList.add('active');
        }
    });

    /* ---- Función global para cambiar el título del navbar ---- */
    window.setNavTitle = function (title) {
        const el = document.getElementById('navbarTitle');
        if (el) el.textContent = title;
    };

    /* ---- Función global para marcar un ítem activo por href ---- */
    window.setActiveNav = function (href) {
        document.querySelectorAll('.nav-menu a').forEach(a => a.classList.remove('active'));
        const target = document.querySelector(`.nav-menu a[href="${href}"]`);
        if (target) target.classList.add('active');
    };

})();
