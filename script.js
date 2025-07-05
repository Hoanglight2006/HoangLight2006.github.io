// Global array to hold created questions
let questions = [];
let quizData = [];

// Add a new multiple-choice question
function addQuestion() {
  const qEl = document.getElementById("question");
  const aEl = document.getElementById("answerA");
  const bEl = document.getElementById("answerB");
  const cEl = document.getElementById("answerC");
  const dEl = document.getElementById("answerD");
  const correctEl = document.getElementById("correctAnswer");

  const questionText = qEl.value.trim();
  const options = [aEl.value.trim(), bEl.value.trim(), cEl.value.trim(), dEl.value.trim()];
  const correctIndex = correctEl.selectedIndex;

  // Validate input
  if (!questionText || options.some(opt => !opt)) {
    alert("Vui lòng điền đầy đủ câu hỏi và cả 4 đáp án.");
    return;
  }

  // Push MC question by default
  questions.push({
    type: "mc",
    cauHoi: questionText,
    dapan: options,
    dung: correctIndex
  });

  alert("Đã thêm câu hỏi thành công.");

  // Reset fields
  qEl.value = "";
  aEl.value = bEl.value = cEl.value = dEl.value = "";
  correctEl.selectedIndex = 0;
}

// Export created questions to JSON file
function exportToJson() {
  if (questions.length === 0) {
    alert("Chưa có câu hỏi nào để xuất.");
    return;
  }
  const blob = new Blob([JSON.stringify(questions, null, 2)], { type: 'application/json' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = 'de_trac_nghiem.json';
  link.click();
}

// Load quiz file
function loadQuizFile(input) {
  const file = input.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function(e) {
    try {
      quizData = JSON.parse(e.target.result);
      displayQuiz();
    } catch (err) {
      alert("Định dạng file không hợp lệ!");
    }
  };
  reader.readAsText(file);
}

// Display quiz questions
function displayQuiz() {
  const container = document.getElementById('noidung');
  container.innerHTML = '';
  quizData.forEach((item, idx) => {
    const qDiv = document.createElement('div');
    qDiv.className = 'quiz-item';
    
    // Question text
    const qTitle = document.createElement('p');
    qTitle.innerHTML = `<strong>${idx + 1}. ${item.cauHoi}</strong>`;
    qDiv.appendChild(qTitle);
    
    // Multiple-choice
    if (item.type === 'mc') {
      item.dapan.forEach((opt, j) => {
        const label = document.createElement('label');
        label.innerHTML = `
          <input type="radio" name="q${idx}" value="${j}"> ${String.fromCharCode(65 + j)}. ${opt}
        `;
        qDiv.appendChild(label);
      });
    }
    // Fill-in text
    else if (item.type === 'text') {
      const input = document.createElement('input');
      input.type = 'text';
      input.name = `q${idx}`;
      input.placeholder = 'Nhập đáp án...';
      input.maxLength = 200;
      input.style.margin = '8px 0';
      input.style.width = '100%';
      qDiv.appendChild(input);
    }
    container.appendChild(qDiv);
  });
  // Add submit button
  const btn = document.createElement('button');
  btn.textContent = '✅ Nộp bài';
  btn.onclick = submitQuiz;
  btn.style.marginTop = '20px';
  container.appendChild(btn);
}

// Submit and grade quiz
function submitQuiz() {
  let correctCount = 0;
  quizData.forEach((item, idx) => {
    // MC grading
    if (item.type === 'mc') {
      const selected = document.querySelector(`input[name="q${idx}"]:checked`);
      if (selected && parseInt(selected.value) === item.dung) {
        correctCount++;
      }
    }
    // Text grading (case-insensitive)
    else if (item.type === 'text') {
      const ti = document.querySelector(`input[name="q${idx}"]`);
      const userAns = ti ? ti.value.trim().toLowerCase() : '';
      const correctAns = (item.answerText || '').trim().toLowerCase();
      if (userAns === correctAns && userAns !== '') {
        correctCount++;
      }
    }
  });
  alert(`Bạn trả lời đúng ${correctCount}/${quizData.length} câu.`);
}

// Attach file input listener
const fileInput = document.getElementById('jsonFileInput');
if (fileInput) {
  fileInput.addEventListener('change', function() {
    loadQuizFile(this);
  });
}
