
const rightPanel = document.getElementById('rightPanel');
const btns = document.querySelectorAll('.side-btn');

// Global current selection & saved answer state
window.currentTest = { subject: null, number: 1 };
window.savedState = window.savedState || { exercises: {} }; // per-question id -> value
window.currentData = null; // holds loaded JSON model

// Static 'About' HTML stays in-memory
const contents = {
  about: `
    <div class="home-grid">
      <div class="home-card">
        <h3>Thiết Kế Web</h3>
        <div class="btn-grid">
          <button type="button" class="card-btn">Test 1</button>
          <button type="button" class="card-btn">Test 2</button>
          <button type="button" class="card-btn">Test 3</button>
          <button type="button" class="card-btn">Test 4</button>
          <button type="button" class="card-btn">Test 5</button>
          <button type="button" class="card-btn">Test 6</button>
          <button type="button" class="card-btn">Test 7</button>
          <button type="button" class="card-btn">Test 8</button>
          <button type="button" class="card-btn">Test 9</button>
        </div>
      </div>

      <div class="home-card">
        <h3>Mạng Máy Tính</h3>
        <div class="btn-grid">
          <button type="button" class="card-btn">Test 1</button>
          <button type="button" class="card-btn">Test 2</button>
          <button type="button" class="card-btn">Test 3</button>
          <button type="button" class="card-btn">Test 4</button>
          <button type="button" class="card-btn">Test 5</button>
          <button type="button" class="card-btn">Test 6</button>
          <button type="button" class="card-btn">Test 7</button>
          <button type="button" class="card-btn">Test 8</button>
          <button type="button" class="card-btn">Test 9</button>
        </div>
      </div>

      <div class="home-card">
        <h3>Cơ sở dữ liệu</h3>
        <div class="btn-grid">
          <button type="button" class="card-btn">Test 1</button>
          <button type="button" class="card-btn">Test 2</button>
          <button type="button" class="card-btn">Test 3</button>
          <button type="button" class="card-btn">Test 4</button>
          <button type="button" class="card-btn">Test 5</button>
          <button type="button" class="card-btn">Test 6</button>
          <button type="button" class="card-btn">Test 7</button>
          <button type="button" class="card-btn">Test 8</button>
          <button type="button" class="card-btn">Test 9</button>
        </div>
      </div>

      <div class="home-card">
        <h3>Tiếng anh 4</h3>
        <div class="btn-grid">
          <button type="button" class="card-btn">Test 1</button>
          <button type="button" class="card-btn">Test 2</button>
          <button type="button" class="card-btn">Test 3</button>
          <button type="button" class="card-btn">Test 4</button>
          <button type="button" class="card-btn">Test 5</button>
          <button type="button" class="card-btn">Test 6</button>
          <button type="button" class="card-btn">Test 7</button>
          <button type="button" class="card-btn">Test 8</button>
          <button type="button" class="card-btn">Test 9</button>
        </div>
      </div>
    </div>
  `,
  // Placeholder content for 'exercises' if user clicks menu directly
  exercises: `
    <div class="exercise-container">
      <div class="ex-header">
        <h3 class="ex-title">Chọn Test từ Trang chủ đã nhé 👀</h3>
      </div>
    </div>
  `,
  projects: ``,
  contact: `<h2>Liên hệ</h2><p>Email: hoanglight2006@gmail.com<br>Facebook: fb.com/hoanglight2</p>`
};

// Map subject title -> folder slug
const subjectMap = {
  'Thiết Kế Web': 'thiet-ke-web',
  'Mạng Máy Tính': 'mang-may-tinh',
  'Cơ sở dữ liệu': 'co-so-du-lieu',
  'Tiếng anh 4': 'tieng-anh-4'
};

// Side menu switching
btns.forEach(btn => {
  btn.addEventListener('click', function() {
    btns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const key = btn.getAttribute('data-content');
    rightPanel.innerHTML = contents[key] || '';
    if (key === 'exercises' && !window.currentData) {
      // If no currentData yet, show placeholder (already set)
    } else if (key === 'exercises' && window.currentData) {
      // Re-render current loaded test
      renderExercises(window.currentData);
    }
  });
});

// Click "Test X" on About -> load that test JSON and show Exercises
rightPanel.addEventListener('click', function(e) {
  if (e.target && e.target.classList.contains('card-btn')) {
    const card = e.target.closest('.home-card');
    const subj = card ? (card.querySelector('h3') ? card.querySelector('h3').textContent.trim() : null) : null;
    const m = (e.target.textContent || '').match(/(\d+)/);
    const num = m ? Number(m[1]) : 1;
    window.currentTest = { subject: subj || 'Bộ khung câu hỏi', number: num };
    loadCurrentTest();
  }
});

function loadCurrentTest() {
  const { subject, number } = window.currentTest || {};
  const slug = subjectMap[subject] || null;
  if (!slug) {
    rightPanel.innerHTML = '<p>Không xác định được môn học.</p>';
    return;
  }
  // Activate 'Bài tập' tab UI without triggering its default content
  const exerciseBtn = document.querySelector('.side-btn[data-content="exercises"]');
  if (exerciseBtn) {
    btns.forEach(b => b.classList.remove('active'));
    exerciseBtn.classList.add('active');
  }
  rightPanel.innerHTML = '<div class="exercise-container"><div class="ex-header"><h3 class="ex-title">Đang tải câu hỏi...</h3></div></div>';
  const url = `questions/${slug}/test${number}.json`;
  fetch(url)
    .then(res => {
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.json();
    })
    .then(data => {
      window.currentData = data;
      // Reset per-question state for a fresh attempt of this test
      window.savedState.exercises = {};
      renderExercises(data);
    })
    .catch(err => {
      rightPanel.innerHTML = `<div class="exercise-container"><div class="ex-header"><h3 class="ex-title">Lỗi tải câu hỏi: ${url}</h3><p>${err.message}</p></div></div>`;
    });
}

// Global click handlers for MCQ select & check-all & overlay buttons
rightPanel.addEventListener('click', function(e) {
  const opt = e.target.closest && e.target.closest('.mc-option');
  if (opt) {
    const parent = opt.parentElement;
    if (parent) parent.querySelectorAll('.mc-option').forEach(o => o.classList.remove('selected'));
    opt.classList.add('selected');
    // save selection by question id
    const qCard = opt.closest('.q-card');
    if (qCard && qCard.id) {
      window.savedState.exercises[qCard.id] = opt.getAttribute('data-value');
    }
  }

  const ctrl = e.target.closest && e.target.closest('[data-action="check-all"]');
  if (ctrl) {
    computeAndShowScore();
  }

  if (e.target && e.target.id === 'closeResult') {
    const overlay = rightPanel.querySelector('#resultOverlay');
    if (overlay) { overlay.style.display = 'none'; overlay.setAttribute('aria-hidden', 'true'); }
  }

  if (e.target && e.target.id === 'retryResult') {
    window.savedState.exercises = {};
    const overlay = rightPanel.querySelector('#resultOverlay');
    if (overlay) overlay.style.display = 'none';
    // Re-render to clear selections/inputs
    if (window.currentData) renderExercises(window.currentData);
  }
});

function renderExercises(data) {
  const html = `
    <div class="exercise-container">
      <div class="ex-header">
        <h3 class="ex-title">${data.title || (window.currentTest.subject + ' - Test ' + window.currentTest.number)}</h3>
      </div>
      ${data.questions.map((q, idx) => renderQuestion(q, idx)).join('')}
      <div class="ex-controls" style="justify-content:center;">
        <button id="check" class="ex-btn btn-check-like" data-action="check-all">Check</button>
      </div>

      <div id="resultOverlay" class="result-overlay" style="display:none;">
        <div class="result-card">
          <h2 id="resultScore">Điểm</h2>
          <p id="resultText"></p>
          <div class="result-controls">
            <button id="closeResult" class="btn-check-like">Thoát</button>
            <button id="retryResult" class="btn-check-like">Làm lại</button>
          </div>
        </div>
      </div>
    </div>
  `;
  rightPanel.innerHTML = html;
  initInteractions();
}

function renderQuestion(q, idx) {
  if (q.type === 'mcq') {
    const letters = (q.options || []).map((_, i) => String.fromCharCode(65 + i));
    return `
      <div class="q-card" id="${q.id || ('q'+idx)}">
        <h4>${q.question || ''}</h4>
        <div class="mc-options">
          ${(q.options || []).map((opt, i) => `
            <button class="mc-option ${window.savedState.exercises[(q.id||('q'+idx))] === letters[i] ? 'selected':''}" data-value="${letters[i]}">
              <strong>${letters[i]}</strong> ${opt}
            </button>`).join('')}
        </div>
      </div>`;
  }

  if (q.type === 'reading-mcq') {
    const letters = (q.options || []).map((_, i) => String.fromCharCode(65 + i));
    return `
      <div class="q-card two-col" id="${q.id || ('q'+idx)}">
        <div class="reading-pane">
          <h4>Reading</h4>
          <p>${q.reading || ''}</p>
        </div>
        <div>
          <h4>${q.question || ''}</h4>
          <div class="mc-options">
            ${(q.options || []).map((opt, i) => `
              <button class="mc-option ${window.savedState.exercises[(q.id||('q'+idx))] === letters[i] ? 'selected':''}" data-value="${letters[i]}">
                <strong>${letters[i]}</strong> ${opt}
              </button>`).join('')}
          </div>
        </div>
      </div>`;
  }

  if (q.type === 'fill') {
    return `
      <div class="q-card two-col" id="${q.id || ('q'+idx)}">
        <div class="reading-pane">
          <h4>Reading</h4>
          <p>${q.reading || ''}</p>
        </div>
        <div>
          <h4>${q.question || 'Điền từ vào chỗ trống'}</h4>
          <input class="fill-input" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false" />
        </div>
      </div>`;
  }

  if (q.type === 'drag') {
    return `
      <div class="q-card" id="${q.id || ('q'+idx)}">
        <h4>${q.question || ''}</h4>
        <div class="drop-zone" id="drop-target"></div>
        <div class="drag-pool" id="drag-pool">
          ${(q.words || []).map((w,i)=>`<div class="draggable" draggable="true" data-id="w${i}">${w}</div>`).join('')}
        </div>
      </div>`;
  }

  return '';
}

function initInteractions() {
  // DRAG & DROP
  const draggables = rightPanel.querySelectorAll('.draggable');
  draggables.forEach(d => {
    d.addEventListener('dragstart', function(ev) { ev.dataTransfer.setData('text/plain', d.dataset.id); });
    d.addEventListener('click', function() {
      const pool = rightPanel.querySelector('#drag-pool');
      const drop = rightPanel.querySelector('#drop-target');
      if (!pool || !drop) return;
      if (drop.contains(d)) pool.appendChild(d); else drop.appendChild(d);
      saveDragOrder();
    });
  });
  const drop = rightPanel.querySelector('#drop-target');
  if (drop) {
    drop.addEventListener('dragover', ev => ev.preventDefault());
    drop.addEventListener('drop', ev => {
      ev.preventDefault();
      const id = ev.dataTransfer.getData('text/plain');
      const el = rightPanel.querySelector(`.draggable[data-id="${id}"]`);
      if (el) drop.appendChild(el);
      saveDragOrder();
    });
  }
  const pool = rightPanel.querySelector('#drag-pool');
  if (pool) {
    pool.addEventListener('dragover', ev => ev.preventDefault());
    pool.addEventListener('drop', ev => {
      ev.preventDefault();
      const id = ev.dataTransfer.getData('text/plain');
      const el = rightPanel.querySelector(`.draggable[data-id="${id}"]`);
      if (el) pool.appendChild(el);
      saveDragOrder();
    });
  }

  function saveDragOrder() {
    const dropNow = rightPanel.querySelector('#drop-target');
    const arr = dropNow ? Array.from(dropNow.querySelectorAll('.draggable')).map(d => d.textContent.trim()) : [];
    window.savedState.exercises['ex4'] = arr; // assuming id 'ex4' by our generator
  }
}

function computeAndShowScore() {
  const data = window.currentData;
  if (!data) return;
  let score = 0;
  let total = 0;

  data.questions.forEach(q => {
    if (q.type === 'mcq' || q.type === 'reading-mcq') {
      total += 1;
      const sel = window.savedState.exercises[q.id] || null;
      if (sel && typeof q.answer === 'string' && sel === q.answer) score += 1;
    } else if (q.type === 'fill') {
      total += 1;
      const inputEl = rightPanel.querySelector(`#${q.id} .fill-input`);
      const val = (inputEl && inputEl.value) ? inputEl.value.trim().toLowerCase() : '';
      if (Array.isArray(q.answer)) {
        const ok = q.answer.map(a => String(a).trim().toLowerCase()).includes(val);
        if (ok) score += 1;
      } else if (typeof q.answer === 'string') {
        if (val === q.answer.trim().toLowerCase()) score += 1;
      }
    } else if (q.type === 'drag') {
      total += 1;
      const drop = rightPanel.querySelector('#drop-target');
      const order = drop ? Array.from(drop.querySelectorAll('.draggable')).map(d => d.textContent.trim()) : [];
      if (Array.isArray(q.answer) && order.length === q.answer.length && order.every((v,i)=>v===q.answer[i])) {
        score += 1;
      }
    }
  });

  const percent = Math.round((score/total)*100);
  const overlay = rightPanel.querySelector('#resultOverlay');
  if (overlay) {
    overlay.style.display = 'flex';
    rightPanel.querySelector('#resultScore').textContent = `Điểm: ${score}/${total} (${percent}%)`;
    rightPanel.querySelector('#resultText').textContent = 'Kết quả đã được nộp.';
    overlay.setAttribute('aria-hidden', 'false');
  }
}

// Show About by default
if (btns[0]) { btns[0].click(); }
