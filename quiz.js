let flatQuestions = [];
let userAnswers = {};

const QUIZ_STATE_KEY = 'quizInProgressState';
const QUIZ_TO_TAKE_KEY = 'quizToTakeNow';

// --- LOGIC LƯU VÀ KHÔI PHỤC TIẾN TRÌNH LÀM BÀI ---
function saveQuizState() {
    const quizState = { questions: flatQuestions, answers: userAnswers };
    localStorage.setItem(QUIZ_STATE_KEY, JSON.stringify(quizState));
}

function resumeQuiz() {
    const savedStateJSON = localStorage.getItem(QUIZ_STATE_KEY);
    if (savedStateJSON) {
        const savedState = JSON.parse(savedStateJSON);
        startQuiz(savedState.questions, savedState.answers, true); // Thêm cờ để không xóa state
    }
}

function clearQuizState() {
    localStorage.removeItem(QUIZ_STATE_KEY);
}

// --- LOGIC CHÍNH CỦA TRANG LÀM BÀI ---
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

function startQuiz(data, savedAnswers = {}, isResuming = false) {
    if (!isResuming) {
        clearQuizState();
        flatQuestions = [];
        data.forEach(group => {
            shuffleArray(group.questions);
            group.questions.forEach(q => flatQuestions.push({ ...q, context: group.context }));
        });
        userAnswers = {};
    } else {
        flatQuestions = data;
        userAnswers = savedAnswers;
    }
    
    document.getElementById("quiz-taking-wrapper").style.display = "none";
    document.getElementById("quiz-display-wrapper").style.display = "block";
    renderQuiz();
}

function renderQuiz() {
    const quizContainer = document.getElementById("quiz-container");
    quizContainer.innerHTML = "";
    let lastContext = null;

    flatQuestions.forEach((q, index) => {
        if (q.context && q.context !== lastContext) {
            const contextEl = document.createElement("div");
            contextEl.className = "question-context";
            contextEl.textContent = q.context;
            quizContainer.appendChild(contextEl);
            lastContext = q.context;
        }

        const questionItem = document.createElement("div");
        questionItem.className = "quiz-question-item";
        let questionHTML = '';
        if (q.questionImage) { questionHTML += `<img src="${q.questionImage}" class="quiz-image" alt="Hình ảnh câu hỏi">`; }
        if (q.question) { questionHTML += `<p class="question-title">Câu ${index + 1}: ${q.question}</p>`; }
        else { questionHTML += `<p class="question-title">Câu ${index + 1}:</p>`; }
        questionItem.innerHTML = questionHTML;

        if (q.type === "multiple") {
            const optionsContainer = document.createElement("div");
            optionsContainer.className = "options-container";
            const optionEntries = Object.entries(q.options);
            shuffleArray(optionEntries);
            const optionLetters = ['A', 'B', 'C', 'D'];

            optionEntries.forEach(([key, value], optionIndex) => {
                const optionId = `q${index}_${key}`;
                const optionLabel = document.createElement('label');
                optionLabel.className = 'option-label';
                if (userAnswers[index] === key) optionLabel.classList.add('selected');
                optionLabel.htmlFor = optionId;
                
                const optionInput = document.createElement('input');
                optionInput.type = 'radio';
                optionInput.name = `question_${index}`;
                optionInput.id = optionId;
                optionInput.value = key;
                optionInput.style.display = 'none';
                if (userAnswers[index] === key) optionInput.checked = true;

                optionInput.onchange = () => {
                    userAnswers[index] = key;
                    saveQuizState();
                    document.querySelectorAll(`input[name="question_${index}"]`).forEach(radio => radio.parentElement.classList.remove('selected'));
                    optionLabel.classList.add('selected');
                };
                
                optionLabel.appendChild(optionInput);
                const optionContent = document.createElement('div');
                optionContent.className = 'option-content';
                const textSpan = document.createElement('span');
                textSpan.textContent = value.text ? `${optionLetters[optionIndex]}. ${value.text}` : `${optionLetters[optionIndex]}.`;
                optionContent.appendChild(textSpan);
                if (value.image) {
                    const img = document.createElement('img');
                    img.src = value.image;
                    img.alt = 'Hình ảnh đáp án';
                    img.className = 'quiz-image';
                    optionContent.appendChild(img);
                }
                optionLabel.appendChild(optionContent);
                optionsContainer.appendChild(optionLabel);
            });
            questionItem.appendChild(optionsContainer);
        } else {
            const essayInput = document.createElement("textarea");
            essayInput.rows = 4;
            essayInput.placeholder = "Nhập câu trả lời của bạn...";
            essayInput.value = userAnswers[index] || '';
            essayInput.oninput = () => {
                userAnswers[index] = essayInput.value.trim();
                saveQuizState();
            };
            questionItem.appendChild(essayInput);
        }
        quizContainer.appendChild(questionItem);
    });
}

function submitQuiz() {
    clearQuizState();
    const totalQuestions = flatQuestions.length;
    let correctCount = 0;
    flatQuestions.forEach((q, index) => { if (userAnswers[index] && userAnswers[index] === q.answer) correctCount++; });

    const resultsContainer = document.getElementById("results-container");
    resultsContainer.innerHTML = `<h2>Kết quả: ${correctCount} / ${totalQuestions} câu đúng</h2>`;
    
    let lastContextRendered = null;
    flatQuestions.forEach((q, index) => {
        const resultItem = document.createElement("div");
        const userAnswerKey = userAnswers[index];
        const isCorrect = userAnswerKey === q.answer;
        resultItem.className = `result-item ${isCorrect ? 'correct' : 'incorrect'}`;
        let resultHTML = '';
        if (q.context && q.context !== lastContextRendered) { resultHTML += `<div class="question-context">${q.context}</div>`; lastContextRendered = q.context; }
        if (q.questionImage) resultHTML += `<img src="${q.questionImage}" class="quiz-image" alt="Hình ảnh câu hỏi">`;
        resultHTML += `<p class="question-title">Câu ${index + 1}: ${q.question}</p>`;
        let userAnswerText = '<i>Chưa trả lời</i>';
        if (q.type === 'multiple' && userAnswerKey) {
            const answerObj = q.options[userAnswerKey];
            userAnswerText = answerObj.text || '';
            if (answerObj.image) userAnswerText += `<br><img src="${answerObj.image}" class="quiz-image" style="max-width: 150px;">`;
        } else if (userAnswerKey) { userAnswerText = userAnswerKey; }
        if (userAnswerText.trim() === '' && q.type === 'multiple') userAnswerText = '<i>(Chỉ có hình ảnh)</i>';
        let correctAnswerHTML = '';
        if (!isCorrect) {
            if (q.type === 'multiple') {
                const correctObj = q.options[q.answer];
                let correctAnswerText = correctObj.text || '';
                if (correctObj.image) correctAnswerText += `<br><img src="${correctObj.image}" class="quiz-image" style="max-width: 150px;">`;
                if (correctAnswerText.trim() === '') correctAnswerText = '<i>(Chỉ có hình ảnh)</i>';
                correctAnswerHTML = `<p><strong>Đáp án đúng:</strong> ${correctAnswerText}</p>`;
            } else { correctAnswerHTML = `<p><strong>Đáp án đúng:</strong> ${q.answer}</p>`; }
        }
        resultHTML += `<div class="result-answer"><p><strong>Bạn trả lời:</strong> ${userAnswerText}</p>${correctAnswerHTML}</div>`;
        resultItem.innerHTML = resultHTML;
        resultsContainer.appendChild(resultItem);
    });
    
    document.getElementById("quiz-container").style.display = "none";
    document.getElementById("navigation-controls").style.display = "none";
    resultsContainer.style.display = "block";
    document.getElementById("post-quiz-controls").style.display = "flex";
}

function retakeQuiz() {
    shuffleArray(flatQuestions);
    document.getElementById("results-container").style.display = "none";
    document.getElementById("post-quiz-controls").style.display = "none";
    document.getElementById("quiz-container").style.display = "block";
    document.getElementById("navigation-controls").style.display = "flex";
    userAnswers = {}; // Xóa câu trả lời cũ khi làm lại
    clearQuizState();
    renderQuiz();
    window.scrollTo(0, 0);
}

function goHome() {
    window.location.href = 'index.html';
}

document.addEventListener("DOMContentLoaded", () => {
    // Ưu tiên khôi phục bài làm từ đề vừa tạo
    const quizDataFromCreator = localStorage.getItem(QUIZ_TO_TAKE_KEY);
    if (quizDataFromCreator) {
        localStorage.removeItem(QUIZ_TO_TAKE_KEY); // Xóa ngay để không bị lặp lại
        const groupsData = JSON.parse(quizDataFromCreator);
        startQuiz(groupsData);
        return;
    }

    // Nếu không, kiểm tra xem có bài làm dang dở không
    if (localStorage.getItem(QUIZ_STATE_KEY)) {
        if (confirm("Phát hiện một bài làm đang dang dở. Bạn có muốn tiếp tục không?")) {
            resumeQuiz();
        } else {
            clearQuizState();
        }
    }

    // Gắn sự kiện cho ô tải file
    const fileInput = document.getElementById("jsonFileInput");
    fileInput.addEventListener("change", (event) => {
        const file = event.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const groupsData = JSON.parse(e.target.result);
                if (Array.isArray(groupsData) && groupsData.length > 0) {
                    startQuiz(groupsData);
                } else { alert("File không hợp lệ."); }
            } catch (error) { alert("Lỗi đọc file."); }
        };
        reader.readAsText(file);
    });
});