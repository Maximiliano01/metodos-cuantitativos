package com.IPNUPIIZ.metodos_cuantitativos.controller.equipo6;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
@RequestMapping("/equipo6")
public class FlujoMaximoController {

    /**
     * Página principal del módulo de Flujo Máximo – Equipo 6
     * URL: http://localhost:8082/equipo6
     */
    @GetMapping
    public String paginaFlujoMaximo() {
        return "forward:/equipo6/index.html";
    }
}
