// builder.js
// giữ data giữa các lần mở
window.builderData = window.builderData || { questions: [] };

function initBuilder() {
  const panel = document.getElementById('rightPanel');
  // builderArea trước, controls sau để controls luôn nằm dưới danh sách
  panel.innerHTML = `
    <div class="exercise-container">
      <div class="ex-header"><h3 class="ex-title">Trình tạo đề</h3></div>
      <div id="builderArea"></div>

      <div class="ex-controls" style="flex-wrap:wrap; gap:10px;">
        <select id="qTypeSelect" class="fill-input" style="min-width:220px;">
          <option value="mcq">Trắc nghiệm (chọn 1 đáp án)</option>
          <option value="reading-mcq">Đọc hiểu + trắc nghiệm</option>
          <option value="fill">Điền khuyết (1 từ)</option>
          <option value="drag">Sắp xếp (kéo thả)</option>
        </select>

        <button id="addQ" class="ex-btn btn-check-like">+ Thêm câu</button>
        <button id="finishQ" class="ex-btn btn-check-like">Hoàn thành</button>
      </div>
    </div>
  `;

  renderBuilder();
  attachBuilderEvents();
}

function renderBuilder() {
  const area = document.getElementById('builderArea');
  if (!area) return;
  const qs = window.builderData.questions;
  if (!qs || qs.length === 0) {
    area.innerHTML = `<p style="color:var(--accent);">Chưa có câu hỏi. Chọn loại rồi bấm "+ Thêm câu".</p>`;
    return;
  }

  area.innerHTML = qs.map((q, idx) => renderBuilderQuestionHTML(q, idx)).join('');
  // sau khi set innerHTML, gán giá trị thực và sự kiện input
  const cards = area.querySelectorAll('.q-card');
  cards.forEach((card, idx) => {
    const q = window.builderData.questions[idx];

    // question text area
    const qTxt = card.querySelector('.q-input-question');
    if (qTxt) {
      qTxt.value = q.question || '';
      qTxt.addEventListener('input', e => { q.question = e.target.value; });
    }

    // mcq / reading-mcq options
    const optNodes = card.querySelectorAll('.q-input-option');
    if (optNodes && optNodes.length) {
      q.options = q.options || ['', '', ''];
      optNodes.forEach((inp, i) => {
        inp.value = q.options[i] || '';
        inp.addEventListener('input', e => { q.options[i] = e.target.value; });
      });
    }

    // answer input (for fill or mcq correct letter)
    const ansNode = card.querySelector('.q-input-answer');
    if (ansNode) {
      ansNode.value = q.answer || '';
      ansNode.addEventListener('input', e => { q.answer = e.target.value; });
    }

    // reading area
    const rNode = card.querySelector('.q-input-reading');
    if (rNode) {
      rNode.value = q.reading || '';
      rNode.addEventListener('input', e => { q.reading = e.target.value; });
    }

    // drag words
    const wNode = card.querySelector('.q-input-words');
    if (wNode) {
      wNode.value = (q.words || []).join(', ');
      wNode.addEventListener('input', e => {
        const arr = e.target.value.split(',').map(s => s.trim()).filter(Boolean);
        q.words = arr;
        q.answer = arr.slice(); // default answer sequence = words order
      });
    }

    // delete button
    const delBtn = card.querySelector('.del-q');
    if (delBtn) {
      delBtn.addEventListener('click', () => {
        window.builderData.questions.splice(idx, 1);
        renderBuilder(); // rerender after delete
      });
    }
  });
}

function renderBuilderQuestionHTML(q, idx) {
  // note: we intentionally do NOT put "Câu X" header text to avoid duplication
  if (q.type === 'mcq') {
    return `
      <div class="q-card" id="bq${idx}">
        <textarea class="q-input-question fill-input" placeholder="Nhập câu hỏi..." style="min-height:72px;"></textarea>
        <div class="mc-options" style="margin-top:8px;">
          <input class="q-input-option fill-input" placeholder="Đáp án A" />
          <input class="q-input-option fill-input" placeholder="Đáp án B" />
          <input class="q-input-option fill-input" placeholder="Đáp án C" />
        </div>
        <div style="display:flex;gap:8px;align-items:center;margin-top:8px;">
          <input class="q-input-answer fill-input" placeholder="Đáp án đúng (A/B/C)" style="max-width:160px;" />
          <button class="del-q" style="margin-left:auto;background:transparent;border:1px solid rgba(0,0,0,0.06);padding:6px 8px;border-radius:6px;cursor:pointer;">Xóa</button>
        </div>
      </div>
    `;
  }

  if (q.type === 'reading-mcq') {
    return `
      <div class="q-card two-col" id="bq${idx}">
        <div>
          <textarea class="q-input-reading fill-input" placeholder="Đoạn đọc..." style="min-height:120px;"></textarea>
        </div>
        <div>
          <textarea class="q-input-question fill-input" placeholder="Câu hỏi..." style="min-height:72px;"></textarea>
          <div class="mc-options" style="margin-top:8px;">
            <input class="q-input-option fill-input" placeholder="Đáp án A" />
            <input class="q-input-option fill-input" placeholder="Đáp án B" />
            <input class="q-input-option fill-input" placeholder="Đáp án C" />
          </div>
          <div style="display:flex;gap:8px;align-items:center;margin-top:8px;">
            <input class="q-input-answer fill-input" placeholder="Đáp án đúng (A/B/C)" style="max-width:160px;" />
            <button class="del-q" style="margin-left:auto;background:transparent;border:1px solid rgba(0,0,0,0.06);padding:6px 8px;border-radius:6px;cursor:pointer;">Xóa</button>
          </div>
        </div>
      </div>
    `;
  }

  if (q.type === 'fill') {
    return `
      <div class="q-card" id="bq${idx}">
        <textarea class="q-input-question fill-input" placeholder="Nhập câu (chỗ trống dùng dấu ___)..." style="min-height:72px;"></textarea>
        <div style="display:flex;gap:8px;align-items:center;margin-top:8px;">
          <input class="q-input-answer fill-input" placeholder="Đáp án đúng" style="max-width:220px;" />
          <button class="del-q" style="margin-left:auto;background:transparent;border:1px solid rgba(0,0,0,0.06);padding:6px 8px;border-radius:6px;cursor:pointer;">Xóa</button>
        </div>
      </div>
    `;
  }

  if (q.type === 'drag') {
    return `
      <div class="q-card" id="bq${idx}">
        <textarea class="q-input-question fill-input" placeholder="Nhập yêu cầu sắp xếp..." style="min-height:72px;"></textarea>
        <input class="q-input-words fill-input" placeholder="Nhập các từ, cách nhau bằng dấu phẩy" style="margin-top:8px;" />
        <div style="display:flex;gap:8px;align-items:center;margin-top:8px;">
          <small style="color:var(--text-light);">Các từ sẽ dùng để tạo drag-pool theo thứ tự bạn nhập.</small>
          <button class="del-q" style="margin-left:auto;background:transparent;border:1px solid rgba(0,0,0,0.06);padding:6px 8px;border-radius:6px;cursor:pointer;">Xóa</button>
        </div>
      </div>
    `;
  }

  return `<div class="q-card">Loại câu hỏi không hợp lệ</div>`;
}

function attachBuilderEvents() {
  const addBtn = document.getElementById('addQ');
  const finishBtn = document.getElementById('finishQ');
  const sel = document.getElementById('qTypeSelect');

  if (addBtn) {
    addBtn.onclick = () => {
      const type = sel.value;
      // mặc định cấu trúc cho mỗi loại
      if (type === 'mcq') {
        window.builderData.questions.push({ type, question: '', options: ['', '', ''], answer: '' });
      } else if (type === 'reading-mcq') {
        window.builderData.questions.push({ type, reading: '', question: '', options: ['', '', ''], answer: '' });
      } else if (type === 'fill') {
        window.builderData.questions.push({ type, question: '', answer: '' });
      } else if (type === 'drag') {
        window.builderData.questions.push({ type, question: '', words: [], answer: [] });
      } else {
        window.builderData.questions.push({ type });
      }
      renderBuilder();
    };
  }

  if (finishBtn) {
    finishBtn.onclick = () => {
      // build final JSON format like mẫu
      const outQuestions = window.builderData.questions.map((q, idx) => {
        const base = { id: `q${idx+1}`, type: q.type };
        if (q.type === 'mcq') {
          base.question = (q.question||'').trim();
          base.options = (q.options||[]).map(s=>s.trim());
          base.answer = (q.answer||'').trim().toUpperCase();
        } else if (q.type === 'reading-mcq') {
          base.reading = (q.reading||'').trim();
          base.question = (q.question||'').trim();
          base.options = (q.options||[]).map(s=>s.trim());
          base.answer = (q.answer||'').trim().toUpperCase();
        } else if (q.type === 'fill') {
          base.question = (q.question||'').trim();
          base.answer = (q.answer||'').trim();
        } else if (q.type === 'drag') {
          base.question = (q.question||'').trim();
          base.words = (q.words||[]).map(s=>s.trim());
          base.answer = base.words.slice();
        }
        return base;
      });

      const json = JSON.stringify({ title: "Đề mới", questions: outQuestions }, null, 2);
      downloadJson(json, 'test.json');
    };
  }
}

function downloadJson(content, filename) {
  const blob = new Blob([content], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
}
