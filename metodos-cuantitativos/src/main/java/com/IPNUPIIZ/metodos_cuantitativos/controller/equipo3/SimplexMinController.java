package com.IPNUPIIZ.metodos_cuantitativos.controller.equipo3;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
@RequestMapping("/equipo3")
public class SimplexMinController {

    /**
     * Página principal del módulo Simplex Minimización – Equipo 3
     * URL: http://localhost:8082/equipo3
     */
    @GetMapping
    public String paginaSimplexMin() {
        return "forward:/equipo3/index.html";
    }
}
