const themes = ['theme-green', 'theme-orange', 'theme-white', 'theme-red'];
let currentThemeIdx = 0;

const elements = {
    input: document.getElementById('main-input'),
    log: document.getElementById('history-log'),
    canvas: document.getElementById('robco-canvas'),
    aiInput: document.getElementById('ai-input'),
    aiLog: document.getElementById('ai-chat-log'),
    docsGrid: document.getElementById('docs-grid')
};

const ctx = elements.canvas.getContext('2d');


function runCode() {
    const code = elements.input.value.trim();
    if (!code) return;
    
    printLog(`> ${code}`, "user-input");
    
    
    const originalLog = console.log;
    console.log = (...args) => {
        const output = args.map(arg => 
            typeof arg === 'object' ? JSON.stringify(arg) : arg
        ).join(' ');
        printLog(`[LOG]: ${output}`, "sys-success");
    };
    
    try {
        const indirectEval = eval;
        const result = indirectEval(code);
        
        
        if (result !== undefined) {
            printLog(`[RES]: ${result}`, "sys-success");
        }
    } catch (err) {
        printLog(`SYS-ERR: ${err.message}`, "sys-error");
        explainError(err.message);
        triggerGlitch(); 
    }
    
    
    console.log = originalLog;
    
    
    elements.input.value = "";
    elements.input.style.height = 'auto';
}


async function handleAiQuery() {
    const query = elements.aiInput.value.trim();
    if (!query) return;

    printAiMsg(`USER: ${query}`, "");
    elements.aiInput.value = "";
    triggerGlitch(); 

    try {
        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ query })
        });
        const data = await response.json();
        
        if (data.text) {
            typeAiText(data.text);
        } else {
            throw new Error(data.message || "Unknown error");
        }
    } catch (err) {
        printAiMsg("ROBCO-AI: КРИТИЧЕСКИЙ СБОЙ СВЯЗИ. ПРОВЕРЬТЕ СЕРВЕР.", "sys-error");
        triggerGlitch();
    }
}


function triggerGlitch() {
    const viewport = document.querySelector('.viewport');
    viewport.classList.add('glitch-effect');
    viewport.setAttribute('data-text', "ERROR_NOISE_SYSTEM_CRITICAL");

    setTimeout(() => {
        viewport.classList.remove('glitch-effect');
        viewport.removeAttribute('data-text');
    }, 500); 
}

setInterval(() => {
    if (Math.random() < 0.03) triggerGlitch(); 
}, 3000);


async function renderDocs() {
    elements.docsGrid.innerHTML = "<p>Загрузка данных...</p>";
    try {
        const res = await fetch('docs.json');
        const data = await res.json();
        elements.docsGrid.innerHTML = data.map(d => `
            <div class="doc-card">
                <div class="sys-success" style="font-weight:bold">[${d.cat}] ${d.name}</div>
                <div style="font-size:1.1rem; opacity:0.9">${d.desc}</div>
                <code style="display:block; margin-top:5px; color:var(--f-main); opacity:0.6">${d.ex}</code>
            </div>
        `).join('');
    } catch (e) {
        elements.docsGrid.innerHTML = "<p class='sys-error'>Ошибка: Проверьте docs.json.</p>";
    }
}


function typeAiText(text) {
    const p = document.createElement('p');
    p.className = "sys-success";
    elements.aiLog.appendChild(p);
    let i = 0;
    const interval = setInterval(() => {
        p.textContent += text[i];
        i++;
        if (i >= text.length) {
            clearInterval(interval);
            elements.aiLog.scrollTop = elements.aiLog.scrollHeight;
        }
    }, 20);
}

function printLog(msg, type) {
    const p = document.createElement('p');
    p.className = type;
    p.textContent = msg;
    elements.log.appendChild(p);
    elements.log.scrollTop = elements.log.scrollHeight;
}

function printAiMsg(msg, type) {
    const p = document.createElement('p');
    p.className = type;
    p.textContent = msg;
    elements.aiLog.appendChild(p);
}

function explainError(msg) {
    let advice = "ROBCO-AI: ";
    const m = msg.toLowerCase();
    if (m.includes("constant")) advice += "ОШИБКА: Попытка записи в константу. Используй 'let'.";
    else if (m.includes("defined")) advice += "ОШИБКА: Переменная не существует в ядре.";
    else advice += "ВНИМАНИЕ: Нарушен синтаксис протокола кода.";
    printLog(advice, "sys-success");
}


function switchTab(id, btn) {
    document.querySelectorAll('section').forEach(s => s.classList.add('hidden'));
    const target = document.getElementById(`screen-${id}`);
    if (target) target.classList.remove('hidden');
    
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    
    if (id === 'docs') renderDocs();
    if (id === 'visual') {
       
        if (elements.canvas.width === 0 || elements.canvas.width === 300) { 
            elements.canvas.width = elements.canvas.parentElement.clientWidth;
            elements.canvas.height = elements.canvas.parentElement.clientHeight;
        }
        ctx.fillStyle = getComputedStyle(document.body).getPropertyValue('--f-main');
        ctx.strokeStyle = getComputedStyle(document.body).getPropertyValue('--f-main');
    }
}


function insertChar(c) {
    const start = elements.input.selectionStart;
    const end = elements.input.selectionEnd;
    const text = elements.input.value;
    elements.input.value = text.slice(0, start) + c + text.slice(end);
    elements.input.focus();
    elements.input.selectionStart = elements.input.selectionEnd = start + c.length;
    elements.input.dispatchEvent(new Event('input'));
}

function nextTheme() {
    document.body.classList.remove(themes[currentThemeIdx]);
    currentThemeIdx = (currentThemeIdx + 1) % themes.length;
    document.body.classList.add(themes[currentThemeIdx]);
}


elements.input.addEventListener('input', function() {
    this.style.height = 'auto';
    this.style.height = (this.scrollHeight) + 'px';
});

elements.input.addEventListener('keydown', e => {
    
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        runCode();
    }
    
});

elements.aiInput.addEventListener('keydown', e => {
    if (e.key === 'Enter') handleAiQuery();
});


window.onload = async () => {
    const boot = document.getElementById('boot-text');
    const lines = [
        "ROBCO INDUSTRIES UNIFIED OPERATING SYSTEM",
        "COPYRIGHT 2075-2077 ROBCO INDUSTRIES",
        "LOADING V.N.A.I. CORE...",
        "MEMORY CHECK: OK",
        "SATELLITE LINK: ESTABLISHED",
        "READY."
    ];
    
    for(let l of lines) {
        const p = document.createElement('p');
        p.textContent = l;
        boot.appendChild(p);
        await new Promise(r => setTimeout(r, 200));
    }
    
    setTimeout(() => {
        document.getElementById('boot-screen').style.display = 'none';
        document.getElementById('main-app').classList.remove('hidden');
    }, 500);
};