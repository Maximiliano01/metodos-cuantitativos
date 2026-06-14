document.getElementById("btnMax").addEventListener("click", () => {
  document.getElementById("btnMax").classList.add("active");
  document.getElementById("btnMin").classList.remove("active");
});

document.getElementById("btnMin").addEventListener("click", () => {
  document.getElementById("btnMin").classList.add("active");
  document.getElementById("btnMax").classList.remove("active");
});

// Forzar actualización de la gráfica cuando se modifican rangos
function configurarEventosGrafica() {
    const xmin = document.getElementById("xmin");
    const xmax = document.getElementById("xmax");
    const ymin = document.getElementById("ymin");
    const ymax = document.getElementById("ymax");
    const decimals = document.getElementById("decimals");
    const showCoords = document.getElementById("showCoords");
    
    const inputs = [xmin, xmax, ymin, ymax, decimals, showCoords];
    inputs.forEach(input => {
        if (input) {
            input.addEventListener("change", () => {
                if (typeof dibujarGrafica === 'function') {
                    setTimeout(() => dibujarGrafica(), 10);
                }
            });
        }
    });
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', configurarEventosGrafica);
} else {
    configurarEventosGrafica();
}

document.querySelector(".calc-btn").addEventListener("click", calcularSegunTipo);

function calcularSegunTipo() {
  const esMin = document.getElementById("btnMin").classList.contains("active");

  ajustarRangoAutomatico(); // autoajuste solo cuando el usuario presiona el botón

  if (esMin) {
    calcularMinimizacion();
  } else {
    calcularMaximizacion();
  }
}

// Nueva función auxiliar SIN autoajuste, para usar desde los ejemplos
function calcularSinAjustarRango() {
  const esMin = document.getElementById("btnMin").classList.contains("active");

  if (esMin) {
    calcularMinimizacion();
  } else {
    calcularMaximizacion();
  }
}

    document.addEventListener('DOMContentLoaded', () => {
        const yaVisto = localStorage.getItem('metodoGraficoExplicacionVista');
        if (!yaVisto) {
            const modal = new bootstrap.Modal(document.getElementById('modalExplicacion'));
            modal.show();
            localStorage.setItem('metodoGraficoExplicacionVista', 'true');
        }
    });