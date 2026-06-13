package com.IPNUPIIZ.metodos_cuantitativos.util.equipo3;

/**
 * Utilidad para mostrar números como fracciones o decimales limpios.
 * Mejora la legibilidad del tableau en el contexto educativo.
 */
public class FractionUtil {

    private static final double EPS = 1e-7;

    /**
     * Formatea un valor double como fracción cuando es posible,
     * o como decimal con hasta 4 lugares significativos.
     */
    public static String format(double value) {
        // Manejar valores extremadamente grandes (Big-M residuales)
        if (Math.abs(value) > 1e5) {
            return String.format("%.0f", value);
        }

        // Entero
        if (Math.abs(value - Math.round(value)) < EPS) {
            long rounded = Math.round(value);
            return String.valueOf(rounded);
        }

        // Buscar fracción con denominador hasta 1000
        for (int d = 2; d <= 1000; d++) {
            double n = value * d;
            if (Math.abs(n - Math.round(n)) < EPS) {
                long num = Math.round(n);
                long den = d;
                long g = gcd(Math.abs(num), den);
                num /= g;
                den /= g;
                if (den == 1) return String.valueOf(num);
                return num + "/" + den;
            }
        }

        // Decimal con 4 dígitos, sin ceros finales
        String formatted = String.format("%.4f", value);
        formatted = formatted.replaceAll("0+$", "").replaceAll("\\.$", "");
        return formatted;
    }

    /**
     * Versión para celdas del tableau con color: muestra fracciones.
     * Agrega parén si es negativo para claridad visual.
     */
    public static String formatCell(double value) {
        String s = format(value);
        return s;
    }

    private static long gcd(long a, long b) {
        return b == 0 ? a : gcd(b, a % b);
    }
}
