/**
 * simplex.js — Motor del Método Simplex (Maximización)
 * Proyecto: ProyectoSimplex
 */

"use strict";

const SimplexSolver = (() => {

  /* ─────────────────────────────────────────────
     UTILIDADES
  ───────────────────────────────────────────── */
  const EPSILON = 1e-9;

  function round(val, dec = 6) {
    return Math.round(val * 10 ** dec) / 10 ** dec;
  }

  function fractionStr(val) {
    val = round(val);
    if (Number.isInteger(val)) return String(val);
    return val.toFixed(4);
  }

  // Deep-copy de matriz
  function copyMatrix(m) {
    return m.map(r => [...r]);
  }

  /* ─────────────────────────────────────────────
     CONSTRUCCIÓN DEL TABLEAU INICIAL
     Variables de holgura añadidas automáticamente
  ───────────────────────────────────────────── */
  function buildTableau(objCoeffs, constraints) {
    /*
      objCoeffs  : [c1, c2, …, cn]   (coeficientes de la FO, maximizar Z)
      constraints: [{coeffs:[a1…an], sign:'<=','>=','=', rhs:b}, …]

      Devuelve:
        tableau    : matriz aumentada  (m+1) × (n + m + 1)
                     — última fila = fila Z (negativa)
                     — última columna = RHS
        basics     : índices de variables básicas (una por restricción)
        varNames   : nombres de todas las variables de la tabla
        numVars    : n (originales)
        numSlack   : variables de holgura/artificiales añadidas
    */
    const n = objCoeffs.length;
    const m = constraints.length;

    // Sólo manejamos <= en este solucionador básico.
    // >= se convierte restando holgura y sumando artificial.
    // = suma artificial directamente.
    // Para simplicidad académica usamos Big-M.
    const BIG_M = 1e6;

    // Identificar cuántas variables extras necesitamos
    let slackCount = 0;
    let artificialCount = 0;

    const extraInfo = constraints.map(c => {
      if (c.sign === "<=") {
        slackCount++;
        return { type: "slack", sIdx: slackCount - 1, aIdx: null };
      } else if (c.sign === ">=") {
        slackCount++;
        artificialCount++;
        return { type: "surplus", sIdx: slackCount - 1, aIdx: artificialCount - 1 };
      } else { // "="
        artificialCount++;
        return { type: "eq", sIdx: null, aIdx: artificialCount - 1 };
      }
    });

    const totalCols = n + slackCount + artificialCount + 1; // +1 RHS
    const totalRows = m + 1; // +1 fila Z

    // Inicializar tableau en cero
    const T = Array.from({ length: totalRows }, () => new Array(totalCols).fill(0));

    // Llenar filas de restricciones
    constraints.forEach((c, i) => {
      // Variables originales
      for (let j = 0; j < n; j++) T[i][j] = c.coeffs[j];

      const info = extraInfo[i];
      if (info.type === "slack") {
        T[i][n + info.sIdx] = 1; // holgura +
      } else if (info.type === "surplus") {
        T[i][n + info.sIdx] = -1; // holgura -
        T[i][n + slackCount + info.aIdx] = 1; // artificial
      } else { // eq
        T[i][n + slackCount + info.aIdx] = 1; // artificial
      }

      T[i][totalCols - 1] = c.rhs; // RHS
    });

    // Fila Z: FO negativa + penalización Big-M para artificiales
    for (let j = 0; j < n; j++) T[m][j] = -objCoeffs[j];
    for (let a = 0; a < artificialCount; a++) {
      T[m][n + slackCount + a] = BIG_M;
    }

    // Ajustar fila Z: restar M × filas con artificiales básicas
    extraInfo.forEach((info, i) => {
      if (info.aIdx !== null) {
        for (let j = 0; j < totalCols; j++) {
          T[m][j] += -BIG_M * T[i][j];
        }
      }
    });

    // Índices básicos iniciales
    const basics = constraints.map((c, i) => {
      const info = extraInfo[i];
      if (info.type === "slack") return n + info.sIdx;
      else if (info.type === "surplus") return n + slackCount + info.aIdx;
      else return n + slackCount + info.aIdx;
    });

    // Nombres de columnas
    const varNames = [];
    for (let j = 0; j < n; j++) varNames.push(`x${j + 1}`);
    for (let s = 0; s < slackCount; s++) varNames.push(`s${s + 1}`);
    for (let a = 0; a < artificialCount; a++) varNames.push(`A${a + 1}`);
    varNames.push("Z / RHS");

    return {
      tableau: T, basics, varNames,
      numVars: n, numSlack: slackCount, numArtificial: artificialCount
    };
  }

  /* ─────────────────────────────────────────────
     PIVOTEO
  ───────────────────────────────────────────── */
  function pivot(T, pivotRow, pivotCol) {
    const m = T.length;
    const n = T[0].length;
    const pivotVal = T[pivotRow][pivotCol];

    // Dividir fila pivote
    for (let j = 0; j < n; j++) T[pivotRow][j] /= pivotVal;

    // Eliminar en otras filas
    for (let i = 0; i < m; i++) {
      if (i === pivotRow) continue;
      const factor = T[i][pivotCol];
      if (Math.abs(factor) < EPSILON) continue;
      for (let j = 0; j < n; j++) {
        T[i][j] -= factor * T[pivotRow][j];
      }
    }
  }

  /* ─────────────────────────────────────────────
     RESOLVER
  ───────────────────────────────────────────── */
  function solve(objCoeffs, constraints) {
    const { tableau, basics, varNames, numVars } = buildTableau(objCoeffs, constraints);
    const m = tableau.length - 1; // filas de restricción
    const n = tableau[0].length - 1; // columnas sin RHS
    const iterations = [];

    // Guardar iteración inicial
    iterations.push({
      label: "Tableau Inicial",
      tableau: copyMatrix(tableau),
      basics: [...basics],
      varNames: [...varNames],
      pivotRow: null,
      pivotCol: null,
      entering: null,
      leaving: null
    });

    let iter = 0;
    const MAX_ITER = 200;

    while (iter < MAX_ITER) {
      iter++;
      const zRow = tableau[m];

      // Columna pivote: más negativo en fila Z
      let pivotCol = -1;
      let minVal = -EPSILON;
      for (let j = 0; j < n; j++) {
        if (zRow[j] < minVal) { minVal = zRow[j]; pivotCol = j; }
      }

      if (pivotCol === -1) break; // óptimo

      // Fila pivote: mínima razón positiva
      let pivotRow = -1;
      let minRatio = Infinity;
      for (let i = 0; i < m; i++) {
        if (tableau[i][pivotCol] > EPSILON) {
          const ratio = tableau[i][n] / tableau[i][pivotCol];
          if (ratio < minRatio - EPSILON) { minRatio = ratio; pivotRow = i; }
        }
      }

      if (pivotRow === -1) {
        iterations.push({ error: "El problema es no acotado (unbounded)." });
        return { status: "unbounded", iterations };
      }

      const entering = varNames[pivotCol];
      const leaving = varNames[basics[pivotRow]];

      pivot(tableau, pivotRow, pivotCol);
      basics[pivotRow] = pivotCol;

      iterations.push({
        label: `Iteración ${iter}`,
        tableau: copyMatrix(tableau),
        basics: [...basics],
        varNames: [...varNames],
        pivotRow,
        pivotCol,
        entering,
        leaving
      });
    }

    // Extraer solución
    const solution = new Array(varNames.length - 1).fill(0);
    for (let i = 0; i < m; i++) {
      solution[basics[i]] = round(tableau[i][n]);
    }

    // Verificar artificiales != 0 → infeasible
    const totalCols = tableau[0].length - 1;
    const artStart = numVars + (totalCols - numVars - iterations[0].varNames.filter(v => v.startsWith("A")).length - 1);

    const zValue = round(-tableau[m][n]); // la fila Z está negada

    // Variables de decisión
    const xValues = [];
    for (let j = 0; j < numVars; j++) {
      xValues.push({ name: varNames[j], value: round(solution[j]) });
    }

    return {
      status: "optimal",
      iterations,
      solution: xValues,
      zValue,
      varNames
    };
  }

  /* ─────────────────────────────────────────────
     PÚBLICA
  ───────────────────────────────────────────── */
  return { solve, fractionStr };
})();
