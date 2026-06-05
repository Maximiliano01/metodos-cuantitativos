package com.IPNUPIIZ.metodos_cuantitativos.controller.equipo2;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
@RequestMapping("/equipo2")
public class SimplexMaxController {

    /**
     * Página principal del módulo Simplex Maximización – Equipo 2
     * URL: http://localhost:8082/equipo2
     */
    @GetMapping
    public String paginaSimplexMax() {
        return "forward:/equipo2/index.html";
    }
}
