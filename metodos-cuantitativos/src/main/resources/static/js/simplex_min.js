/**
 * simplex_min.js
 * Lógica del formulario dinámico para el Método Simplex de Minimización.
 */

document.addEventListener('DOMContentLoaded', () => {
    // Inicializar botón "Construir Tabla"
    const buildBtn = document.getElementById('buildTableBtn');
    if (buildBtn) {
        buildBtn.addEventListener('click', () => {
            const n = parseInt(document.getElementById('numVars').value) || 2;
            const m = parseInt(document.getElementById('numConstraints').value) || 2;
            buildTable(n, m);
        });
    }

    // Tooltips de Bootstrap
    const tooltips = document.querySelectorAll('[data-bs-toggle="tooltip"]');
    tooltips.forEach(el => new bootstrap.Tooltip(el));
});

// ══════════════════════════════════════════════════════════════════════════════
// CONSTRUCCIÓN DINÁMICA DEL FORMULARIO
// ══════════════════════════════════════════════════════════════════════════════
function buildTable(numVars, numConstraints) {
    n = parseInt(numVars)       || 2;
    m = parseInt(numConstraints) || 2;

    if (n < 1 || n > 10 || m < 1 || m > 10) {
        showError('El número de variables y restricciones debe estar entre 1 y 10.');
        return;
    }

    buildObjectiveRow(n);
    buildConstraintsSection(n, m);

    // Mostrar secciones
    document.getElementById('objSection').style.display         = 'block';
    document.getElementById('constraintsSection').style.display = 'block';
    document.getElementById('solveSection').style.display       = 'block';

    // Smooth scroll
    document.getElementById('objSection').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function buildObjectiveRow(n) {
    const container = document.getElementById('objInputs');
    container.innerHTML = '';

    for (let j = 0; j < n; j++) {
        if (j > 0) {
            const op = document.createElement('span');
            op.className = 'obj-op';
            op.textContent = '+';
            container.appendChild(op);
        }

        const term = document.createElement('div');
        term.className = 'obj-term';

        const input = document.createElement('input');
        input.type        = 'number';
        input.name        = 'obj';
        input.step        = 'any';
        input.placeholder = 'c' + (j + 1);
        input.required    = true;
        input.className   = 'form-control form-control-custom';
        input.setAttribute('data-bs-toggle', 'tooltip');
        input.setAttribute('title', 'Coeficiente de x' + (j + 1) + ' en la función objetivo');

        const label = document.createElement('span');
        label.className = 'var-label';
        label.innerHTML = 'x<sub>' + (j + 1) + '</sub>';

        term.appendChild(input);
        term.appendChild(label);
        container.appendChild(term);
    }
}

function buildConstraintsSection(n, m) {
    const container = document.getElementById('constraintsInputs');
    container.innerHTML = '';

    for (let i = 0; i < m; i++) {
        const row = document.createElement('div');
        row.className = 'constraint-row';

        const rowLabel = document.createElement('span');
        rowLabel.className = 'row-label';
        rowLabel.textContent = (i + 1) + '.';
        row.appendChild(rowLabel);

        for (let j = 0; j < n; j++) {
            if (j > 0) {
                const op = document.createElement('span');
                op.className = 'constraint-op';
                op.textContent = '+';
                row.appendChild(op);
            }

            const wrap = document.createElement('div');
            wrap.className = 'obj-term';

            const input = document.createElement('input');
            input.type        = 'number';
            input.name        = 'aij';
            input.step        = 'any';
            input.placeholder = 'a' + (i + 1) + '' + (j + 1);
            input.required    = true;
            input.className   = 'form-control form-control-custom';

            const vLabel = document.createElement('span');
            vLabel.className = 'var-label';
            vLabel.innerHTML = 'x<sub>' + (j + 1) + '</sub>';

            wrap.appendChild(input);
            wrap.appendChild(vLabel);
            row.appendChild(wrap);
        }

        const sel = document.createElement('select');
        sel.name      = 'type';
        sel.className = 'form-control-custom';
        sel.required  = true;

        [['<=', '≤'], ['>=', '≥'], ['=', '=']].forEach(([val, txt]) => {
            const opt = document.createElement('option');
            opt.value       = val;
            opt.textContent = txt;
            sel.appendChild(opt);
        });
        row.appendChild(sel);

        const bInput = document.createElement('input');
        bInput.type        = 'number';
        bInput.name        = 'b';
        bInput.step        = 'any';
        bInput.min         = '0';
        bInput.placeholder = 'b' + (i + 1);
        bInput.required    = true;
        bInput.className   = 'form-control form-control-custom';
        row.appendChild(bInput);

        container.appendChild(row);
    }
}

// ══════════════════════════════════════════════════════════════════════════════
// VALIDACIÓN DEL FORMULARIO
// ══════════════════════════════════════════════════════════════════════════════
document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('simplexForm');
    if (!form) return;

    form.addEventListener('submit', (e) => {
        const objInputs = form.querySelectorAll('input[name="obj"]');
        const aInputs   = form.querySelectorAll('input[name="aij"]');
        const bInputs   = form.querySelectorAll('input[name="b"]');

        let valid = true;
        let msg   = '';

        objInputs.forEach((inp, i) => {
            if (inp.value.trim() === '') {
                valid = false; msg = 'Falta el coeficiente c' + (i+1) + ' de la función objetivo.';
            }
        });

        aInputs.forEach((inp, idx) => {
            if (inp.value.trim() === '') { valid = false; msg = 'Hay coeficientes de restricción vacíos.'; }
        });

        bInputs.forEach((inp, i) => {
            const val = parseFloat(inp.value);
            if (inp.value.trim() === '') { valid = false; msg = 'Falta el lado derecho (b) de la restricción ' + (i+1) + '.'; }
            if (!isNaN(val) && val < 0)  { valid = false; msg = 'El lado derecho (b) de la restricción ' + (i+1) + ' no puede ser negativo.'; }
        });

        if (!valid) {
            e.preventDefault();
            showError(msg);
        }
    });
});

function showError(msg) {
    const prev = document.getElementById('toastError');
    if (prev) prev.remove();

    const toast = document.createElement('div');
    toast.id = 'toastError';
    toast.style.cssText = `
        position: fixed; bottom: 28px; right: 28px; z-index: 9999;
        background: #2a1a1a; border: 1px solid #ef4444; border-radius: 12px;
        padding: 14px 20px; color: #fca5a5; font-size: 14px;
        display: flex; align-items: center; gap: 10px;
        box-shadow: 0 8px 32px rgba(0,0,0,.6); max-width: 360px;
        animation: slideIn .25s ease;
    `;
    toast.innerHTML = '<i class="bi bi-x-circle-fill" style="font-size:18px;flex-shrink:0"></i><span>' + escapeHtml(msg) + '</span>';
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 4500);
}

function escapeHtml(str) {
    const d = document.createElement('div');
    d.textContent = str;
    return d.innerHTML;
}