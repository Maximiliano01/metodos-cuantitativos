package com.IPNUPIIZ.metodos_cuantitativos.controller.equipo1;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
@RequestMapping("/equipo1")
public class MetodoGraficoController {

    /**
     * Página principal del módulo de Método Gráfico – Equipo 1
     * URL: http://localhost:8082/equipo1
     */
    @GetMapping
    public String paginaMetodoGrafico() {
        return "forward:/equipo1/index.html";
    }
}
