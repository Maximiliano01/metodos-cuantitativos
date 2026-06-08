//SCRIP MODULO DE TRANSPORTE
let numF = 0, numC = 0; //Numero de filas y columnas virtuales en ejecucion
let networkTransporte = null; //Red
let timeoutToast = null; //Tiempo del toast

//Toast para mensaje de error
function lanzarToastError(mensaje) {
    const toast = document.getElementById('toast-alerta');
    document.getElementById('toast-mensaje-body').innerHTML = mensaje;
    if(timeoutToast) clearTimeout(timeoutToast);
    toast.classList.add('show');
    timeoutToast = setTimeout(() => { ocultarToast(); }, 4000);
}

function ocultarToast() {
    const toast = document.getElementById('toast-alerta');
    toast.classList.remove('show');
}

function resetearZoom() { //Reseat el zoom en el grafo con el botón de la casa
    if (networkTransporte) {
        networkTransporte.fit({ animation: { duration: 800, easingFunction: 'easeInOutQuad' } });
    }
}

// FUNCIÓN DE ADICIÓN: Sincroniza dinámicamente los subcostos superiores "c: X" al escribir en el input
function actualizarSubCosto(i, j, valor) {
    const span = document.getElementById(`span-c-${i}-${j}`);
    if (span) {
        span.innerText = `c: ${valor || 0}`;
    }
}

//Es la función para generar la matriz de entradas
function generarMatrizInput() {
    //Obtiene las filas y las columnas definidas en los inputs
    let originalF = parseInt(document.getElementById('filas').value);
    let originalC = parseInt(document.getElementById('columnas').value);

    //Si dejo algun campo vació o ingreso valores negativos lanza el toast de error
    if(isNaN(originalF) || originalF <= 0 || isNaN(originalC) || originalC <= 0) {
        lanzarToastError("Las dimensiones de la red deben ser mayores a 0.");
        return;
    }
    //Genera la fila para los titulos
    let html = '<table class="table table-borderless table-minimalista text-center m-0"><thead><tr><th>O / D</th>';
    for(let j = 0; j < originalC; j++) html += `<th>D${j+1}</th>`;
    html += '<th class="texto-restriccion">Oferta</th></tr></thead><tbody>';

    //Genera las filas del cuerpo (donde van los costos)
    for(let i = 0; i < originalF; i++) {
        html += `<tr><td class="fw-bold text-secondary">O${i+1}</td>`;
        for(let j = 0; j < originalC; j++) {
            // Modificado para incluir id único en el span y el listener oninput reactivo
            html += `<td><span class="sub-costo" id="span-c-${i}-${j}">c: 0</span><input type="number" id="c-${i}-${j}" class="input-costo" placeholder="0" oninput="actualizarSubCosto(${i}, ${j}, this.value)"></td>`;
        }
        html += `<td><input type="number" id="o-${i}" class="input-costo texto-restriccion" placeholder="0"></td></tr>`;
    }

    //Genera la ultima fila de la tabla
    html += '</tbody><tfoot><tr><td class="fw-bold text-secondary">Demanda</td>';
    for(let j = 0; j < originalC; j++) {
        html += `<td><input type="number" id="d-${j}" class="input-costo texto-restriccion" placeholder="0"></td>`;
    }
    html += '<td class="text-muted">-</td></tr></tfoot></table>';

    document.getElementById('tabla-input-placeholder').innerHTML = html;
    document.getElementById('contenedor-matriz').style.display = 'block';
    document.getElementById('contenedor-resultados').style.display = 'none';

    setTimeout(() => { document.getElementById('contenedor-matriz').scrollIntoView({ behavior: 'smooth' }); }, 50);
}

//Funcion apra cargar los valore sde ejemplo
function cargarValoresEjemplo() {
    let originalF = parseInt(document.getElementById('filas').value);
    let originalC = parseInt(document.getElementById('columnas').value);
    const ejemplosCostos = [[3, 5, 6], [2, 4, 2], [8, 5, 4]];
    const ejemplosOferta = [20, 30, 25];
    const ejemplosDemanda = [15, 25, 35];

    for(let i = 0; i < originalF; i++) {
        for(let j = 0; j < originalC; j++) {
            let input = document.getElementById(`c-${i}-${j}`);
            let val = (i < 3 && j < 3) ? ejemplosCostos[i][j] : Math.floor(Math.random()*9)+1;
            if(input) {
                input.value = val;
                actualizarSubCosto(i, j, val); // Sincroniza dinámicamente al cargar el ejemplo los subcostos (c pequeña arriba)
            }
        }
        let inputO = document.getElementById(`o-${i}`);
        if(inputO) inputO.value = (i < 3) ? ejemplosOferta[i] : 20;
    }
    for(let j = 0; j < originalC; j++) {
        let inputD = document.getElementById(`d-${j}`);
        if(inputD) inputD.value = (j < 3) ? ejemplosDemanda[j] : 20;
    }
}

function limpiarTodo() {
    document.getElementById('filas').value = 3;
    document.getElementById('columnas').value = 3;
    document.getElementById('contenedor-matriz').style.display = 'none';
    document.getElementById('contenedor-resultados').style.display = 'none';
    if (networkTransporte) { networkTransporte.destroy(); networkTransporte = null; }
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

//Funcion para mostrar los pasos de desarrollo
function togglePasos() {
    let contenedor = document.getElementById('bloque-colapsable-pasos');
    let boton = document.getElementById('btn-pasos-toggle');
    if (contenedor.style.display === "block") {
        contenedor.style.display = "none";
        boton.innerHTML = '<i class="fas fa-eye"></i> Ver Memoria de Cálculo / Iteraciones Paso a Paso (▼)';
    } else {
        contenedor.style.display = "block";
        boton.innerHTML = '<i class="fas fa-eye-slash"></i> Ocultar Memoria de Cálculo / Iteraciones Paso a Paso (▲)';
    }
}

//Tabla de pasos adaptada para renderizar etiquetas de renglones ficticios
function generarTablaPasoHTML(asignaciones, costos, ofertaEstado, demandaEstado, filaActiva, colActiva, filasTachadas, columnasTachadas, totalF, totalC, esFicticioF, esFicticioC) {
    //Encabezado de la tabla
    let html = '<table class="table table-borderless table-minimalista text-center m-0 shadow-sm border rounded mb-2" style="font-size:0.82rem; background:#fff;"><thead><tr style="background:#f1f5f9;"><th>O / D</th>';
    for(let j = 0; j < totalC; j++) {
        //Para en caso de haber desbalances
        let labelC = (esFicticioC && j === totalC - 1) ? "D (Ficticio)" : `D${j+1}`;
        html += `<th>${labelC}</th>`;
    }
    html += '<th class="texto-restriccion">Oferta</th></tr></thead><tbody>';

    //Cuerpo de la tabla
    for(let i = 0; i < totalF; i++) {
        let labelF = (esFicticioF && i === totalF - 1) ? "O (Ficticio)" : `O${i+1}`;
        html += `<tr><td class="fw-bold text-secondary" style="background:#f8fafc;">${labelF}</td>`;
        for(let j = 0; j < totalC; j++) {
            let claseCelda = '';
            if (i === filaActiva && j === colActiva) { //Si la celda coincide con la fila y columna activa la pinta de verde
                claseCelda = 'style="background-color: #d1e7dd; font-weight: bold; border: 2px solid #0f5132 !important;"';
            } else if (filasTachadas[i] || columnasTachadas[j]) { //Si la columna o fila ya estan saturadas (fueron tachadas) las pinta de rojo una a una
                claseCelda = 'style="background-color: #fca5a5; opacity: 0.6; text-decoration: line-through;"';
            }
            //Para cuando se realiza una asignacion
            let asig = asignaciones[i][j] !== 0 ? `<span class="badge bg-dark px-2 py-1">${asignaciones[i][j]}</span>` : '-';
            html += `<td ${claseCelda}><span class="sub-costo" style="font-size:0.65rem;">c:${costos[i][j]}</span>${asig}</td>`;
        }
        //Agrega el valor de la oferta. Si ya se saturo esa fila la acha
        let estiloOferta = filasTachadas[i] ? 'style="background:#fee2e2; color:#991b1b; text-decoration:line-through;"' : 'class="texto-restriccion"';
        html += `<td ${estiloOferta}>${ofertaEstado[i]}</td></tr>`;
    }
    //Corresponde a la ultima fila de la tabal donde viene la demanda
    html += '</tbody><tfoot><tr style="background:#f1f5f9;"><td class="fw-bold text-secondary">Demanda</td>';
    for(let j = 0; j < totalC; j++) {
    //Si la columna ya se saturo la tacha también
        let estiloDemanda = columnasTachadas[j] ? 'style="background:#fee2e2; color:#991b1b; text-decoration:line-through;"' : 'class="texto-restriccion"';
        html += `<td ${estiloDemanda}>${demandaEstado[j]}</td>`;
    }
    html += '<td class="text-muted">-</td></tr></tfoot></table>';
    return html;
}

//Es la funcion que crea la representación gráfica del grafo
function dibujarRedTransporteVis(asignaciones, totalF, totalC, esFicticioF, esFicticioC) {
    const container = document.getElementById('network-transporte');
    let nodesArray = []; //Guarda los nodos (circulos)
    let edgesArray = []; //Guarda las flechas
    let htmlRutas = ""; //Para la lista de asignaciones

    //Creacion de los nodos origen
    for (let i = 0; i < totalF; i++) {
        let labelF = (esFicticioF && i === totalF - 1) ? "O (Ficticio)" : `O${i+1}`;
        nodesArray.push({
            id: `O_${i}`, label: labelF,
            color: { background: '#7B1034', border: '#550A22', highlight: '#550A22' },
            font: { color: '#ffffff', face: 'Poppins', size: 11 }, shape: 'circle', size: 24, level: 0
        });
    }

    //Creación de los nodos de destino
    for (let j = 0; j < totalC; j++) {
        let labelC = (esFicticioC && j === totalC - 1) ? "D (Ficticio)" : `D${j+1}`;
        nodesArray.push({
            id: `D_${j}`, label: labelC,
            color: { background: '#550A22', border: '#7B1034', highlight: '#7B1034' },
            font: { color: '#ffffff', face: 'Poppins', size: 11 }, shape: 'circle', size: 24, level: 2
        });
    }

    //Conexión de los nodos
    for (let i = 0; i < totalF; i++) {
        let labelF = (esFicticioF && i === totalF - 1) ? "O(Ficticio)" : `O${i+1}`;
        for (let j = 0; j < totalC; j++) {
            let labelC = (esFicticioC && j === totalC - 1) ? "D(Ficticio)" : `D${j+1}`;
            if (asignaciones[i][j] > 0) {
                edgesArray.push({
                    from: `O_${i}`, to: `D_${j}`, label: `${asignaciones[i][j]} u.`,
                    font: { align: 'horizontal', size: 11, color: '#333333', face: 'Poppins', background: '#ffffff' },
                    color: { color: '#7B1034', highlight: '#550A22' }, width: 2, arrows: 'to'
                });

                htmlRutas += `<div class="ruta-item-badge">` +
                             `<span><i class="fas fa-box text-muted me-1" style="font-size:0.75rem;"></i> <b>${labelF}</b> <i class="fas fa-arrow-right mx-1 text-secondary" style="font-size:0.7rem;"></i> <b>${labelC}</b></span>` +
                             `<span class="badge bg-secondary font-monospace" style="border-radius:6px;">${asignaciones[i][j]} u.</span>` +
                             `</div>`;
            }
        }
    }
    //Para la tarjeta de lista de asignaciones
    document.getElementById('lista-rutas-dinamica').innerHTML = htmlRutas || '<div class="text-muted small text-center py-4">No hay asignaciones en la red.</div>';

    if (networkTransporte) networkTransporte.destroy(); //Borra el grafo anterior por si existia
    //grafica el grafo
    networkTransporte = new vis.Network(container, { nodes: new vis.DataSet(nodesArray), edges: new vis.DataSet(edgesArray) }, {
        layout: { hierarchical: { direction: 'LR', sortMethod: 'directed', nodeSpacing: 65, levelSeparation: 240 } },
        physics: { enabled: false },
        interaction: { dragNodes: true, zoomView: true, dragView: true, selectable: true, hover: true }
    });

    networkTransporte.once("afterDrawing", function () { networkTransporte.fit(); });
}

//Funcion solución
function resolver(metodo) {
    //Valores del tamaño de la matriz original
    let originalF = parseInt(document.getElementById('filas').value);
    let originalC = parseInt(document.getElementById('columnas').value);

    let costos = [], oferta = [], demanda = [];
    for(let i=0; i<originalF; i++) {
        costos.push([]);
        for(let j=0; j<originalC; j++) {
            costos[i].push(parseInt(document.getElementById(`c-${i}-${j}`).value) || 0);
        }
        oferta.push(parseInt(document.getElementById(`o-${i}`).value) || 0);
    }
    for(let j=0; j<originalC; j++) {
        demanda.push(parseInt(document.getElementById(`d-${j}`).value) || 0);
    }

    let sumOferta = oferta.reduce((a,b)=>a+b, 0);
    let sumDemanda = demanda.reduce((a,b)=>a+b, 0);

    if(sumOferta === 0 && sumDemanda === 0) {
        lanzarToastError("La matriz está vacía. Introduce los parámetros o presiona 'Cargar Ejemplo'.");
        return;
    }


    // PROCESAMIENTO DE MODELOS DESBALANCEADOS

    let numF = originalF;
    let numC = originalC;
    let esFicticioF = false;
    let esFicticioC = false;
    let explicacionDesbalance = "";

    if (sumOferta > sumDemanda) {
        esFicticioC = true;
        let dif = sumOferta - sumDemanda;
        numC++;
        for (let i = 0; i < numF; i++) {
            costos[i].push(0); // Costo cero para la columna ficticia
        }
        demanda.push(dif);
        explicacionDesbalance = `<div class="alert alert-warning border-0 shadow-sm small py-2 mb-3" style="border-left: 4px solid #ffc107 !important; background:#fffbf0; color:#664d03;">` +
                                `<i class="fas fa-scale-unbalanced me-2"></i><b>Modelo Desbalanceado Detectado:</b> Oferta Total (${sumOferta} u.) > Demanda Total (${sumDemanda} u.). <br>` +
                                `Se añade un <b>Destino Ficticio (D Ficticio)</b> con demanda de <b>${dif} u.</b> y costos unitarios de <b>$0</b> para balancear el modelo de transporte de manera matemática.</div>`;
    } else if (sumDemanda > sumOferta) {
        esFicticioF = true;
        let dif = sumDemanda - sumOferta;
        numF++;
        let nuevaFilaCosto = Array(numC).fill(0);
        costos.push(nuevaFilaCosto); // Costo cero para la fila ficticia
        oferta.push(dif);
        explicacionDesbalance = `<div class="alert alert-warning border-0 shadow-sm small py-2 mb-3" style="border-left: 4px solid #ffc107 !important; background:#fffbf0; color:#664d03;">` +
                                `<i class="fas fa-scale-unbalanced me-2"></i><b>Modelo Desbalanceado Detectado:</b> Demanda Total (${sumDemanda} u.) > Oferta Total (${sumOferta} u.). <br>` +
                                `Se añade un <b>Origen Ficticio (O Ficticio)</b> con capacidad de <b>${dif} u.</b> y costos unitarios de <b>$0</b> para absorber el déficit y balancear las restricciones del sistema.</div>`;
    }

    let ofertaMutable = [...oferta];
    let demandaMutable = [...demanda];
    let asignaciones = Array(numF).fill(0).map(() => Array(numC).fill(0));
    let filasTachadas = Array(numF).fill(false);
    let columnasTachadas = Array(numC).fill(false);
    let pasosLog = [];
    document.getElementById('desarrollo-pasos').innerHTML = "";

    if (metodo === 'noroeste') {
        let i = 0, j = 0;
        while (i < numF && j < numC) {
            //Se coloca en la esquina izqueirda superior
            let cant = Math.min(ofertaMutable[i], demandaMutable[j]);

            let oAntes = [...ofertaMutable];
            let dAntes = [...demandaMutable];
            let fTachadasAntes = [...filasTachadas];
            let cTachadasAntes = [...columnasTachadas];

            asignaciones[i][j] = cant;
            ofertaMutable[i] -= cant;
            demandaMutable[j] -= cant;

            let nameF = (esFicticioF && i === numF - 1) ? "O (Ficticio)" : `O${i+1}`;
            let nameC = (esFicticioC && j === numC - 1) ? "D (Ficticio)" : `D${j+1}`;

            let causaSaturacion = "";
            if (ofertaMutable[i] === 0 && demandaMutable[j] === 0) {
                causaSaturacion = "Se satisfacen <b>simultáneamente</b> la oferta disponible y la demanda requerida.";
            } else if (ofertaMutable[i] === 0) {
                causaSaturacion = `La capacidad del origen <b>${nameF}</b> se agota por completo (0 u. restantes).`;
            } else {
                causaSaturacion = `La necesidad del destino <b>${nameC}</b> queda totalmente cubierta (0 u. pendientes).`;
            }

            let descAnalitica = `Se evalúa la celda de la esquina noroeste activa <b>(${nameF}, ${nameC})</b> con un costo unitario de <b>$${costos[i][j]}</b>. <br>` +
                              `• <b>Disponibilidad en origen:</b> ${oAntes[i]} unidades.<br>` +
                              `• <b>Requerimiento en destino:</b> ${dAntes[j]} unidades.<br>` +
                              `• <b>Decisión:</b> Se asigna el cuello de botella $\\min(${oAntes[i]}, ${dAntes[j]}) = ${cant}$ unidades. <br>` +
                              `• <b>Efecto matemático:</b> ${causaSaturacion} La demanda remanente en ${nameC} es de ${demandaMutable[j]} u. y la oferta remanente en ${nameF} es de ${ofertaMutable[i]} u.`;

            if (ofertaMutable[i] === 0) filasTachadas[i] = true;
            if (demandaMutable[j] === 0) columnasTachadas[j] = true;

            pasosLog.push({
                descripcion: descAnalitica, filaActiva: i, colActiva: j,
                asignaciones: JSON.parse(JSON.stringify(asignaciones)),
                ofertaEstado: oAntes, demandaEstado: dAntes,
                filasTachadas: fTachadasAntes, columnasTachadas: cTachadasAntes
            });

            if (ofertaMutable[i] === 0 && i < numF - 1) i++;
            else if (demandaMutable[j] === 0 && j < numC - 1) j++;
            else { i++; j++; }
        }
    }
    else if (metodo === 'minimo') {
        while (filasTachadas.includes(false) && columnasTachadas.includes(false)) {
            let minCosto = Infinity;
            let minI = -1, minJ = -1;

            // Búsqueda exhaustiva del coeficiente de costo mínimo no tachado
            for(let i=0; i<numF; i++) {
                if(filasTachadas[i]) continue;
                for(let j=0; j<numC; j++) {
                    if(columnasTachadas[j]) continue;
                    if(costos[i][j] < minCosto) {
                        minCosto = costos[i][j];
                        minI = i; minJ = j;
                    }
                }
            }

            if(minI === -1 || minJ === -1) break;

            let cant = Math.min(ofertaMutable[minI], demandaMutable[minJ]);

            let oAntes = [...ofertaMutable];
            let dAntes = [...demandaMutable];
            let fTachadasAntes = [...filasTachadas];
            let cTachadasAntes = [...columnasTachadas];

            asignaciones[minI][minJ] = cant;
            ofertaMutable[minI] -= cant;
            demandaMutable[minJ] -= cant;

            let nameF = (esFicticioF && minI === numF - 1) ? "O (Ficticio)" : `O${minI+1}`;
            let nameC = (esFicticioC && minJ === numC - 1) ? "D (Ficticio)" : `D${minJ+1}`;

            let causaSaturacion = "";
            if (ofertaMutable[minI] === 0 && demandaMutable[minJ] === 0) {
                causaSaturacion = "Se saturan <b>ambas restricciones de forma simultánea</b>.";
            } else if (ofertaMutable[minI] === 0) {
                causaSaturacion = `La oferta del origen <b>${nameF}</b> se reduce a 0, inhabilitando su fila para futuras asignaciones.`;
            } else {
                causaSaturacion = `La demanda del destino <b>${nameC}</b> queda satisfecha, tachando la columna correspondiente.`;
            }

            let descAnalitica = `El algoritmo identifica el costo unitario más económico global disponible, el cual es <b>$${costos[minI][minJ]}</b> ubicado en la coordenada <b>(${nameF}, ${nameC})</b>.<br>` +
                              `• <b>Disponibilidad en origen:</b> ${oAntes[minI]} unidades.<br>` +
                              `• <b>Requerimiento en destino:</b> ${dAntes[minJ]} unidades.<br>` +
                              `• <b>Decisión de asignación:</b> Se toma el menor valor disponible $\\min(${oAntes[minI]}, ${dAntes[minJ]}) = ${cant}$ unidades.<br>` +
                              `• <b>Efecto matemático:</b> ${causaSaturacion}`;

            if (ofertaMutable[minI] === 0) filasTachadas[minI] = true;
            if (demandaMutable[minJ] === 0) columnasTachadas[minJ] = true;

            pasosLog.push({
                descripcion: descAnalitica, filaActiva: minI, colActiva: minJ,
                asignaciones: JSON.parse(JSON.stringify(asignaciones)),
                ofertaEstado: oAntes, demandaEstado: dAntes,
                filasTachadas: fTachadasAntes, columnasTachadas: cTachadasAntes
            });
        }
    }


    //  MATRIZ DE ASIGNACION FINAL
    let htmlFinal = explicacionDesbalance;
    htmlFinal += '<table class="table table-bordered table-minimalista text-center m-0"><thead><tr class="table-light"><th>O / D</th>';
    for(let j = 0; j < numC; j++) {
        let labelC = (esFicticioC && j === numC - 1) ? "D (Ficticio)" : `D${j+1}`;
        htmlFinal += `<th>${labelC}</th>`;
    }
    htmlFinal += '<th class="texto-restriccion">Oferta Original</th></tr></thead><tbody>';

    let zTotal = 0;
    for(let i = 0; i < numF; i++) {
        let labelF = (esFicticioF && i === numF - 1) ? "O (Ficticio)" : `O${i+1}`;
        htmlFinal += `<tr><td class="fw-bold text-secondary table-light">${labelF}</td>`;
        for(let j = 0; j < numC; j++) {
            let asig = asignaciones[i][j];
            let cost = costos[i][j];
            let celdaContenido = "-";
            if(asig > 0) {
                celdaContenido = `<span class="badge bg-success d-block mb-1" style="font-size:0.85rem;">${asig} u.</span>` +
                                 `<span class="text-muted small" style="font-size:0.7rem;">(c: $${cost})</span>`;
                zTotal += (asig * cost);
            }
            htmlFinal += `<td>${celdaContenido}</td>`;
        }
        htmlFinal += `<td class="texto-restriccion table-light">${oferta[i]}</td></tr>`;
    }
    htmlFinal += '</tbody><tfoot><tr class="table-light"><td class="fw-bold text-secondary">Demanda Original</td>';
    for(let j = 0; j < numC; j++) {
        htmlFinal += `<td class="texto-restriccion">${demanda[j]}</td>`;
    }
    htmlFinal += '<td class="text-muted">-</td></tr></tfoot></table>';

    document.getElementById('tabla-final-placeholder').innerHTML = htmlFinal;
    document.getElementById('costo-total').innerText = `Z = $${zTotal}`;

    // Inyectar pasos dinámicamente en el contenedor colapsable
    let contenedorPasos = document.getElementById('desarrollo-pasos');
    pasosLog.forEach((p, idx) => {
        let cardPaso = document.createElement('div');
        cardPaso.className = "mb-4 border-bottom pb-3";
        cardPaso.innerHTML = `<h6 class="fw-bold mb-2" style="color:var(--guinda-dark);"><i class="fas fa-arrow-right-long me-1 text-secondary"></i> Iteración N° ${idx + 1}:</h6>` +
                             generarTablaPasoHTML(p.asignaciones, costos, p.ofertaEstado, p.demandaEstado, p.filaActiva, p.colActiva, p.filasTachadas, p.columnasTachadas, numF, numC, esFicticioF, esFicticioC) +
                             `<div class="analisis-algoritmico mt-2 shadow-sm"><i class="fas fa-gears text-guinda me-2"></i>${p.descripcion}</div>`;
        contenedorPasos.appendChild(cardPaso);
    });

    // Dibujar Red de Vis-Network y scroll suave
    dibujarRedTransporteVis(asignaciones, numF, numC, esFicticioF, esFicticioC);
    document.getElementById('contenedor-resultados').style.display = 'block';
    setTimeout(() => { document.getElementById('contenedor-resultados').scrollIntoView({ behavior: 'smooth' }); }, 80);
}