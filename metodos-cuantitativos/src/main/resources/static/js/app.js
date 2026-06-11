/**
 * app.js — Controlador de interfaz para el Solucionador Simplex
 * Proyecto: ProyectoSimplex
 */

"use strict";

/* ─────────────────────────────────────────────
   ESTADO GLOBAL
───────────────────────────────────────────── */
let numVars = 2;
let numConstraints = 2;

/* ─────────────────────────────────────────────
   INICIALIZACIÓN
───────────────────────────────────────────── */
document.addEventListener("DOMContentLoaded", () => {
  buildForms();

  document.getElementById("btnSolve").addEventListener("click", handleSolve);
  document.getElementById("btnReset").addEventListener("click", handleReset);

  document.getElementById("selVars").addEventListener("change", e => {
    numVars = parseInt(e.target.value);
    buildForms();
  });

  document.getElementById("selConstraints").addEventListener("change", e => {
    numConstraints = parseInt(e.target.value);
    buildForms();
  });
});

/* ─────────────────────────────────────────────
   CONSTRUCCIÓN DINÁMICA DE FORMULARIOS
───────────────────────────────────────────── */
function buildForms() {
  buildObjectiveForm();
  buildConstraintsForm();
  clearResults();
}

function buildObjectiveForm() {
  const container = document.getElementById("objFunctionRow");
  container.innerHTML = "";

  for (let j = 1; j <= numVars; j++) {
    const col = document.createElement("div");
    col.className = "col-auto d-flex align-items-center gap-1 mb-2";
    col.innerHTML = `
      ${j > 1 ? '<span class="fw-bold fs-5 text-primary">+</span>' : ""}
      <input type="number" class="form-control form-control-sm coeff-obj" 
             id="obj_x${j}" placeholder="c${j}" style="width:80px" value="0" step="any">
      <span class="text-muted small">x<sub>${j}</sub></span>`;
    container.appendChild(col);
  }
}

function buildConstraintsForm() {
  const container = document.getElementById("constraintsContainer");
  container.innerHTML = "";

  for (let i = 1; i <= numConstraints; i++) {
    const row = document.createElement("div");
    row.className = "constraint-row row g-2 align-items-center mb-3 p-3 rounded-3 border border-secondary border-opacity-25";
    row.dataset.idx = i;

    let inner = `<div class="col-12 col-lg-auto">
      <span class="badge bg-primary-subtle text-primary-emphasis fw-semibold px-2">R${i}</span>
    </div>`;

    for (let j = 1; j <= numVars; j++) {
      inner += `
        <div class="col-auto d-flex align-items-center gap-1">
          ${j > 1 ? '<span class="fw-bold text-primary">+</span>' : ""}
          <input type="number" class="form-control form-control-sm coeff-constraint"
                 id="c${i}_x${j}" placeholder="a${i}${j}" style="width:80px" value="0" step="any">
          <span class="text-muted small">x<sub>${j}</sub></span>
        </div>`;
    }

    inner += `
      <div class="col-auto">
        <select class="form-select form-select-sm sign-select" id="sign_${i}" style="width:75px">
          <option value="<=">&le;</option>
          <option value=">=">&ge;</option>
          <option value="=">=</option>
        </select>
      </div>
      <div class="col-auto">
        <input type="number" class="form-control form-control-sm rhs-input"
               id="rhs_${i}" placeholder="b${i}" style="width:90px" value="0" step="any">
      </div>`;

    row.innerHTML = inner;
    container.appendChild(row);
  }
}

/* ─────────────────────────────────────────────
   LEER DATOS DEL FORMULARIO
───────────────────────────────────────────── */
function readFormData() {
  const errors = [];

  // Coeficientes FO
  const objCoeffs = [];
  for (let j = 1; j <= numVars; j++) {
    const val = parseFloat(document.getElementById(`obj_x${j}`).value);
    if (isNaN(val)) errors.push(`Coeficiente de x${j} en función objetivo inválido.`);
    else objCoeffs.push(val);
  }

  // Restricciones
  const constraints = [];
  for (let i = 1; i <= numConstraints; i++) {
    const coeffs = [];
    for (let j = 1; j <= numVars; j++) {
      const val = parseFloat(document.getElementById(`c${i}_x${j}`).value);
      if (isNaN(val)) errors.push(`Coeficiente de x${j} en restricción R${i} inválido.`);
      else coeffs.push(val);
    }
    const rhs = parseFloat(document.getElementById(`rhs_${i}`).value);
    if (isNaN(rhs)) errors.push(`RHS de restricción R${i} inválido.`);
    const sign = document.getElementById(`sign_${i}`).value;
    constraints.push({ coeffs, sign, rhs });
  }

  return { objCoeffs, constraints, errors };
}

/* ─────────────────────────────────────────────
   RESOLVER
───────────────────────────────────────────── */
function handleSolve() {
  clearResults();
  const { objCoeffs, constraints, errors } = readFormData();

  if (errors.length > 0) {
    showAlert("danger", errors.join("<br>"));
    return;
  }

  let result;
  try {
    result = SimplexSolver.solve(objCoeffs, constraints);
  } catch (e) {
    showAlert("danger", "Error al resolver: " + e.message);
    return;
  }

  renderResults(result, objCoeffs, constraints);

  // Scroll suave a resultados
  document.getElementById("resultsSection").scrollIntoView({ behavior: "smooth" });
}

function handleReset() {
  document.querySelectorAll("input[type=number]").forEach(el => el.value = "0");
  document.querySelectorAll(".sign-select").forEach(el => el.value = "<=");
  clearResults();
}

/* ─────────────────────────────────────────────
   RENDERIZAR RESULTADOS
───────────────────────────────────────────── */
function renderResults(result, objCoeffs, constraints) {
  const section = document.getElementById("resultsSection");
  section.classList.remove("d-none");

  // Tarjeta de estado
  if (result.status === "unbounded") {
    showAlert("warning", "⚠️ El problema es <strong>no acotado</strong>. No existe solución óptima finita.");
    return;
  }

  if (result.status === "infeasible") {
    showAlert("warning", "⚠️ El problema es <strong>infactible</strong>. No existe región factible.");
    return;
  }

  // Formulación
  renderFormulation(objCoeffs, constraints);

  // Iteraciones
  renderIterations(result.iterations);

  // Resultado final
  renderFinalResult(result);
}

function renderFormulation(objCoeffs, constraints) {
  const container = document.getElementById("formulationBlock");
  let html = `<p class="mb-1"><strong>Maximizar:</strong> Z = `;
  html += objCoeffs.map((c, j) => `${j > 0 ? " + " : ""}${c}x<sub>${j + 1}</sub>`).join("");
  html += `</p><p class="mb-1"><strong>Sujeto a:</strong></p><ul class="mb-0">`;
  constraints.forEach((c, i) => {
    html += `<li>`;
    html += c.coeffs.map((a, j) => `${j > 0 ? " + " : ""}${a}x<sub>${j + 1}</sub>`).join("");
    html += ` ${c.sign === "<=" ? "≤" : c.sign === ">=" ? "≥" : "="} ${c.rhs}</li>`;
  });
  html += `<li>x<sub>j</sub> ≥ 0 para todo j</li></ul>`;
  container.innerHTML = html;
}

function renderIterations(iterations) {
  const container = document.getElementById("iterationsContainer");
  container.innerHTML = "";

  iterations.forEach((iter, idx) => {
    if (iter.error) {
      container.innerHTML += `<div class="alert alert-warning">${iter.error}</div>`;
      return;
    }

    const T = iter.tableau;
    const m = T.length - 1;
    const cols = T[0].length;
    const varNames = iter.varNames;
    const basics = iter.basics;

    // Encabezado de iteración
    let card = `
      <div class="iteration-card card border-0 shadow-sm mb-4">
        <div class="card-header d-flex align-items-center gap-3 py-2 px-3">
          <span class="badge rounded-pill bg-primary">${idx}</span>
          <strong class="flex-grow-1">${iter.label}</strong>
          ${iter.entering ? `
            <span class="badge bg-success-subtle text-success-emphasis me-1">
              Entra: ${iter.entering}
            </span>
            <span class="badge bg-danger-subtle text-danger-emphasis">
              Sale: ${iter.leaving}
            </span>` : ""}
        </div>
        <div class="card-body p-0">
          <div class="table-responsive">
            <table class="table table-sm table-bordered table-hover mb-0 simplex-table">
              <thead class="table-dark">
                <tr>
                  <th class="text-center">Base</th>`;

    varNames.forEach((name, j) => {
      const isObj = j === cols - 1;
      const isRHS = j === cols - 1;
      const entering = iter.entering && varNames[j] === iter.entering;
      card += `<th class="text-center ${entering ? "col-entering" : ""}">${isRHS ? "RHS" : name}</th>`;
    });
    card += `</tr></thead><tbody>`;

    // Filas de restricciones
    for (let i = 0; i < m; i++) {
      const isZRow = false;
      const leaving = iter.leaving && varNames[basics[i]] === iter.leaving;
      card += `<tr class="${leaving ? "row-leaving" : ""}">
        <td class="text-center fw-semibold text-primary">${varNames[basics[i]]}</td>`;
      for (let j = 0; j < cols; j++) {
        const isPivot = i === iter.pivotRow && j === iter.pivotCol;
        card += `<td class="text-center ${isPivot ? "cell-pivot" : ""}">${SimplexSolver.fractionStr(T[i][j])}</td>`;
      }
      card += `</tr>`;
    }

    // Fila Z
    card += `<tr class="table-active fw-semibold">
      <td class="text-center text-warning fw-bold">Z</td>`;
    for (let j = 0; j < cols; j++) {
      card += `<td class="text-center">${SimplexSolver.fractionStr(T[m][j])}</td>`;
    }
    card += `</tr></tbody></table></div></div></div>`;

    container.innerHTML += card;
  });
}

function renderFinalResult(result) {
  const container = document.getElementById("finalResultBlock");

  let html = `
    <div class="row g-3 mb-4">
      <div class="col-12">
        <div class="result-z-card p-4 rounded-3 text-center">
          <div class="text-muted small text-uppercase letter-spacing-1 mb-1">Valor Óptimo</div>
          <div class="display-4 fw-bold text-success">Z* = ${result.zValue}</div>
        </div>
      </div>
    </div>
    <div class="row g-3">`;

  result.solution.forEach(v => {
    html += `
      <div class="col-6 col-md-4 col-lg-3">
        <div class="var-card p-3 rounded-3 text-center border border-primary border-opacity-25">
          <div class="text-muted small mb-1">${v.name}</div>
          <div class="fs-3 fw-bold text-primary">${v.value}</div>
        </div>
      </div>`;
  });

  html += `</div>`;
  container.innerHTML = html;
}

/* ─────────────────────────────────────────────
   UTILIDADES UI
───────────────────────────────────────────── */
function showAlert(type, msg) {
  const alertEl = document.getElementById("alertBox");
  alertEl.className = `alert alert-${type} alert-dismissible fade show`;
  alertEl.innerHTML = msg + `<button type="button" class="btn-close" data-bs-dismiss="alert"></button>`;
  alertEl.classList.remove("d-none");
}

function clearResults() {
  document.getElementById("resultsSection").classList.add("d-none");
  document.getElementById("iterationsContainer").innerHTML = "";
  document.getElementById("finalResultBlock").innerHTML = "";
  document.getElementById("formulationBlock").innerHTML = "";
  const alertEl = document.getElementById("alertBox");
  alertEl.className = "alert d-none";
  alertEl.innerHTML = "";
}
