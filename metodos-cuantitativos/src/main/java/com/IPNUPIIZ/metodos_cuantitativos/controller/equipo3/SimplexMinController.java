package com.IPNUPIIZ.metodos_cuantitativos.controller.equipo3;

import com.IPNUPIIZ.metodos_cuantitativos.model.equipo3.SimplexResult;
import com.IPNUPIIZ.metodos_cuantitativos.service.equipo3.SimplexService;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

@Controller
@RequestMapping("/equipo3")
public class SimplexMinController {

    private final SimplexService simplexService;

    public SimplexMinController(SimplexService simplexService) {
        this.simplexService = simplexService;
    }

    // El dashboard principal de tu equipo
    @GetMapping
    public String index(Model model) {
        model.addAttribute("activePage", "inicio");
        return "equipo3/index_sm"; // Busca en templates/equipo3/index_sm.html
    }

    @GetMapping("/ejemplo")
    public String showExample(Model model) {
        model.addAttribute("activePage", "inicio");
        return "equipo3/ejemplo";
    }

    @GetMapping("/minimize")
    public String minimizeForm(Model model) {
        model.addAttribute("activePage", "minimize");
        model.addAttribute("preloaded", false);
        return "equipo3/minimize";
    }

    @PostMapping("/minimize")
    public String solve(
            @RequestParam int numVars,
            @RequestParam int numConstraints,
            @RequestParam(value = "obj", required = false) double[] rawObj,
            @RequestParam(value = "aij", required = false) double[] rawAij,
            @RequestParam(value = "b", required = false) double[] rawB,
            @RequestParam(value = "type", required = false) String[] rawTypes,
            Model model) {

        model.addAttribute("activePage", "minimize");

        try {
            // Validación de dimensiones
            if (numVars < 1 || numVars > 10) throw new IllegalArgumentException("Número de variables inválido (1-10).");
            if (numConstraints < 1 || numConstraints > 10) throw new IllegalArgumentException("Número de restricciones inválido (1-10).");

            // 1. Parsear coeficientes de la función objetivo
            double[] objCoeffs = new double[numVars];
            if (rawObj != null) {
                for (int j = 0; j < Math.min(numVars, rawObj.length); j++) objCoeffs[j] = rawObj[j];
            }

            // 2. Parsear matriz A (coeficientes de las restricciones)
            double[][] A = new double[numConstraints][numVars];
            if (rawAij != null) {
                for (int i = 0; i < numConstraints; i++)
                    for (int j = 0; j < numVars; j++) {
                        int idx = i * numVars + j;
                        if (idx < rawAij.length) A[i][j] = rawAij[idx];
                    }
            }

            // 3. Parsear el arreglo b (Lado derecho de las restricciones)
            double[] b = new double[numConstraints];
            if (rawB != null) {
                for (int i = 0; i < Math.min(numConstraints, rawB.length); i++) {
                    b[i] = rawB[i];
                    if (b[i] < 0) throw new IllegalArgumentException("El RHS no puede ser negativo en la restricción " + (i+1) + ".");
                }
            }

            // 4. Parsear tipos de restricciones
            String[] types = new String[numConstraints];
            for (int i = 0; i < numConstraints; i++) {
                types[i] = (rawTypes != null && i < rawTypes.length) ? rawTypes[i] : "<=";
            }

            // 5. Ejecutar la lógica matemática del servicio
            SimplexResult result = simplexService.solve(numVars, numConstraints, objCoeffs, A, b, types);

            // 6. Mandar todo a la vista (Result.html)
            model.addAttribute("result", result);
            model.addAttribute("numVars", numVars);
            model.addAttribute("numConstraints", numConstraints);
            model.addAttribute("objCoeffs", objCoeffs);
            model.addAttribute("A", A);
            model.addAttribute("b", b);
            model.addAttribute("types", types);
            model.addAttribute("solved", true);
            model.addAttribute("errorMsg", null);

        } catch (Exception ex) {
            model.addAttribute("solved", false);
            model.addAttribute("errorMsg", ex.getMessage());
        }

        return "equipo3/result";
    }
}