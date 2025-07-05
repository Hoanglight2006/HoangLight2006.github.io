//============== PHẦN 1: TẠO CÂU HỎI ==============
let questionGroups = [];
let currentGroup = { context: '', questions: [] };

/**
 * Lấy dữ liệu câu hỏi từ form, trả về object câu hỏi hoặc null nếu lỗi
 */
function getQuestionDataFromForm() {
    const questionText = document.getElementById("question").value.trim();
    if (questionText === "") {
        alert("Vui lòng nhập nội dung câu hỏi.");
        return null;
    }

    const isEssay = document.getElementById("essayMode").checked;
    let newQuestion = { question: questionText };

    if (isEssay) {
        const essayAnswer = document.getElementById("essayAnswer").value.trim();
        if (essayAnswer === "") {
            alert("Vui lòng nhập đáp án cho câu hỏi tự luận.");
            return null;
        }
        newQuestion.type = "essay";
        newQuestion.answer = essayAnswer;
    } else {
        const options = {};
        const potentialOptions = {
            A: document.getElementById("answerA").value.trim(),
            B: document.getElementById("answerB").value.trim(),
            C: document.getElementById("answerC").value.trim(),
            D: document.getElementById("answerD").value.trim()
        };
        for (const key in potentialOptions) {
            if (potentialOptions[key] !== "") { options[key] = potentialOptions[key]; }
        }
        if (Object.keys(options).length < 2) {
            alert("Vui lòng điền ít nhất 2 đáp án cho câu hỏi trắc nghiệm.");
            return null;
        }
        const answer = document.getElementById("correctAnswer").value;
        if (!options[answer]) {
            alert(`Đáp án đúng "${answer}" không có nội dung. Vui lòng kiểm tra lại.`);
            return null;
        }
        newQuestion.type = "multiple";
        newQuestion.options = options;
        newQuestion.answer = answer;
    }
    return newQuestion;
}

// Chế độ 1: Thêm câu hỏi đơn lẻ (bên dưới vẫn lưu như một nhóm có 1 câu hỏi)
function addSingleQuestion() {
    const context = document.getElementById("context").value.trim();
    const newQuestion = getQuestionDataFromForm();
    if (!newQuestion) return;

    questionGroups.push({
        context: context,
        questions: [newQuestion]
    });
    
    alert("Đã thêm câu hỏi đơn thành công!");
    clearFullForm();
    updateTotalQuestionsStatus();
}

// Chế độ 2: Thêm câu hỏi vào nhóm hiện tại
function addQuestionToGroup() {
    const context = document.getElementById("context").value.trim();
    if (currentGroup.questions.length === 0) {
        currentGroup.context = context;
        document.getElementById("context").disabled = true;
    }

    const newQuestion = getQuestionDataFromForm();
    if (!newQuestion) return;

    currentGroup.questions.push(newQuestion);
    alert("Đã thêm câu hỏi vào nhóm!");
    updateGroupStatus();
    clearQuestionForm();
}

// Chế độ 2: Lưu nhóm hiện tại
function saveGroup() {
    if (currentGroup.questions.length === 0) {
        alert("Nhóm hiện tại chưa có câu hỏi nào. Vui lòng thêm câu hỏi trước khi lưu.");
        return;
    }
    questionGroups.push(currentGroup);
    alert(`Đã lưu nhóm với ${currentGroup.questions.length} câu hỏi.`);
    
    updateTotalQuestionsStatus();
    currentGroup = { context: '', questions: [] };
    clearFullForm();
    updateGroupStatus();
}

function clearFullForm() {
    document.getElementById("context").value = "";
    document.getElementById("context").disabled = false;
    clearQuestionForm();
}

function clearQuestionForm() {
    document.getElementById("question").value = "";
    document.getElementById("answerA").value = "";
    document.getElementById("answerB").value = "";
    document.getElementById("answerC").value = "";
    document.getElementById("answerD").value = "";
    document.getElementById("correctAnswer").value = "A";
    document.getElementById("essayAnswer").value = "";
    document.getElementById("question").focus();
}

function updateGroupStatus() {
    const statusBox = document.getElementById("group-status");
    const count = currentGroup.questions.length;
    statusBox.textContent = count === 0 ? "Chưa có câu hỏi nào trong nhóm này." : `Nhóm hiện tại có ${count} câu hỏi.`;
}

function updateTotalQuestionsStatus() {
    const total = questionGroups.reduce((acc, group) => acc + group.questions.length, 0);
    document.getElementById("total-questions-status").textContent = `Tổng số câu hỏi đã tạo: ${total}`;
}

function exportToJson() {
    if (currentGroup.questions.length > 0) { saveGroup(); }
    if (questionGroups.length === 0) {
        alert("Chưa có câu hỏi nào để xuất file.");
        return;
    }
    const dataStr = JSON.stringify(questionGroups, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "de_thi.json";
    a.click();
    URL.revokeObjectURL(url);
}

function toggleFields() {
    const isEssay = document.getElementById("essayMode").checked;
    document.getElementById("multipleChoiceFields").style.display = isEssay ? "none" : "block";
    document.getElementById("essayFields").style.display = isEssay ? "block" : "none";
}

function toggleCreationMode() {
    const isGroupMode = document.getElementById("groupModeToggle").checked;
    document.getElementById("single-mode-controls").style.display = isGroupMode ? "none" : "block";
    document.getElementById("group-mode-controls").style.display = isGroupMode ? "block" : "none";
    document.getElementById("context").placeholder = isGroupMode 
        ? "Bối cảnh / Đoạn văn cho cả nhóm (nếu có)"
        : "Bối cảnh / Đoạn văn cho câu hỏi này (nếu có)";
}

//============== PHẦN 2: LÀM BÀI TRẮC NGHIỆM ==============
let flatQuestions = [];
let userAnswers = {};

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

function startQuiz(groupsData) {
    flatQuestions = [];
    groupsData.forEach(group => {
        shuffleArray(group.questions);
        group.questions.forEach(q => {
            flatQuestions.push({ ...q, context: group.context });
        });
    });
    
    document.getElementById("creation-wrapper").style.display = "none";
    document.getElementById("quiz-taking-wrapper").style.display = "none";
    document.getElementById("quiz-display-wrapper").style.display = "block";
    renderQuiz();
}

function renderQuiz() {
    const quizContainer = document.getElementById("quiz-container");
    quizContainer.innerHTML = "";
    userAnswers = {};
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
        
        const questionTitle = document.createElement("p");
        questionTitle.className = "question-title";
        questionTitle.textContent = `Câu ${index + 1}: ${q.question}`;
        questionItem.appendChild(questionTitle);

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
                optionLabel.htmlFor = optionId;
                
                const optionInput = document.createElement('input');
                optionInput.type = 'radio';
                optionInput.name = `question_${index}`;
                optionInput.id = optionId;
                optionInput.value = key;
                optionInput.style.display = 'none';

                optionInput.onchange = () => {
                    userAnswers[index] = key;
                    document.querySelectorAll(`input[name="question_${index}"]`).forEach(radio => {
                        radio.parentElement.classList.remove('selected');
                    });
                    optionLabel.classList.add('selected');
                };

                optionLabel.appendChild(optionInput);
                optionLabel.append(` ${optionLetters[optionIndex]}. ${value}`);
                optionsContainer.appendChild(optionLabel);
            });
            questionItem.appendChild(optionsContainer);
        } else {
            const essayInput = document.createElement("textarea");
            essayInput.oninput = () => { userAnswers[index] = essayInput.value.trim(); };
            questionItem.appendChild(essayInput);
        }
        quizContainer.appendChild(questionItem);
    });
}

function submitQuiz() {
    const totalQuestions = flatQuestions.length;
    let correctCount = 0;
    
    flatQuestions.forEach((q, index) => {
        if (userAnswers[index] && userAnswers[index] === q.answer) {
            correctCount++;
        }
    });

    const resultsContainer = document.getElementById("results-container");
    resultsContainer.innerHTML = `<h2>Kết quả: ${correctCount} / ${totalQuestions} câu đúng</h2>`;
    
    flatQuestions.forEach((q, index) => {
        const resultItem = document.createElement("div");
        const userAnswerKey = userAnswers[index];
        const userAnswerText = q.options?.[userAnswerKey] || userAnswerKey || "Chưa trả lời";
        const isCorrect = userAnswerKey === q.answer;
        
        resultItem.className = `result-item ${isCorrect ? 'correct' : 'incorrect'}`;
        
        let resultHTML = '';
        if (q.context && document.querySelector(`.result-item .question-context[data-context="${q.context}"]`) === null) {
            resultHTML += `<div class="question-context" data-context="${q.context}">${q.context}</div>`;
        }
        resultHTML += `
            <p class="question-title">Câu ${index + 1}: ${q.question}</p>
            <div class="result-answer">
                <p><strong>Bạn trả lời:</strong> ${userAnswerText}</p>
                ${!isCorrect ? `<p><strong>Đáp án đúng:</strong> ${q.options?.[q.answer] || q.answer}</p>` : ''}
            </div>
        `;
        resultItem.innerHTML = resultHTML;
        resultsContainer.appendChild(resultItem);
    });

    document.getElementById("quiz-display-wrapper").style.display = "block";
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
    document.getElementById("submit-btn").style.display = "block";
    renderQuiz();
    window.scrollTo(0, 0);
}

function goHome() {
    location.reload();
}

//============== PHẦN 3: SỰ KIỆN KHỞI TẠO ==============
document.addEventListener("DOMContentLoaded", () => {
    toggleFields();
    toggleCreationMode();
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
                } else {
                    alert("File JSON không hợp lệ hoặc không có nhóm câu hỏi nào.");
                }
            } catch (error) {
                alert("Có lỗi xảy ra khi đọc file. Vui lòng kiểm tra lại định dạng JSON.");
            }
        };
        reader.readAsText(file);
    });
});
