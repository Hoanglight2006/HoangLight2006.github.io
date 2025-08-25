const rightPanel = document.getElementById('rightPanel');
const btns = document.querySelectorAll('.side-btn');

// thêm biến toàn cục lưu chọn test & trạng thái lưu trữ câu trả lời
window.currentTest = { subject: null, number: 1 };
window.savedState = window.savedState || {
	// exercises state: ex1/ex2 store selected value ('A'|'B'|'C'), ex3 single text, ex4 order array of data-id
	exercises: { ex1: null, ex2: null, ex3: '', ex4: [] }
};

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
  exercises: `
    <div class="exercise-container">
      <!-- Header center (removed + Test button) -->
      <div class="ex-header">
        <h3 class="ex-title">Bộ khung câu hỏi</h3>
      </div>

      <!-- 1) Multiple choice (single) -->
      <div class="q-card" id="ex1">
        <h4>1. Chọn 1 đáp án đúng</h4>
        <div class="mc-options">
          <button class="mc-option" data-value="A"><strong>A</strong> He go to school every day.</button>
          <button class="mc-option" data-value="B"><strong>B</strong> He goes to school every day.</button>
          <button class="mc-option" data-value="C"><strong>C</strong> He going to school every day.</button>
        </div>
      </div>

      <!-- 2) MC with reading on the left -->
      <div class="q-card two-col" id="ex2">
        <div class="reading-pane">
          <h4>Reading</h4>
          <p>Tom likes to read about nature. He often goes to the park to watch birds and plants.</p>
        </div>
        <div>
          <h4>2. Based on the text, choose one</h4>
          <div class="mc-options">
            <button class="mc-option" data-value="A"><strong>A</strong> Tom hates nature.</button>
            <button class="mc-option" data-value="B"><strong>B</strong> Tom likes to read about nature.</button>
            <button class="mc-option" data-value="C"><strong>C</strong> Tom never goes outside.</button>
          </div>
        </div>
      </div>

      <!-- 3) Reading with single fill-in field (input below question)
           Note: placeholder removed and value won't be restored on revisit -->
      <div class="q-card two-col" id="ex3">
        <div class="reading-pane">
          <h4>Reading</h4>
          <p>My sister has a small garden near our house. She waters the plants every day.</p>
        </div>
        <div>
          <h4>3. Điền từ vào chỗ trống</h4>
          <input id="ex3-input" class="fill-input" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false" />
        </div>
      </div>

      <!-- 4) Drag & drop -->
      <div class="q-card" id="ex4">
        <h4>4. Kéo thả để ghép câu hoàn chỉnh</h4>
        <p>Sắp xếp các cụm để thành câu: "I / to the market / went / yesterday"</p>

        <div class="drop-zone" id="drop-target"></div>

        <div class="drag-pool" id="drag-pool">
          <div class="draggable" draggable="true" data-id="w1">I</div>
          <div class="draggable" draggable="true" data-id="w2">went</div>
          <div class="draggable" draggable="true" data-id="w3">to the market</div>
          <div class="draggable" draggable="true" data-id="w4">yesterday</div>
        </div>

        <div class="ex-controls" style="justify-content:center;">
          <button id="check" class="ex-btn btn-check-like" data-action="check-all">Check</button>
        </div>
      </div>

      <!-- Fullscreen result overlay (hidden until needed) -->
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
  `,
  projects: ``,
  contact: `<h2>Liên hệ</h2><p>Email: hoanglight2006@gmail.com<br>Facebook: fb.com/hoanglight2</p>`
};

btns.forEach(btn => {
  btn.addEventListener('click', function() {
    btns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const key = btn.getAttribute('data-content');
    rightPanel.innerHTML = contents[key] || '';
    // initialize interactive parts if exercises loaded
    if (key === 'exercises') initExercises();
  });
});

// Thay listener xử lý khi bấm Test (trên trang About)
// (bắt sự kiện bấm các nút Test ở trong vùng rightPanel)
rightPanel.addEventListener('click', function(e) {
  if (e.target && e.target.classList.contains('card-btn')) {
    // lấy subject (tiêu đề của home-card) và số test từ text nút
    const card = e.target.closest('.home-card');
    const subj = card ? (card.querySelector('h3') ? card.querySelector('h3').textContent.trim() : null) : null;
    const btnText = e.target.textContent.trim();
    const m = btnText.match(/(\d+)/);
    const num = m ? Number(m[1]) : 1;
    // lưu vào biến toàn cục
    window.currentTest = { subject: subj || 'Bộ khung câu hỏi', number: num };
    // kích hoạt nút Bài tập
    const exerciseBtn = document.querySelector('.side-btn[data-content="exercises"]');
    if (exerciseBtn) exerciseBtn.click();
  }
});

// handle MC option clicks globally (works after content injected)
// also update savedState for persistence
rightPanel.addEventListener('click', function(e) {
  const opt = e.target.closest && e.target.closest('.mc-option');
  if (opt) {
    const parent = opt.parentElement;
    if (parent) parent.querySelectorAll('.mc-option').forEach(o => o.classList.remove('selected'));
    opt.classList.add('selected');

    // update savedState for the corresponding question (ex1/ex2)
    const qCard = opt.closest('.q-card');
    if (qCard && qCard.id) {
      if (qCard.id === 'ex1') window.savedState.exercises.ex1 = opt.getAttribute('data-value');
      if (qCard.id === 'ex2') window.savedState.exercises.ex2 = opt.getAttribute('data-value');
    }
  }

  // Check all action (compute score and show overlay)
  const ctrl = e.target.closest && e.target.closest('[data-action="check-all"]');
  if (ctrl) {
    // compute score
    let score = 0;
    // ex1 from savedState (fallback to DOM)
    const ex1sel = window.savedState.exercises.ex1 || (rightPanel.querySelector('#ex1 .mc-option.selected') && rightPanel.querySelector('#ex1 .mc-option.selected').getAttribute('data-value'));
    if (ex1sel === 'B') score += 1;
    // ex2
    const ex2sel = window.savedState.exercises.ex2 || (rightPanel.querySelector('#ex2 .mc-option.selected') && rightPanel.querySelector('#ex2 .mc-option.selected').getAttribute('data-value'));
    if (ex2sel === 'B') score += 1;
    // ex3 single input: read from DOM (do NOT restore previous input)
    const ex3input = (rightPanel.querySelector('#ex3 #ex3-input') || {}).value || '';
    if (ex3input.trim().toLowerCase() === 'garden') score += 1;
    // ex4 drag: check order (use savedState if present)
    const order = (window.savedState.exercises.ex4 && window.savedState.exercises.ex4.length) ? window.savedState.exercises.ex4.slice() : (function(){
      const drop = rightPanel.querySelector('#drop-target');
      return drop ? Array.from(drop.querySelectorAll('.draggable')).map(d => d.textContent.trim()) : [];
    })();
    const expected = ['I','went','to the market','yesterday'];
    let dragCorrect = 0;
    if (order.length === expected.length && order.every((v,i)=>v===expected[i])) dragCorrect = 1;
    score += dragCorrect;

    const total = 4;
    const percent = Math.round((score / total) * 100);

    // show overlay (darker)
    const overlay = rightPanel.querySelector('#resultOverlay');
    if (overlay) {
      overlay.style.display = 'flex';
      rightPanel.querySelector('#resultScore').textContent = `Điểm: ${score}/${total} (${percent}%)`;
      rightPanel.querySelector('#resultText').textContent = 'Kết quả đã được nộp.';
      overlay.setAttribute('aria-hidden', 'false');
    }
  }

  // close result overlay
  if (e.target && e.target.id === 'closeResult') {
    const overlay = rightPanel.querySelector('#resultOverlay');
    if (overlay) {
      overlay.style.display = 'none';
      overlay.setAttribute('aria-hidden', 'true');
    }
  }

  // retry / redo - reset savedState for exercises and re-render exercises to cleared state
  if (e.target && e.target.id === 'retryResult') {
    // clear state (do not store ex3)
    window.savedState.exercises = { ex1: null, ex2: null, ex3: null, ex4: [] };
    // hide overlay
    const overlay = rightPanel.querySelector('#resultOverlay');
    if (overlay) overlay.style.display = 'none';
    // re-initialize exercises view (re-render current exercises content)
    const exerciseBtn = document.querySelector('.side-btn[data-content="exercises"]');
    if (exerciseBtn) exerciseBtn.click();
  }
});

// Initialize drag & drop and other interactive bits
function initExercises() {
  // cập nhật header theo selection (nếu có) - không dùng testNum nữa
  const titleEl = rightPanel.querySelector('.ex-title');
  if (titleEl) {
    const s = window.currentTest && window.currentTest.subject ? window.currentTest.subject : 'Bộ khung câu hỏi';
    const n = window.currentTest && window.currentTest.number ? window.currentTest.number : 1;
    titleEl.textContent = `${s} - Test ${n}`;
  }

  // restore saved state (MC selections, drag order) -- DO NOT restore ex3 input
  if (window.savedState.exercises.ex1) {
    const btn = rightPanel.querySelector(`#ex1 .mc-option[data-value="${window.savedState.exercises.ex1}"]`);
    if (btn) btn.classList.add('selected');
  }
  if (window.savedState.exercises.ex2) {
    const btn = rightPanel.querySelector(`#ex2 .mc-option[data-value="${window.savedState.exercises.ex2}"]`);
    if (btn) btn.classList.add('selected');
  }

  // ex3: do NOT restore previous input; ensure it's empty
  const ex3inputEl = rightPanel.querySelector('#ex3 #ex3-input');
  if (ex3inputEl) {
    ex3inputEl.value = '';
    // do not attach input listener that saves value
  }

  // drag init and restore order if saved; allow click to move between pool and drop
  const draggables = rightPanel.querySelectorAll('.draggable');
  draggables.forEach(d => {
    d.addEventListener('dragstart', function(ev) {
      ev.dataTransfer.setData('text/plain', d.dataset.id);
    });

    // click toggles between pool and drop
    d.addEventListener('click', function() {
      const pool = rightPanel.querySelector('#drag-pool');
      const drop = rightPanel.querySelector('#drop-target');
      if (!pool || !drop) return;
      // if currently inside drop, move back to pool; otherwise move to drop
      if (drop.contains(d)) pool.appendChild(d);
      else drop.appendChild(d);
      updateSavedDragOrder();
    });
  });

  const drop = rightPanel.querySelector('#drop-target');
  if (drop) {
    drop.addEventListener('dragover', function(ev) { ev.preventDefault(); });
    drop.addEventListener('drop', function(ev) {
      ev.preventDefault();
      const id = ev.dataTransfer.getData('text/plain');
      const el = rightPanel.querySelector(`.draggable[data-id="${id}"]`);
      if (el) drop.appendChild(el);
      updateSavedDragOrder();
    });
  }

  const pool = rightPanel.querySelector('#drag-pool');
  if (pool) {
    pool.addEventListener('dragover', function(ev) { ev.preventDefault(); });
    pool.addEventListener('drop', function(ev) {
      ev.preventDefault();
      const id = ev.dataTransfer.getData('text/plain');
      const el = rightPanel.querySelector(`.draggable[data-id="${id}"]`);
      if (el) pool.appendChild(el);
      updateSavedDragOrder();
    });
  }

  // restore drag order if exists
  if (window.savedState.exercises.ex4 && window.savedState.exercises.ex4.length) {
    const savedOrder = window.savedState.exercises.ex4.slice();
    const poolEl = rightPanel.querySelector('#drag-pool');
    const dropEl = rightPanel.querySelector('#drop-target');
    // first move all to pool
    const all = rightPanel.querySelectorAll('.draggable');
    all.forEach(a => poolEl.appendChild(a));
    // then append in saved order to drop
    savedOrder.forEach(text => {
      const el = Array.from(rightPanel.querySelectorAll('.draggable')).find(d => d.textContent.trim() === text);
      if (el && dropEl) dropEl.appendChild(el);
    });
  }

  // helper to update saved drag order
  function updateSavedDragOrder() {
    const dropNow = rightPanel.querySelector('#drop-target');
    if (dropNow) {
      window.savedState.exercises.ex4 = Array.from(dropNow.querySelectorAll('.draggable')).map(d => d.textContent.trim());
    } else {
      window.savedState.exercises.ex4 = [];
    }
  }
}

// Hiển thị mặc định nội dung đầu tiên
if (btns[0]) {
  btns[0].click();
}