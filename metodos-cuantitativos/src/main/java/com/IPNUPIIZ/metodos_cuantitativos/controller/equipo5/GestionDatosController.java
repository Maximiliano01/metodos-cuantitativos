package com.IPNUPIIZ.metodos_cuantitativos.controller.equipo5;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
@RequestMapping("/equipo5")
public class GestionDatosController {

    /**
     * Página principal del módulo Gestión de Datos – Equipo 5
     * URL: http://localhost:8082/equipo5
     */
    @GetMapping
    public String paginaGestionDatos() {
        return "forward:/equipo5/index.html";
    }
}
