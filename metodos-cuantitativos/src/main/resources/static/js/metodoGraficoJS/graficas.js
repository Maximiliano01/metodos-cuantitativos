///graficas para metodo grafico

let canvas = null;
let ctx = null;
let xMin = 0, xMax = 10, yMin = 0, yMax = 10;
let scaleX = 1, scaleY = 1;
let originX = 0, originY = 0;
let canvasWidth = 0, canvasHeight = 0;

const coloresRestricciones = ['#C4566A', '#2D7FC4', '#2D9E6B', '#E8A735', '#9B59B6', '#E67E22'];
let rectasManuales = [];

// Inicializar canvas
document.addEventListener('DOMContentLoaded', function() {
    canvas = document.getElementById('graphCanvas');
    if (canvas) {
        ctx = canvas.getContext('2d');
        const wrap = canvas.parentElement;
        canvas.width = wrap.clientWidth;
        canvas.height = wrap.clientHeight;
        
        window.addEventListener('resize', () => {
            if (canvas.parentElement) {
                canvas.width = canvas.parentElement.clientWidth;
                canvas.height = canvas.parentElement.clientHeight;
                if (typeof dibujarGrafica === 'function') dibujarGrafica();
            }
        });
        
        setTimeout(() => {
            if (typeof dibujarGrafica === 'function') dibujarGrafica();
        }, 100);
    }
    
    cargarRectasManuales();
    inicializarEventosRectas();
});

function inicializarEventosRectas() {
    const addBtn = document.getElementById('addManualLineBtn');
    if (addBtn) {
        addBtn.addEventListener('click', agregarRectaDesdePuntos);
    }
}

function agregarRectaDesdePuntos() {
    const p1x = parseFloat(document.getElementById('p1x')?.value);
    const p1y = parseFloat(document.getElementById('p1y')?.value);
    const p2x = parseFloat(document.getElementById('p2x')?.value);
    const p2y = parseFloat(document.getElementById('p2y')?.value);
    
    if (isNaN(p1x) || isNaN(p1y) || isNaN(p2x) || isNaN(p2y)) {
        alert('Ingresa valores válidos para ambos puntos');
        return;
    }
    
    if (Math.abs(p2x - p1x) < 1e-8) {
        alert('Los puntos no pueden tener la misma coordenada x (división por cero)');
        return;
    }
    
    const m = (p2y - p1y) / (p2x - p1x);
    const b = p1y - m * p1x;
    
    const nuevaRecta = {
        id: Date.now(),
        m: m,
        b: b,
        color: generarColorRecta(),
        visible: true
    };
    
    rectasManuales.push(nuevaRecta);
    guardarRectasManuales();
    
    if (typeof dibujarGrafica === 'function') dibujarGrafica();
}

function generarColorRecta() {
    const colores = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#F39C12', '#E74C3C'];
    const usado = rectasManuales.map(r => r.color);
    const disponibles = colores.filter(c => !usado.includes(c));
    return disponibles.length > 0 ? disponibles[0] : colores[Math.floor(Math.random() * colores.length)];
}

function cargarRectasManuales() {
    const saved = localStorage.getItem('rectasManuales');
    if (saved) {
        try {
            rectasManuales = JSON.parse(saved);
        } catch(e) { rectasManuales = []; }
    }
    actualizarListaRectasUI();
}

function guardarRectasManuales() {
    localStorage.setItem('rectasManuales', JSON.stringify(rectasManuales));
    actualizarListaRectasUI();
}

function actualizarListaRectasUI() {
    const container = document.getElementById('manualLinesList');
    if (!container) return;
    
    if (rectasManuales.length === 0) {
        container.innerHTML = '<div class="manual-lines-empty">No hay rectas manuales. Usa los puntos para agregar una.</div>';
        return;
    }
    
    container.innerHTML = '';
    
    rectasManuales.forEach(recta => {
        const item = document.createElement('div');
        item.className = 'manual-line-item';
        item.innerHTML = `
            <div class="manual-line-color" style="background: ${recta.color};" 
                 onclick="cambiarColorRecta(${recta.id})" title="Cambiar color"></div>
            <div class="manual-line-formula">
                y = ${recta.m.toFixed(4)}x ${recta.b >= 0 ? '+' : '-'} ${Math.abs(recta.b).toFixed(4)}
            </div>
            <div class="manual-line-delete" onclick="eliminarRectaManual(${recta.id})" title="Eliminar">×</div>
        `;
        container.appendChild(item);
    });
}

window.cambiarColorRecta = function(id) {
    const recta = rectasManuales.find(r => r.id === id);
    if (recta) {
        const input = document.createElement('input');
        input.type = 'color';
        input.value = recta.color;
        input.addEventListener('change', (e) => {
            recta.color = e.target.value;
            guardarRectasManuales();
            if (typeof dibujarGrafica === 'function') dibujarGrafica();
        });
        input.click();
    }
};

window.eliminarRectaManual = function(id) {
    rectasManuales = rectasManuales.filter(r => r.id !== id);
    guardarRectasManuales();
    if (typeof dibujarGrafica === 'function') dibujarGrafica();
};

function dibujarRectasManuales() {
    ctx.save();
    
    for (const recta of rectasManuales) {
        if (!recta.visible) continue;
        
        ctx.strokeStyle = recta.color;
        ctx.lineWidth = 2.2;
        ctx.setLineDash([]);
        
        const x1 = xMin;
        const y1 = recta.m * x1 + recta.b;
        const x2 = xMax;
        const y2 = recta.m * x2 + recta.b;
        
        if (isFinite(y1) && isFinite(y2)) {
            const screenX1 = x1 * scaleX + originX;
            const screenY1 = originY - y1 * scaleY;
            const screenX2 = x2 * scaleX + originX;
            const screenY2 = originY - y2 * scaleY;
            
            if (screenX1 >= -200 && screenX1 <= canvasWidth + 200) {
                ctx.beginPath();
                ctx.moveTo(screenX1, screenY1);
                ctx.lineTo(screenX2, screenY2);
                ctx.stroke();
                
                ctx.font = '9px Arial, sans-serif';
                ctx.fillStyle = recta.color;
                ctx.shadowBlur = 0;
                const formula = `y = ${recta.m.toFixed(2)}x ${recta.b >= 0 ? '+' : '-'} ${Math.abs(recta.b).toFixed(2)}`;
                ctx.fillText(formula, screenX2 - 55, screenY2 - 4);
            }
        }
    }
    
    ctx.restore();
}

window.dibujarGrafica = function() {
    if (!canvas || !ctx) {
        canvas = document.getElementById('graphCanvas');
        if (!canvas) return;
        ctx = canvas.getContext('2d');
    }
    
    const placeholder = document.querySelector('.canvas-placeholder');
    if (placeholder) placeholder.style.display = 'none';
    
    const wrap = canvas.parentElement;
    canvas.width = wrap.clientWidth;
    canvas.height = wrap.clientHeight;
    canvasWidth = canvas.width;
    canvasHeight = canvas.height;
    
    const xminInput = document.getElementById('xmin');
    const xmaxInput = document.getElementById('xmax');
    const yminInput = document.getElementById('ymin');
    const ymaxInput = document.getElementById('ymax');
    
    if (xminInput) xMin = parseFloat(xminInput.value) || 0;
    if (xmaxInput) xMax = parseFloat(xmaxInput.value) || 10;
    if (yminInput) yMin = parseFloat(yminInput.value) || 0;
    if (ymaxInput) yMax = parseFloat(ymaxInput.value) || 10;
    
    if (xMin >= xMax) xMax = xMin + 1;
    if (yMin >= yMax) yMax = yMin + 1;
    
    scaleX = canvasWidth / (xMax - xMin);
    scaleY = canvasHeight / (yMax - yMin);
    originX = -xMin * scaleX;
    originY = canvasHeight + yMin * scaleY;
    
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);
    
    dibujarCuadricula();
    dibujarEjes();
    
    const restricciones = window.obtenerRestricciones();
    if (!restricciones || restricciones.length === 0) {
        dibujarMensajeSinRestricciones();
        dibujarRectasManuales(); 
        return;
    }
    
    //dibujar restricciones
    restricciones.forEach((r, idx) => {
        dibujarRestriccion(r, coloresRestricciones[idx % coloresRestricciones.length]);
    });
    
    //dibujar region factible
    const region = calcularRegionFactible(restricciones);
    
    // Dibujar region factible SOLO si el checkbox esta marcado
    const showRegion = document.getElementById('showRegion')?.checked ?? true;
    if (region && region.length > 0 && showRegion) {
        dibujarRegionFactible(region);
    }
    
    // Obtener vertices factibles
    const vertices = window.obtenerVertices(restricciones);
    const factibles = vertices.filter(p => window.esFactible(p, restricciones));
    
    // Mostrar coordenadas de vertices si esta activado
    const showCoords = document.getElementById('showCoords');
    if (showCoords && showCoords.checked && factibles.length > 0) {
        dibujarVertices(factibles);
    }
    
    // Encontrar y dibujar punto optimo
    const esMin = document.getElementById('btnMin')?.classList.contains('active') || false;
    const c1 = parseFloat(document.getElementById('c1')?.value) || 0;
    const c2 = parseFloat(document.getElementById('c2')?.value) || 0;
    
    if (factibles.length > 0 && (Math.abs(c1) > 1e-6 || Math.abs(c2) > 1e-6)) {
        const optimo = encontrarOptimo(factibles, c1, c2, esMin);
        if (optimo) {
            dibujarPuntoOptimo(optimo);
        }
    }
    
    // Dibujar rectas manuales agregadas por el usuario
    dibujarRectasManuales();
    
    // Actualisar leyenda y panel de pasos
    actualizarLeyenda(restricciones);
    actualizarPasos(restricciones, factibles, c1, c2, esMin);
};

function dibujarCuadricula() {
    ctx.save();
    ctx.strokeStyle = '#E8E0E2';
    ctx.lineWidth = 0.5;
    
    const stepX = calcularStep(xMin, xMax);
    for (let x = Math.ceil(xMin / stepX) * stepX; x <= xMax; x += stepX) {
        const screenX = x * scaleX + originX;
        if (screenX >= 0 && screenX <= canvasWidth) {
            ctx.beginPath();
            ctx.moveTo(screenX, 0);
            ctx.lineTo(screenX, canvasHeight);
            ctx.stroke();
        }
    }
    
    const stepY = calcularStep(yMin, yMax);
    for (let y = Math.ceil(yMin / stepY) * stepY; y <= yMax; y += stepY) {
        const screenY = originY - y * scaleY;
        if (screenY >= 0 && screenY <= canvasHeight) {
            ctx.beginPath();
            ctx.moveTo(0, screenY);
            ctx.lineTo(canvasWidth, screenY);
            ctx.stroke();
        }
    }
    
    ctx.restore();
}

function calcularStep(min, max) {
    const range = max - min;
    const roughStep = range / 10;
    const power = Math.pow(10, Math.floor(Math.log10(roughStep)));
    const residual = roughStep / power;
    
    if (residual < 1.5) return power;
    if (residual < 3.5) return 2 * power;
    if (residual < 7.5) return 5 * power;
    return 10 * power;
}

function dibujarEjes() {
    ctx.save();
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = '#6B1A2A';
    ctx.fillStyle = '#6B1A2A';
    
    const y0 = originY;
    if (y0 >= 0 && y0 <= canvasHeight) {
        ctx.beginPath();
        ctx.moveTo(0, y0);
        ctx.lineTo(canvasWidth, y0);
        ctx.stroke();
        
        ctx.beginPath();
        ctx.moveTo(canvasWidth - 8, y0 - 4);
        ctx.lineTo(canvasWidth, y0);
        ctx.lineTo(canvasWidth - 8, y0 + 4);
        ctx.fill();
    }
    
    const x0 = originX;
    if (x0 >= 0 && x0 <= canvasWidth) {
        ctx.beginPath();
        ctx.moveTo(x0, 0);
        ctx.lineTo(x0, canvasHeight);
        ctx.stroke();
        
        ctx.beginPath();
        ctx.moveTo(x0 - 4, 8);
        ctx.lineTo(x0, 0);
        ctx.lineTo(x0 + 4, 8);
        ctx.fill();
    }
    
    ctx.font = '11px Arial, sans-serif';
    if (y0 >= 0 && y0 <= canvasHeight) ctx.fillText('x₁', canvasWidth - 12, y0 - 5);
    if (x0 >= 0 && x0 <= canvasWidth) ctx.fillText('x₂', x0 + 5, 12);
    
    ctx.font = '10px Arial, sans-serif';
    ctx.fillStyle = '#7A4A52';
    
    const stepX = calcularStep(xMin, xMax);
    for (let x = Math.ceil(xMin / stepX) * stepX; x <= xMax; x += stepX) {
        const screenX = x * scaleX + originX;
        if (screenX >= 0 && screenX <= canvasWidth && Math.abs(x) > 1e-6) {
            ctx.beginPath();
            ctx.moveTo(screenX, y0 - 3);
            ctx.lineTo(screenX, y0 + 3);
            ctx.stroke();
            const decimals = parseInt(document.getElementById('decimals')?.value) || 2;
            ctx.fillText(x.toFixed(decimals), screenX - 8, y0 + (y0 < canvasHeight - 15 ? 12 : -5));
        }
    }
    
    const stepY = calcularStep(yMin, yMax);
    for (let y = Math.ceil(yMin / stepY) * stepY; y <= yMax; y += stepY) {
        const screenY = originY - y * scaleY;
        if (screenY >= 0 && screenY <= canvasHeight && Math.abs(y) > 1e-6) {
            ctx.beginPath();
            ctx.moveTo(x0 - 3, screenY);
            ctx.lineTo(x0 + 3, screenY);
            ctx.stroke();
            const decimals = parseInt(document.getElementById('decimals')?.value) || 2;
            ctx.fillText(y.toFixed(decimals), x0 + 8, screenY + 3);
        }
    }
    
    if (x0 >= 0 && x0 <= canvasWidth && y0 >= 0 && y0 <= canvasHeight) {
        ctx.fillStyle = '#6B1A2A';
        ctx.beginPath();
        ctx.arc(x0, y0, 3, 0, 2 * Math.PI);
        ctx.fill();
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(x0, y0, 1.5, 0, 2 * Math.PI);
        ctx.fill();
    }
    
    ctx.restore();
}

function dibujarRestriccion(r, color) {
    if (Math.abs(r.a) < 1e-8 && Math.abs(r.b) < 1e-8) return;
    
    ctx.save();
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.setLineDash([8, 5]);
    
    if (Math.abs(r.b) > 1e-8) {
        const x1 = xMin;
        const y1 = (r.c - r.a * x1) / r.b;
        const x2 = xMax;
        const y2 = (r.c - r.a * x2) / r.b;
        
        if (isFinite(y1) && isFinite(y2)) {
            const screenX1 = x1 * scaleX + originX;
            const screenY1 = originY - y1 * scaleY;
            const screenX2 = x2 * scaleX + originX;
            const screenY2 = originY - y2 * scaleY;
            
            if (clipLine(screenX1, screenY1, screenX2, screenY2)) {
                ctx.beginPath();
                ctx.moveTo(screenX1, screenY1);
                ctx.lineTo(screenX2, screenY2);
                ctx.stroke();
            }
        }
    } else if (Math.abs(r.a) > 1e-8) {
        const x = r.c / r.a;
        if (x >= xMin && x <= xMax) {
            const screenX = x * scaleX + originX;
            ctx.beginPath();
            ctx.moveTo(screenX, 0);
            ctx.lineTo(screenX, canvasHeight);
            ctx.stroke();
        }
    }
    
    ctx.setLineDash([]);
    ctx.restore();
}

function clipLine(x1, y1, x2, y2) {
    const dentro1 = x1 >= -100 && x1 <= canvasWidth + 100 && y1 >= -100 && y1 <= canvasHeight + 100;
    const dentro2 = x2 >= -100 && x2 <= canvasWidth + 100 && y2 >= -100 && y2 <= canvasHeight + 100;
    return dentro1 || dentro2;
}

function calcularRegionFactible(restricciones) {
    let puntos = [];
    
    for (let i = 0; i < restricciones.length; i++) {
        for (let j = i + 1; j < restricciones.length; j++) {
            const p = window.interseccion(restricciones[i], restricciones[j]);
            if (p && window.esFactible(p, restricciones)) puntos.push(p);
        }
    }
    
    for (const r of restricciones) {
        if (Math.abs(r.b) > 1e-8) {
            const y = r.c / r.b;
            if (y >= 0 && window.esFactible({ x: 0, y: y }, restricciones)) puntos.push({ x: 0, y: y });
        }
        if (Math.abs(r.a) > 1e-8) {
            const x = r.c / r.a;
            if (x >= 0 && window.esFactible({ x: x, y: 0 }, restricciones)) puntos.push({ x: x, y: 0 });
        }
    }
    
    if (window.esFactible({ x: 0, y: 0 }, restricciones)) puntos.push({ x: 0, y: 0 });
    
    const unicos = [];
    for (const p of puntos) {
        let duplicado = false;
        for (const u of unicos) {
            if (Math.abs(p.x - u.x) < 1e-6 && Math.abs(p.y - u.y) < 1e-6) {
                duplicado = true;
                break;
            }
        }
        if (!duplicado && isFinite(p.x) && isFinite(p.y) && p.x >= -1e-6 && p.y >= -1e-6) {
            unicos.push({ x: Math.max(0, p.x), y: Math.max(0, p.y) });
        }
    }
    
    if (unicos.length < 3) return null;
    
    let cx = 0, cy = 0;
    for (const p of unicos) { cx += p.x; cy += p.y; }
    cx /= unicos.length;
    cy /= unicos.length;
    
    unicos.sort((a, b) => Math.atan2(a.y - cy, a.x - cx) - Math.atan2(b.y - cy, b.x - cx));
    
    return unicos;
}

function dibujarRegionFactible(vertices) {
    if (!vertices || vertices.length < 3) return;
    
    ctx.save();
    const screenPoints = vertices.map(v => ({ x: v.x * scaleX + originX, y: originY - v.y * scaleY }));
    
    ctx.beginPath();
    ctx.moveTo(screenPoints[0].x, screenPoints[0].y);
    for (let i = 1; i < screenPoints.length; i++) ctx.lineTo(screenPoints[i].x, screenPoints[i].y);
    ctx.closePath();
    
    // sombreado de la region factible
    ctx.fillStyle = 'rgba(107, 26, 42, 0.12)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(107, 26, 42, 0.4)';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([6, 4]);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.restore();
}

function dibujarVertices(vertices) {
    if (!vertices || vertices.length === 0) return;
    
    ctx.save();
    const decimals = parseInt(document.getElementById('decimals')?.value) || 2;
    
    for (const v of vertices) {
        const screenX = v.x * scaleX + originX;
        const screenY = originY - v.y * scaleY;
        
        if (screenX >= 0 && screenX <= canvasWidth && screenY >= 0 && screenY <= canvasHeight) {
            ctx.beginPath();
            ctx.arc(screenX, screenY, 4, 0, 2 * Math.PI);
            ctx.fillStyle = 'rgba(107, 26, 42, 0.25)';
            ctx.fill();
            ctx.beginPath();
            ctx.arc(screenX, screenY, 2, 0, 2 * Math.PI);
            ctx.fillStyle = '#6B1A2A';
            ctx.fill();
            
            ctx.font = '10px Arial, sans-serif';
            ctx.fillStyle = '#6B1A2A';
            const label = `(${v.x.toFixed(decimals)}, ${v.y.toFixed(decimals)})`;
            ctx.fillText(label, screenX + 6, screenY - 4);
        }
    }
    
    ctx.restore();
}

function encontrarOptimo(factibles, c1, c2, esMin) {
    if (factibles.length === 0) return null;
    
    let optimo = factibles[0];
    let mejorValor = c1 * optimo.x + c2 * optimo.y;
    
    for (const p of factibles) {
        const valor = c1 * p.x + c2 * p.y;
        if (esMin) { if (valor < mejorValor) { mejorValor = valor; optimo = p; } }
        else { if (valor > mejorValor) { mejorValor = valor; optimo = p; } }
    }
    
    return optimo;
}

function dibujarPuntoOptimo(optimo) {
    const screenX = optimo.x * scaleX + originX;
    const screenY = originY - optimo.y * scaleY;
    
    if (screenX >= 0 && screenX <= canvasWidth && screenY >= 0 && screenY <= canvasHeight) {
        ctx.save();
        ctx.beginPath();
        ctx.arc(screenX, screenY, 8, 0, 2 * Math.PI);
        ctx.fillStyle = 'rgba(201, 147, 58, 0.25)';
        ctx.fill();
        ctx.strokeStyle = '#C9933A';
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(screenX, screenY, 4, 0, 2 * Math.PI);
        ctx.fillStyle = '#C9933A';
        ctx.fill();
        ctx.beginPath();
        ctx.arc(screenX - 1.5, screenY - 1.5, 1.5, 0, 2 * Math.PI);
        ctx.fillStyle = 'rgba(255,255,255,0.7)';
        ctx.fill();
        ctx.restore();
    }
}

function actualizarLeyenda(restricciones) {
    const legendBar = document.getElementById('legendBar');
    if (!legendBar) return;
    
   
    while (legendBar.children.length > 1) {
        legendBar.removeChild(legendBar.children[1]);
    }
    
    // Agregar restriccion a la leyenda
    for (let i = 0; i < restricciones.length && i < 8; i++) {
        const color = coloresRestricciones[i % coloresRestricciones.length];
        const legendItem = document.createElement('div');
        legendItem.className = 'legend-item';
        legendItem.innerHTML = `<div class="leg-line" style="background: ${color};"></div><span>R${i + 1}</span>`;
        legendBar.appendChild(legendItem);
    }
}

function actualizarPasos(restricciones, vertices, c1, c2, esMin) {
    const stepsPanel = document.getElementById('stepsPanel');
    if (!stepsPanel) return;
    
    if (!restricciones || restricciones.length === 0) {
        stepsPanel.innerHTML = `<strong> Método Gráfico</strong><br>Agrega restricciones en el panel izquierdo y presiona <strong>Calcular y Graficar</strong>.`;
        return;
    }
    
    let html = '<strong> Proceso del Método Gráfico</strong><br>';
    html += '1. Se grafican las restricciones en el plano cartesiano.<br>';
    html += `2. Se identifican ${vertices.length} vértices en la región factible.<br>`;
    
    if (vertices.length > 0) {
        html += `3. Se evalúa la función objetivo Z = ${c1}x₁ ${c2 >= 0 ? '+' : '-'} ${Math.abs(c2)}x₂ en cada vértice.<br>`;
        html += `4. El valor ${esMin ? 'mínimo' : 'máximo'} encontrado es la solución óptima.<br>`;
    } else {
        html += '3. No se encontraron vértices factibles. Verifica las restricciones.<br>';
    }
    
    const optLabel = esMin ? '▼ Mínimo' : '★ Máximo';
    html += `<span class="step-opt">${optLabel}</span> marcado en el gráfico con color dorado.`;
    
    stepsPanel.innerHTML = html;
}

function dibujarMensajeSinRestricciones() {
    ctx.save();
    ctx.font = '13px Arial, sans-serif';
    ctx.fillStyle = '#C4566A';
    ctx.textAlign = 'center';
    ctx.fillText('Agrega restricciones para visualizar la región factible', canvasWidth / 2, canvasHeight / 2);
    ctx.restore();
}