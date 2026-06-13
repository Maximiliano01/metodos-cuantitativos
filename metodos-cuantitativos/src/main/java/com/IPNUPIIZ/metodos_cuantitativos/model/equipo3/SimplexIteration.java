package com.IPNUPIIZ.metodos_cuantitativos.model.equipo3;

/**
 * Representa una iteración del método Simplex con su tabla completa.
 */
public class SimplexIteration {

    private int iterationNumber;
    private double[][] tableau;
    private String[] basisVariables;
    private String[] allVariables;
    private int pivotRow;       // -1 si es la tabla inicial
    private int pivotCol;       // -1 si es la tabla inicial
    private String enteringVar; // Variable que entra a la base
    private String leavingVar;  // Variable que sale de la base
    private double pivotElement;

    public SimplexIteration(int iterationNumber, double[][] tableau,
                            String[] basisVariables, String[] allVariables,
                            int pivotRow, int pivotCol,
                            String enteringVar, String leavingVar) {
        this.iterationNumber = iterationNumber;
        this.tableau = deepCopy(tableau);
        this.basisVariables = basisVariables.clone();
        this.allVariables = allVariables.clone();
        this.pivotRow = pivotRow;
        this.pivotCol = pivotCol;
        this.enteringVar = enteringVar;
        this.leavingVar = leavingVar;
        if (pivotRow >= 0 && pivotCol >= 0) {
            this.pivotElement = tableau[pivotRow][pivotCol];
        }
    }

    private double[][] deepCopy(double[][] source) {
        double[][] copy = new double[source.length][];
        for (int i = 0; i < source.length; i++) {
            copy[i] = source[i].clone();
        }
        return copy;
    }

    /** Formatea un valor para mostrar (fracciones o decimales limpios) */
    public String formatCell(double value) {
        return com.IPNUPIIZ.metodos_cuantitativos.util.equipo3.FractionUtil.format(value);
    }

    /** Devuelve el número de columnas del tableau (sin RHS) */
    public int getNumCols() {
        return tableau[0].length - 1;
    }

    /** Devuelve el número de filas de restricciones */
    public int getNumConstraintRows() {
        return tableau.length - 1;
    }

    /** Verifica si una celda es el pivote */
    public boolean isPivotCell(int row, int col) {
        return row == pivotRow && col == pivotCol;
    }

    // ── Getters ────────────────────────────────────────────────────────────────

    public int getIterationNumber() { return iterationNumber; }
    public double[][] getTableau() { return tableau; }
    public String[] getBasisVariables() { return basisVariables; }
    public String[] getAllVariables() { return allVariables; }
    public int getPivotRow() { return pivotRow; }
    public int getPivotCol() { return pivotCol; }
    public String getEnteringVar() { return enteringVar; }
    public String getLeavingVar() { return leavingVar; }
    public double getPivotElement() { return pivotElement; }
}
