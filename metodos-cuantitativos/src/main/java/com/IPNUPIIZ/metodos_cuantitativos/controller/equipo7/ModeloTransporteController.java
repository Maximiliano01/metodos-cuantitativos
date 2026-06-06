package com.IPNUPIIZ.metodos_cuantitativos.controller.equipo7;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
@RequestMapping("/equipo7")
public class ModeloTransporteController {

    /**
     * Página principal del módulo Modelo de Transporte – Equipo 7
     * URL: http://localhost:8082/equipo7
     */
    @GetMapping
    public String paginaModeloTransporte() {
        return "forward:/equipo7/index.html";
    }
}
