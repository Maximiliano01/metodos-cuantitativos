package com.IPNUPIIZ.metodos_cuantitativos.service.equipo3;

import com.IPNUPIIZ.metodos_cuantitativos.model.equipo3.SimplexIteration;
import com.IPNUPIIZ.metodos_cuantitativos.model.equipo3.SimplexResult;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

/**
 * Servicio principal del Método Simplex de MINIMIZACIÓN.
 *
 * ══════════════════════════════════════════════════════════════════
 * ENFOQUE MATEMÁTICO
 * ══════════════════════════════════════════════════════════════════
 *
 * Para resolver  Min Z = c^T x  usamos la transformación:
 *
 *   La fila objetivo del tableau almacena los coeficientes c_j originales.
 *   Se busca el coeficiente MÁS NEGATIVO como variable entrante.
 *   Esto equivale a maximizar W = -Z.
 *
 *   Al final:  RHS de fila objetivo = W* = -Z_min
 *              ∴  Z_min = -W*
 *
 * VARIABLES ADICIONALES (Big-M):
 *   ≤  →  agrega holgura  s_i  (+1),  coef. objetivo = 0
 *   ≥  →  agrega excedente e_i (-1) + artificial a_i (+1),  coef. obj = +M
 *   =  →  agrega artificial a_i (+1),  coef. obj = +M
 * ══════════════════════════════════════════════════════════════════
 */
@Service
public class SimplexService {

    private static final double EPSILON     = 1e-9;
    private static final double BIG_M       = 1_000_000.0;
    private static final int    MAX_ITERS   = 200;

    /**
     * Resuelve el problema de minimización.
     *
     * @param numVars          Número de variables de decisión
     * @param numConstraints   Número de restricciones
     * @param objCoeffs        Coeficientes de la función objetivo (Min Z)
     * @param A                Matriz de coeficientes de restricciones [m x n]
     * @param b                Lado derecho de las restricciones [m]
     * @param types            Tipos de restricciones ("<=", ">=", "=") [m]
     * @return                 Resultado completo con iteraciones
     */
    public SimplexResult solve(int numVars, int numConstraints,
                               double[] objCoeffs, double[][] A,
                               double[] b, String[] types) {

        // ── 1. Preparar variables adicionales ────────────────────────────────
        List<String> varNamesList = new ArrayList<>();
        for (int j = 0; j < numVars; j++) varNamesList.add("x" + (j + 1));

        int[] slackIdx      = new int[numConstraints];
        int[] surplusIdx    = new int[numConstraints];
        int[] artificialIdx = new int[numConstraints];
        Arrays.fill(slackIdx,      -1);
        Arrays.fill(surplusIdx,    -1);
        Arrays.fill(artificialIdx, -1);

        int col = numVars;
        int slackCnt = 0, surplusCnt = 0, artCnt = 0;

        for (int i = 0; i < numConstraints; i++) {
            switch (types[i]) {
                case "<=" -> {
                    slackIdx[i] = col++;
                    varNamesList.add("s" + (++slackCnt));
                }
                case ">=" -> {
                    surplusIdx[i]    = col++;
                    varNamesList.add("e" + (++surplusCnt));
                    artificialIdx[i] = col++;
                    varNamesList.add("a" + (++artCnt));
                }
                case "=" -> {
                    artificialIdx[i] = col++;
                    varNamesList.add("a" + (++artCnt));
                }
            }
        }

        int totalVars = col;
        String[] varNames = varNamesList.toArray(new String[0]);

        // ── 2. Construir el tableau inicial ───────────────────────────────────
        // Dimensión: (numConstraints + 1) filas  x  (totalVars + 1) columnas
        // La última fila es la fila objetivo W.
        // La última columna es el lado derecho (RHS / constante).
        double[][] tableau = new double[numConstraints + 1][totalVars + 1];

        for (int i = 0; i < numConstraints; i++) {
            // Copiar coeficientes de restricción
            for (int j = 0; j < numVars; j++) {
                tableau[i][j] = A[i][j];
            }
            tableau[i][totalVars] = b[i]; // RHS

            if (slackIdx[i]   >= 0) tableau[i][slackIdx[i]]      = +1.0;
            if (surplusIdx[i] >= 0) tableau[i][surplusIdx[i]]    = -1.0;
            if (artificialIdx[i] >= 0) tableau[i][artificialIdx[i]] = +1.0;
        }

        // Fila objetivo: coeficientes originales de Min Z (c_j)
        for (int j = 0; j < numVars; j++) {
            tableau[numConstraints][j] = objCoeffs[j];
        }
        // Penalizar artificiales con Big-M
        for (int i = 0; i < numConstraints; i++) {
            if (artificialIdx[i] >= 0) {
                tableau[numConstraints][artificialIdx[i]] = BIG_M;
            }
        }

        // ── 3. Base inicial ───────────────────────────────────────────────────
        int[] basis = new int[numConstraints];
        for (int i = 0; i < numConstraints; i++) {
            if (slackIdx[i] >= 0)      basis[i] = slackIdx[i];
            else if (artificialIdx[i] >= 0) basis[i] = artificialIdx[i];
        }

        // ── 4. Actualizar fila objetivo con artificiales en base (Big-M) ─────
        for (int i = 0; i < numConstraints; i++) {
            if (artificialIdx[i] >= 0 && basis[i] == artificialIdx[i]) {
                double factor = tableau[numConstraints][artificialIdx[i]]; // = BIG_M
                for (int j = 0; j <= totalVars; j++) {
                    tableau[numConstraints][j] -= factor * tableau[i][j];
                }
            }
        }

        // ── 5. Iteraciones del Simplex ────────────────────────────────────────
        List<SimplexIteration> iterations = new ArrayList<>();

        // Guardar tabla inicial (iteración 0)
        iterations.add(snapshot(0, tableau, basis, varNames, -1, -1, null, null,
                                numConstraints, totalVars));

        boolean unbounded = false;
        int iter = 1;

        while (iter <= MAX_ITERS) {

            // ── 5a. Seleccionar columna pivote (coeficiente más negativo) ─────
            int pivotCol = -1;
            double mostNeg = -EPSILON;
            for (int j = 0; j < totalVars; j++) {
                if (tableau[numConstraints][j] < mostNeg) {
                    mostNeg = tableau[numConstraints][j];
                    pivotCol = j;
                }
            }
            if (pivotCol == -1) break; // Óptimo alcanzado

            // ── 5b. Seleccionar fila pivote (prueba de razón mínima) ──────────
            int pivotRow = -1;
            double minRatio = Double.MAX_VALUE;
            for (int i = 0; i < numConstraints; i++) {
                if (tableau[i][pivotCol] > EPSILON) {
                    double ratio = tableau[i][totalVars] / tableau[i][pivotCol];
                    if (ratio < minRatio - EPSILON) {
                        minRatio = ratio;
                        pivotRow = i;
                    }
                }
            }
            if (pivotRow == -1) {
                unbounded = true;
                break; // Problema no acotado
            }

            String entering = varNames[pivotCol];
            String leaving  = varNames[basis[pivotRow]];

            // ── 5c. Operación de pivote ───────────────────────────────────────
            double pivotElem = tableau[pivotRow][pivotCol];

            // Normalizar fila pivote
            for (int j = 0; j <= totalVars; j++) {
                tableau[pivotRow][j] /= pivotElem;
            }

            // Eliminar de todas las demás filas (incluida la fila objetivo)
            for (int i = 0; i <= numConstraints; i++) {
                if (i != pivotRow && Math.abs(tableau[i][pivotCol]) > EPSILON) {
                    double factor = tableau[i][pivotCol];
                    for (int j = 0; j <= totalVars; j++) {
                        tableau[i][j] -= factor * tableau[pivotRow][j];
                    }
                }
            }

            // ── 5d. Actualizar base ───────────────────────────────────────────
            basis[pivotRow] = pivotCol;

            // ── 5e. Guardar iteración ─────────────────────────────────────────
            iterations.add(snapshot(iter, tableau, basis, varNames, pivotRow, pivotCol,
                                    entering, leaving, numConstraints, totalVars));
            iter++;
        }

        // ── 6. Extraer solución ───────────────────────────────────────────────
        double[] solution = new double[numVars];
        for (int i = 0; i < numConstraints; i++) {
            if (basis[i] < numVars) {
                solution[basis[i]] = tableau[i][totalVars];
            }
        }

        // W* = RHS de la fila objetivo al finalizar
        // Z_min = -W*  (porque W = -Z, por eso W* = -Z_min)
        double wStar = tableau[numConstraints][totalVars];
        double zMin  = -wStar;

        // Verificar factibilidad: ningún artificial debe quedar positivo en base
        boolean feasible = true;
        for (int i = 0; i < numConstraints; i++) {
            for (int k = 0; k < numConstraints; k++) {
                if (artificialIdx[k] >= 0
                        && basis[i] == artificialIdx[k]
                        && tableau[i][totalVars] > EPSILON) {
                    feasible = false;
                }
            }
        }

        SimplexResult result = new SimplexResult(solution, wStar, zMin, iterations,
                                                 varNames, numVars, feasible);
        result.setBounded(!unbounded);
        return result;
    }

    // ── Utilidades ────────────────────────────────────────────────────────────

    /** Crea una instantánea inmutable del tableau actual. */
    private SimplexIteration snapshot(int num, double[][] tab, int[] basis,
                                      String[] varNames, int pivotRow, int pivotCol,
                                      String entering, String leaving,
                                      int m, int totalVars) {
        String[] basisVars = new String[m];
        for (int i = 0; i < m; i++) basisVars[i] = varNames[basis[i]];
        return new SimplexIteration(num, tab, basisVars, varNames,
                                    pivotRow, pivotCol, entering, leaving);
    }
}
