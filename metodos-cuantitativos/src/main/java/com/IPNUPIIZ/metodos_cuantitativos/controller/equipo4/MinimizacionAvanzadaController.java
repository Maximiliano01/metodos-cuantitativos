package com.IPNUPIIZ.metodos_cuantitativos.controller.equipo4;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
@RequestMapping("/equipo4")
public class MinimizacionAvanzadaController {

    /**
     * Página principal del módulo Minimización Avanzada – Equipo 4
     * URL: http://localhost:8082/equipo4
     */
    @GetMapping
    public String paginaMinimizacionAvanzada() {
        return "forward:/equipo4/index.html";
    }
}
