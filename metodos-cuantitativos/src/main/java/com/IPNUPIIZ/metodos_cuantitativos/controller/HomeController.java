package com.IPNUPIIZ.metodos_cuantitativos.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class HomeController {

    @GetMapping("/")
    public String home() {
        return "forward:/index.html";
    }
    
    @GetMapping("/api/health")
    public String healthCheck() {
        return "Sistema funcionando correctamente!";
    }
}