package com.IPNUPIIZ.metodos_cuantitativos.model.equipo3;

import java.util.List;

/**
 * Resultado completo del método Simplex de minimización.
 *
 * Relación matemática clave:
 *   Min Z = c^T x  →  (transformación)  Max W = -c^T x
 *   W* = -Z_min  →  Z_min = -W*
 */
public class SimplexResult {

    /** Valores óptimos de las variables de decisión x1, x2, ..., xn */
    private double[] solution;

    /** Valor óptimo del problema auxiliar de maximización W* */
    private double wStar;

    /** Valor mínimo real de Z = -W* */
    private double zMin;

    /** Lista de iteraciones (tablas) del simplex */
    private List<SimplexIteration> iterations;

    /** Nombres de todas las variables (decision + holgura + artificiales) */
    private String[] varNames;

    /** Número de variables de decisión */
    private int numVars;

    /** ¿El problema tiene solución factible? */
    private boolean feasible;

    /** ¿El problema es acotado (no es no acotado)? */
    private boolean bounded;

    public SimplexResult(double[] solution, double wStar, double zMin,
                         List<SimplexIteration> iterations, String[] varNames,
                         int numVars, boolean feasible) {
        this.solution = solution;
        this.wStar = wStar;
        this.zMin = zMin;
        this.iterations = iterations;
        this.varNames = varNames;
        this.numVars = numVars;
        this.feasible = feasible;
        this.bounded = true;
    }

    /** Formatea un valor de solución */
    public String formatSolution(int index) {
        return com.IPNUPIIZ.metodos_cuantitativos.util.equipo3.FractionUtil.format(solution[index]);
    }

    public String formatZMin() {
        return com.IPNUPIIZ.metodos_cuantitativos.util.equipo3.FractionUtil.format(zMin);
    }

    public String formatWStar() {
        return com.IPNUPIIZ.metodos_cuantitativos.util.equipo3.FractionUtil.format(wStar);
    }

    public int getNumIterations() {
        return iterations.size();
    }

    // ── Getters ────────────────────────────────────────────────────────────────

    public double[] getSolution()            { return solution; }
    public double getWStar()                 { return wStar; }
    public double getZMin()                  { return zMin; }
    public List<SimplexIteration> getIterations() { return iterations; }
    public String[] getVarNames()            { return varNames; }
    public int getNumVars()                  { return numVars; }
    public boolean isFeasible()              { return feasible; }
    public boolean isBounded()               { return bounded; }
    public void setBounded(boolean bounded)  { this.bounded = bounded; }
}
