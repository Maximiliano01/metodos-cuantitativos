
document.querySelector(".calc-btn").addEventListener("click", calcularSegunTipo);

function calcularSegunTipo() {
  const esMin = document.getElementById("btnMin").classList.contains("active");

  if (esMin) {
    calcularMinimizacion();
  } else {
    calcularMaximizacion();
  }
}

function calcularMinimizacion() {
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

  // Mínimo: reduce en lugar de max
  const optimo = evaluados.reduce((min, p) => p.z < min.z ? p : min, evaluados[0]);

  mostrarResultadoMin(optimo, evaluados);
}

// ── Funciones compartidas (misma lógica que Maximizacion.js) ──────────────────

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

function interseccion(r1, r2) {
  const det = r1.a * r2.b - r2.a * r1.b;
  if (det === 0) return null;

  const x = (r2.b * r1.c - r1.b * r2.c) / det;
  const y = (r1.a * r2.c - r2.a * r1.c) / det;

  return { x, y };
}

function obtenerVertices(restricciones) {
  let puntos = [];

  for (let i = 0; i < restricciones.length; i++) {
    for (let j = i + 1; j < restricciones.length; j++) {
      const p = interseccion(restricciones[i], restricciones[j]);
      if (p) puntos.push(p);
    }
  }

  restricciones.forEach(r => {
    if (r.b !== 0) puntos.push({ x: 0, y: r.c / r.b });
    if (r.a !== 0) puntos.push({ x: r.c / r.a, y: 0 });
  });

  puntos.push({ x: 0, y: 0 });

  return puntos;
}

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

//Resultado 

function mostrarResultadoMin(optimo, lista) {
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
        <td>${esOpt ? '<span class="sol-badge-opt">▼ Mínimo</span>' : ''}</td>
      </tr>
    `;
  });

  tabla += `</tbody></table>`;

  box.innerHTML = `
    <div class="sol-optimal">
      <div class="sol-star">▼</div>
      <div class="sol-data">
        <div class="sol-z-label">Mínimo de Z</div>
        <div class="sol-z-value">Z* = ${optimo.z.toFixed(2)}</div>
        <div class="sol-coords">
          x₁* = ${optimo.x.toFixed(2)} · x₂* = ${optimo.y.toFixed(2)}
        </div>
      </div>
    </div>
    ${tabla}
  `;
}

function mostrarSinSolucion() {
  const box = document.getElementById("solutionBox");
  box.innerHTML = `<div class="sol-empty">No hay solución factible</div>`;
}

// Notificar que se actualizó la solución para refrescar la gráfica
const mostrarResultadoMinOriginal = window.mostrarResultadoMin || mostrarResultadoMin;
window.mostrarResultadoMin = function(optimo, lista) {
    if (mostrarResultadoMinOriginal) {
        mostrarResultadoMinOriginal(optimo, lista);
    }
    if (typeof dibujarGrafica === 'function') {
        setTimeout(() => dibujarGrafica(), 50);
    }
};

