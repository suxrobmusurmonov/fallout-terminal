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

// --- 1. ТЕРМИНАЛ: ЧЕСТНЫЙ REPL (eval) ---
function runCode() {
    const code = elements.input.value.trim();
    if (!code) return;
    
    printLog(`> ${code}`, "user-input");
    
    try {
        // Косвенный вызов eval для работы в глобальном контексте
        const indirectEval = eval;
        const result = indirectEval(code);
        
        if (result !== undefined) {
            printLog(`[RES]: ${result}`, "sys-success");
        }
    } catch (err) {
        printLog(`SYS-ERR: ${err.message}`, "sys-error");
        explainError(err.message);
        triggerGlitch(); // Глитч при ошибке
    }
    
    elements.input.value = "";
    elements.input.style.height = 'auto';
}

// --- 2. ИИ: ЗАПРОС К VERCEL API ---
async function handleAiQuery() {
    const query = elements.aiInput.value.trim();
    if (!query) return;

    printAiMsg(`USER: ${query}`, "");
    elements.aiInput.value = "";
    triggerGlitch(); // Шум при отправке

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
            throw new Error();
        }
    } catch (err) {
        printAiMsg("ROBCO-AI: КРИТИЧЕСКИЙ СБОЙ СВЯЗИ. ПРОВЕРЬТЕ СЕРВЕР.", "sys-error");
        triggerGlitch();
    }
}

// --- 3. ЭФФЕКТЫ: ЖЕСТКИЙ ГЛИТЧ (ШУМ) ---
function triggerGlitch() {
    const viewport = document.querySelector('.viewport');
    viewport.classList.add('glitch-effect');
    
    // Добавляем атрибут для CSS-эффекта RGB Split
    viewport.setAttribute('data-text', "ERROR_NOISE_SYSTEM_CRITICAL");

    setTimeout(() => {
        viewport.classList.remove('glitch-effect');
        viewport.removeAttribute('data-text');
    }, 500); 
}

// Рандомные помехи (фоновый шум системы)
setInterval(() => {
    if (Math.random() < 0.03) triggerGlitch(); // Шанс 3% каждые 3 сек
}, 3000);

// --- 4. ДОКУМЕНТАЦИЯ (ИЗ JSON) ---
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
        elements.docsGrid.innerHTML = "<p class='sys-error'>Ошибка: Создайте docs.json или проверьте формат.</p>";
    }
}

// --- 5. ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ---
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

// --- 6. ИНТЕРФЕЙС И НАВИГАЦИЯ ---
function switchTab(id, btn) {
    document.querySelectorAll('section').forEach(s => s.classList.add('hidden'));
    const target = document.getElementById(`screen-${id}`);
    if (target) target.classList.remove('hidden');
    
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    
    if (id === 'docs') renderDocs();
    if (id === 'visual') {
        elements.canvas.width = elements.canvas.parentElement.clientWidth;
        elements.canvas.height = elements.canvas.parentElement.clientHeight;
    }
}

function insertChar(c) {
    elements.input.value += c;
    elements.input.focus();
    // Принудительно вызываем авто-расширение
    elements.input.dispatchEvent(new Event('input'));
}

function nextTheme() {
    document.body.classList.remove(themes[currentThemeIdx]);
    currentThemeIdx = (currentThemeIdx + 1) % themes.length;
    document.body.classList.add(themes[currentThemeIdx]);
}

// Авто-расширение текстового поля
elements.input.addEventListener('input', function() {
    this.style.height = 'auto';
    this.style.height = (this.scrollHeight) + 'px';
});

// Слушатели клавиш
elements.input.addEventListener('keydown', e => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        runCode();
    }
});

elements.aiInput.addEventListener('keydown', e => {
    if (e.key === 'Enter') handleAiQuery();
});

// Загрузочный экран
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
        await new Promise(r => setTimeout(r, 250));
    }
    
    setTimeout(() => {
        document.getElementById('boot-screen').style.display = 'none';
        document.getElementById('main-app').classList.remove('hidden');
    }, 500);
};