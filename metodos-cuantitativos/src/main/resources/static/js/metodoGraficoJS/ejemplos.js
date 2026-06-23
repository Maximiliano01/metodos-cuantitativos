// ── Ejemplos predefinidos ──────────────────────────────────────────────

const EJEMPLOS = [
  // Ejemplo 1 (Max)
  {
    tipo: 'max',
    c1: 5, c2: 4,
    restricciones: [
      { a: 6, b: 4, signo: '<=', c: 24 },
      { a: 1, b: 2, signo: '<=', c: 6 }
    ],
    rango: { xmin: 0, xmax: 8, ymin: 0, ymax: 8 }
  },
  // Ejemplo 2 (Max)
  {
    tipo: 'max',
    c1: 3, c2: 5,
    restricciones: [
      { a: 1, b: 0, signo: '<=', c: 4 },
      { a: 0, b: 2, signo: '<=', c: 12 },
      { a: 3, b: 2, signo: '<=', c: 18 }
    ],
    rango: { xmin: 0, xmax: 10, ymin: 0, ymax: 10 }
  },
  // Ejemplo 3 (Min)
  {
    tipo: 'min',
    c1: 2, c2: 3,
    restricciones: [
      { a: 1, b: 1, signo: '>=', c: 6 },
      { a: 2, b: 1, signo: '>=', c: 8 }
    ],
    rango: { xmin: 0, xmax: 12, ymin: 0, ymax: 12 }
  },
  // Ejemplo 4 (Min)
  {
    tipo: 'min',
    c1: 1, c2: 1,
    restricciones: [
      { a: 1, b: 2, signo: '>=', c: 10 },
      { a: 3, b: 1, signo: '>=', c: 15 }
    ],
    rango: { xmin: 0, xmax: 15, ymin: 0, ymax: 15 }
  }
];

const coloresRest = ['#C4566A', '#2D7FC4', '#2D9E6B', '#E8A735', '#9B59B6', '#E67E22'];
const MAX_RESTRICCIONES = 3;

// ── Crear fila de restricción ────────────────────────────────────────

function crearFilaRestriccion(r, idx) {
  const row = document.createElement('div');
  row.className = 'rest-row';
  row.innerHTML = `
    <div class="rest-idx" style="background:${coloresRest[idx % coloresRest.length]};">${idx + 1}</div>
    <input class="rest-coef" type="number" value="${r.a}" placeholder="a₁">
    <span class="rest-var">x₁</span>
    <span class="rest-op">+</span>
    <input class="rest-coef" type="number" value="${r.b}" placeholder="a₂">
    <span class="rest-var">x₂</span>
    <select class="ineq-sel">
      <option value="<=" ${r.signo === '<=' ? 'selected' : ''}>≤</option>
      <option value=">=" ${r.signo === '>=' ? 'selected' : ''}>≥</option>
      <option value="=" ${r.signo === '=' ? 'selected' : ''}>=</option>
    </select>
    <input class="rest-rhs" type="number" value="${r.c}" placeholder="b">
    <button class="rest-del" title="Eliminar restricción">×</button>
  `;

  const delBtn = row.querySelector('.rest-del');
  delBtn.dataset.bound = 'true';
  delBtn.addEventListener('click', () => {
    row.remove();
    reindexarRestricciones();
  });

  return row;
}

// ── Reindexar (colores, números, estado del botón agregar) ─────────────

function reindexarRestricciones() {
  const rows = document.querySelectorAll('.rest-row');
  rows.forEach((row, i) => {
    const idxEl = row.querySelector('.rest-idx');
    idxEl.textContent = i + 1;
    idxEl.style.background = coloresRest[i % coloresRest.length];
  });

  actualizarEstadoBotonAgregar();
}

// ── Cargar ejemplo ────────────────────────────────────────────────────

function cargarEjemplo(ej) {
  const btnMax = document.getElementById('btnMax');
  const btnMin = document.getElementById('btnMin');

  if (ej.tipo === 'max') {
    btnMax.classList.add('active');
    btnMin.classList.remove('active');
  } else {
    btnMin.classList.add('active');
    btnMax.classList.remove('active');
  }

  document.getElementById('c1').value = ej.c1;
  document.getElementById('c2').value = ej.c2;

  const lista = document.getElementById('restrictionsList');
  lista.innerHTML = '';
  ej.restricciones.forEach((r, idx) => {
    lista.appendChild(crearFilaRestriccion(r, idx));
  });

  actualizarEstadoBotonAgregar();

  document.getElementById('xmin').value = ej.rango.xmin;
  document.getElementById('xmax').value = ej.rango.xmax;
  document.getElementById('ymin').value = ej.rango.ymin;
  document.getElementById('ymax').value = ej.rango.ymax;

  if (typeof calcularSegunTipo === 'function') {
    calcularSegunTipo();
  }
  if (typeof dibujarGrafica === 'function') {
    setTimeout(() => dibujarGrafica(), 60);
  }
}

// ── Limpiar todo ──────────────────────────────────────────────────────

function limpiarTodo() {
  document.getElementById('c1').value = '';
  document.getElementById('c2').value = '';
  document.getElementById('restrictionsList').innerHTML = '';

  document.getElementById('xmin').value = 0;
  document.getElementById('xmax').value = 20;
  document.getElementById('ymin').value = 0;
  document.getElementById('ymax').value = 20;

  document.getElementById('btnMax').classList.add('active');
  document.getElementById('btnMin').classList.remove('active');

  document.getElementById('solutionBox').innerHTML = `
    <div class="sol-empty">
      Presiona <strong>Calcular y Graficar</strong><br>
      para ver la solución aquí.
    </div>`;

  if (typeof limpiarPasos === 'function') limpiarPasos();
  if (typeof limpiarGrafica === 'function') limpiarGrafica();

  const placeholder = document.querySelector('.canvas-placeholder');
  if (placeholder) placeholder.style.display = 'flex';

  actualizarEstadoBotonAgregar();
}

// ── Botones de ejemplo y limpiar ─────────────────────────────────────

function inicializarEjemplos() {
  const exBtns = document.querySelectorAll('.ex-btn');

  exBtns.forEach((btn, idx) => {
    if (btn.classList.contains('clear')) {
      btn.addEventListener('click', limpiarTodo);
    } else {
      btn.addEventListener('click', () => cargarEjemplo(EJEMPLOS[idx]));
    }
  });
}

// ── Control de máximo 3 restricciones (botón Agregar) ───────────────────

function actualizarEstadoBotonAgregar() {
  const addBtn = document.querySelector('.add-rest-btn');
  if (!addBtn) return;

  const total = document.querySelectorAll('.rest-row').length;

  if (total >= MAX_RESTRICCIONES) {
    addBtn.disabled = true;
    addBtn.classList.add('disabled');
    addBtn.title = `Máximo ${MAX_RESTRICCIONES} restricciones`;
  } else {
    addBtn.disabled = false;
    addBtn.classList.remove('disabled');
    addBtn.title = '';
  }
}

function inicializarBotonAgregar() {
  const addBtn = document.querySelector('.add-rest-btn');
  if (!addBtn) return;

  addBtn.addEventListener('click', () => {
    const total = document.querySelectorAll('.rest-row').length;
    if (total >= MAX_RESTRICCIONES) return;

    const lista = document.getElementById('restrictionsList');
    const nuevaRest = { a: 0, b: 0, signo: '<=', c: 0 };
    const fila = crearFilaRestriccion(nuevaRest, total);
    lista.appendChild(fila);

    actualizarEstadoBotonAgregar();
  });
}

// ── Activar eliminar en las filas iniciales del HTML ────────────────────

function inicializarFilasExistentes() {
  document.querySelectorAll('.rest-row').forEach(row => {
    const delBtn = row.querySelector('.rest-del');
    if (!delBtn) return;

    if (delBtn.dataset.bound) return;
    delBtn.dataset.bound = 'true';

    delBtn.addEventListener('click', () => {
      row.remove();
      reindexarRestricciones();
    });
  });
}

// ── Inicialización general (un solo bloque) ─────────────────────────────

function inicializarTodo() {
  inicializarEjemplos();
  inicializarBotonAgregar();
  inicializarFilasExistentes();
  actualizarEstadoBotonAgregar();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', inicializarTodo);
} else {
  inicializarTodo();
}

function cargarEjemplo(ej) {
  const btnMax = document.getElementById('btnMax');
  const btnMin = document.getElementById('btnMin');

  if (ej.tipo === 'max') {
    btnMax.classList.add('active');
    btnMin.classList.remove('active');
  } else {
    btnMin.classList.add('active');
    btnMax.classList.remove('active');
  }

  document.getElementById('c1').value = ej.c1;
  document.getElementById('c2').value = ej.c2;

  const lista = document.getElementById('restrictionsList');
  lista.innerHTML = '';
  ej.restricciones.forEach((r, idx) => {
    lista.appendChild(crearFilaRestriccion(r, idx));
  });

  actualizarEstadoBotonAgregar();

  // Rango fijo del ejemplo (no se sobreescribe)
  document.getElementById('xmin').value = ej.rango.xmin;
  document.getElementById('xmax').value = ej.rango.xmax;
  document.getElementById('ymin').value = ej.rango.ymin;
  document.getElementById('ymax').value = ej.rango.ymax;

  // Calcular SIN autoajustar el rango
  if (typeof calcularSinAjustarRango === 'function') {
    calcularSinAjustarRango();
  }
  if (typeof dibujarGrafica === 'function') {
    setTimeout(() => dibujarGrafica(), 60);
  }
}

// ── Autoajuste de rango X/Y según los datos del usuario ─────────────────

function ajustarRangoAutomatico() {
  const restricciones = obtenerRestricciones();
  if (!restricciones || restricciones.length === 0) return;

  let maxX = 0;
  let maxY = 0;

  restricciones.forEach(r => {
    if (Math.abs(r.a) > 1e-8) {
      const x = r.c / r.a;
      if (isFinite(x) && x > maxX) maxX = x;
    }
    if (Math.abs(r.b) > 1e-8) {
      const y = r.c / r.b;
      if (isFinite(y) && y > maxY) maxY = y;
    }
  });

  const vertices = obtenerVertices(restricciones);
  const factibles = vertices.filter(p => esFactible(p, restricciones));

  factibles.forEach(p => {
    if (isFinite(p.x) && p.x > maxX) maxX = p.x;
    if (isFinite(p.y) && p.y > maxY) maxY = p.y;
  });

  if (maxX <= 0) maxX = 10;
  if (maxY <= 0) maxY = 10;

  maxX = Math.ceil(maxX * 1.15);
  maxY = Math.ceil(maxY * 1.15);

  document.getElementById('xmin').value = 0;
  document.getElementById('xmax').value = maxX;
  document.getElementById('ymin').value = 0;
  document.getElementById('ymax').value = maxY;
}