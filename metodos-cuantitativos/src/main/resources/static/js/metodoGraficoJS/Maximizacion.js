// Calcular maximizacion

function calcularMaximizacion() {
  const c1 = parseFloat(document.getElementById("c1").value);
  const c2 = parseFloat(document.getElementById("c2").value);

  const restricciones = obtenerRestricciones();

  const vertices = obtenerVertices(restricciones);

  const factibles = vertices.filter(p => esFactible(p, restricciones));

  const evaluados = factibles.map(p => ({
    x: p.x,
    y: p.y,
    z: c1 * p.x + c2 * p.y
  }));

  if (evaluados.length === 0) {
    mostrarSinSolucion();
    return;
  }

  const optimo = evaluados.reduce((max, p) => p.z > max.z ? p : max, evaluados[0]);

  mostrarResultado(optimo, evaluados);
}

// Obtener las restricciones
function obtenerRestricciones() {
  const rows = document.querySelectorAll(".rest-row");
  let restricciones = [];

  rows.forEach(row => {
    const inputs = row.querySelectorAll("input");
    const select = row.querySelector("select");

    const a = parseFloat(inputs[0].value) || 0;
    const b = parseFloat(inputs[1].value) || 0;
    const c = parseFloat(inputs[2].value) || 0;

    // Ignorar filas vacías/degeneradas (a=0 y b=0) para que no rompan el problema
    if (a === 0 && b === 0) return;

    restricciones.push({ a, b, signo: select.value, c });
  });

  return restricciones;
}

// Intersecciones
function interseccion(r1, r2) {
  const det = r1.a * r2.b - r2.a * r1.b;

  if (det === 0) return null;

  const x = (r2.b * r1.c - r1.b * r2.c) / det;
  const y = (r1.a * r2.c - r2.a * r1.c) / det;

  return { x, y };
}

// Obtener vertices
function obtenerVertices(restricciones) {
  let puntos = [];

  // Intersecciones entre restricciones
  for (let i = 0; i < restricciones.length; i++) {
    for (let j = i + 1; j < restricciones.length; j++) {
      const p = interseccion(restricciones[i], restricciones[j]);
      if (p) puntos.push(p);
    }
  }

  // Intersecciones con ejes
  restricciones.forEach(r => {
    if (r.b !== 0) puntos.push({ x: 0, y: r.c / r.b });
    if (r.a !== 0) puntos.push({ x: r.c / r.a, y: 0 });
  });

  // Origen
  puntos.push({ x: 0, y: 0 });

  return puntos;
}

// Validar factibilidad
function esFactible(p, restricciones) {

if (p.x < -1e-6 || p.y < -1e-6) return false;

  return restricciones.every(r => {
    const val = r.a * p.x + r.b * p.y;

    switch (r.signo) {
      case "<=": return val <= r.c + 1e-6;
      case ">=": return val >= r.c - 1e-6;
      case "=":  return Math.abs(val - r.c) < 1e-6;
    }
  });
}

// Resultado óptimo
function mostrarResultado(optimo, lista) {
  const box = document.getElementById("solutionBox");

  let tabla = `
    <table class="vertices-table">
      <thead>
        <tr>
          <th>Vértice</th><th>x₁</th><th>x₂</th><th>Z</th><th></th>
        </tr>
      </thead>
      <tbody>
  `;

  lista.forEach((p, i) => {
    const esOpt = Math.abs(p.z - optimo.z) < 1e-6;

    tabla += `
      <tr class="${esOpt ? 'is-opt' : ''}">
        <td>V${i + 1}</td>
        <td>${p.x.toFixed(2)}</td>
        <td>${p.y.toFixed(2)}</td>
        <td>${p.z.toFixed(2)}</td>
        <td>${esOpt ? '<span class="sol-badge-opt">★ Óptimo</span>' : ''}</td>
      </tr>
    `;
  });

  tabla += `</tbody></table>`;

  box.innerHTML = `
    <div class="sol-optimal">
      <div class="sol-star">★</div>
      <div class="sol-data">
        <div class="sol-z-label">Máximo de Z</div>
        <div class="sol-z-value">Z* = ${optimo.z.toFixed(2)}</div>
        <div class="sol-coords">
          x₁* = ${optimo.x.toFixed(2)} · x₂* = ${optimo.y.toFixed(2)}
        </div>
      </div>
    </div>
    ${tabla}
  `;
}
 //Por si no hay soluciones correctas
function mostrarSinSolucion() {
  const box = document.getElementById("solutionBox");

  box.innerHTML = `
    <div class="sol-empty">
      No hay solución factible
    </div>
  `;
  limpiarGrafica();
  limpiarPasos();
}

//Esto es solo para limpiar

function limpiarGrafica() {
  const canvas = document.getElementById("graphCanvas");
  const ctx = canvas.getContext("2d");

  ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function limpiarPasos() {
  const panel = document.getElementById("stepsPanel");
  panel.innerHTML = "No hay solución factible para este problema.";
}

// Notificar que se actualizó la solución para refrescar la gráfica
const mostrarResultadoOriginal = window.mostrarResultado || mostrarResultado;
window.mostrarResultado = function(optimo, lista) {
    if (mostrarResultadoOriginal) {
        mostrarResultadoOriginal(optimo, lista);
    }
    if (typeof dibujarGrafica === 'function') {
        setTimeout(() => dibujarGrafica(), 50);
    }
};


