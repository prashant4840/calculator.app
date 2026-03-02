let current    = '0';
let expression = '';
let operator   = null;
let prevValue  = null;
let justCalc   = false;
let history    = [];

// ── Keyboard support ──────────────────────────────────
document.addEventListener('keydown', e => {
  if (e.key >= '0' && e.key <= '9') { inputNum(e.key); animateBtn(e.key); }
  else if (e.key === '.') inputDot();
  else if (e.key === '+') inputOp('+');
  else if (e.key === '-') inputOp('-');
  else if (e.key === '*') inputOp('*');
  else if (e.key === '/') { e.preventDefault(); inputOp('/'); }
  else if (e.key === 'Enter' || e.key === '=') calculate();
  else if (e.key === 'Backspace') backspace();
  else if (e.key === 'Escape') clearAll();
  else if (e.key === '%') calcPercent();
});

// ── Display ───────────────────────────────────────────
function updateDisplay() {
  const el = document.getElementById('mainDisplay');
  el.textContent = formatNumber(current);
  const len = el.textContent.length;
  el.className = 'display-main' + (len > 12 ? ' xsmall' : len > 8 ? ' small' : '');
  document.getElementById('expression').textContent = expression || '\u00a0';
}

function formatNumber(n) {
  const num = parseFloat(n);
  if (isNaN(num)) return n;
  if (Math.abs(num) > 1e12 || (Math.abs(num) < 1e-6 && num !== 0)) {
    return num.toExponential(4);
  }
  // Remove unnecessary trailing zeros after decimal
  if (n.toString().includes('.') && !n.toString().endsWith('.')) {
    return parseFloat(parseFloat(n).toPrecision(12)).toString();
  }
  return n;
}

// ── Input number ──────────────────────────────────────
function inputNum(d) {
  if (justCalc) { current = d; expression = ''; justCalc = false; }
  else if (current === '0' && d !== '.') current = d;
  else if (current.length >= 15) return;
  else current += d;
  updateDisplay();
}

function inputDot() {
  if (justCalc) { current = '0.'; justCalc = false; }
  else if (!current.includes('.')) current += '.';
  updateDisplay();
}

// ── Operators ─────────────────────────────────────────
function inputOp(op) {
  if (operator && !justCalc) {
    calculate(true);
  }
  prevValue = parseFloat(current);
  operator  = op;
  const sym = op === '*' ? '×' : op === '/' ? '÷' : op;
  expression = `${formatNumber(current)} ${sym}`;
  justCalc  = false;
  current   = '0';
  updateDisplay();
}

// ── Calculate ─────────────────────────────────────────
function calculate(chain = false) {
  if (operator === null || prevValue === null) return;

  const a = prevValue;
  const b = parseFloat(current);
  let result;
  const sym = operator === '*' ? '×' : operator === '/' ? '÷' : operator;
  const fullExpr = `${formatNumber(String(a))} ${sym} ${formatNumber(String(b))}`;

  if (operator === '/' && b === 0) {
    showError();
    return;
  }

  switch (operator) {
    case '+': result = a + b; break;
    case '-': result = a - b; break;
    case '*': result = a * b; break;
    case '/': result = a / b; break;
  }

  // Round float weirdness
  result = parseFloat(result.toPrecision(12));

  if (!chain) {
    addHistory(`${fullExpr} = ${result}`);
    flashDisplay();
    expression = `${fullExpr} =`;
  }

  current   = String(result);
  operator  = null;
  prevValue = null;
  justCalc  = !chain;
  updateDisplay();
}

// ── Special functions ─────────────────────────────────
function clearAll() {
  current = '0'; expression = ''; operator = null; prevValue = null; justCalc = false;
  updateDisplay();
}

function clearEntry() {
  current = '0';
  updateDisplay();
}

function backspace() {
  if (justCalc) return;
  current = current.length > 1 ? current.slice(0, -1) : '0';
  updateDisplay();
}

function toggleSign() {
  current = current.startsWith('-') ? current.slice(1) : '-' + current;
  if (current === '-0') current = '0';
  updateDisplay();
}

function calcPercent() {
  current = String(parseFloat(current) / 100);
  updateDisplay();
}

function calcSqrt() {
  const n = parseFloat(current);
  if (n < 0) { showError(); return; }
  const result = parseFloat(Math.sqrt(n).toPrecision(12));
  addHistory(`√${formatNumber(current)} = ${result}`);
  expression = `√${formatNumber(current)} =`;
  current = String(result);
  justCalc = true;
  updateDisplay();
}

function calcSquare() {
  const n = parseFloat(current);
  const result = parseFloat((n * n).toPrecision(12));
  addHistory(`${formatNumber(current)}² = ${result}`);
  expression = `${formatNumber(current)}² =`;
  current = String(result);
  justCalc = true;
  updateDisplay();
}

// ── History ───────────────────────────────────────────
function addHistory(entry) {
  history.push(entry);
  if (history.length > 6) history.shift();
  const tape = document.getElementById('historyTape');
  tape.innerHTML = history.map(h =>
    `<div class="history-entry">${h}</div>`
  ).join('');
  tape.scrollTop = tape.scrollHeight;
}

// ── Animations ────────────────────────────────────────
function flashDisplay() {
  const d = document.getElementById('display');
  d.classList.remove('flash');
  void d.offsetWidth;
  d.classList.add('flash');
  setTimeout(() => d.classList.remove('flash'), 300);
}

function showError() {
  current = 'Error';
  expression = 'Cannot divide by zero';
  updateDisplay();
  const d = document.getElementById('display');
  d.classList.add('error');
  setTimeout(() => { d.classList.remove('error'); clearAll(); }, 1000);
}

// Ripple on button click
document.querySelectorAll('.btn').forEach(btn => {
  btn.addEventListener('click', function(e) {
    const r = document.createElement('span');
    r.className = 'ripple';
    const size = Math.max(this.offsetWidth, this.offsetHeight);
    r.style.cssText = `width:${size}px;height:${size}px;left:${e.offsetX - size/2}px;top:${e.offsetY - size/2}px`;
    this.appendChild(r);
    setTimeout(() => r.remove(), 400);
  });
});

updateDisplay();

