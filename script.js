//============== PHẦN 1: TẠO CÂU HỎI ==============
let questionGroups = [];
let currentGroup = { context: '', questions: [] };
let tempImages = { question: null, A: null, B: null, C: null, D: null };

// --- LOGIC XỬ LÝ ẢNH ---
function handleImageUpload(event, targetKey) {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
        tempImages[targetKey] = e.target.result;
        renderPreview(targetKey, e.target.result);
    };
    reader.readAsDataURL(file);
}

function renderPreview(targetKey, base64) {
    const container = document.getElementById(`${targetKey}-preview-container`);
    container.innerHTML = `
        <img src="${base64}" class="image-preview" alt="Xem trước">
        <button type="button" class="remove-image-btn" onclick="removeImage('${targetKey}')">Xóa ảnh</button>
    `;
}

function removeImage(targetKey) {
    tempImages[targetKey] = null;
    document.getElementById(`${targetKey}-preview-container`).innerHTML = '';
    const inputId = targetKey === 'question' ? 'questionImage' : `answer${targetKey}Image`;
    const input = document.getElementById(inputId);
    if (input) input.value = '';
}
// --- KẾT THÚC LOGIC XỬ LÝ ẢNH ---

function getQuestionDataFromForm() {
    const questionText = document.getElementById("question").value.trim();
    if (questionText === "" && !tempImages.question) {
        alert("Vui lòng nhập nội dung hoặc thêm ảnh cho câu hỏi.");
        return null;
    }

    const isEssay = document.getElementById("essayMode").checked;
    let newQuestion = {
        question: questionText,
        questionImage: tempImages.question
    };

    if (isEssay) {
        newQuestion.type = "essay";
        newQuestion.answer = document.getElementById("essayAnswer").value.trim();
    } else {
        const options = {};
        ['A', 'B', 'C', 'D'].forEach(key => {
            const text = document.getElementById(`answer${key}`).value.trim();
            const image = tempImages[key];
            if (text || image) {
                options[key] = { text, image };
            }
        });

        if (Object.keys(options).length < 2) {
            alert("Vui lòng cung cấp ít nhất 2 đáp án.");
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

function addSingleQuestion() {
    const context = document.getElementById("context").value.trim();
    const newQuestion = getQuestionDataFromForm();
    if (!newQuestion) return;
    questionGroups.push({ context: context, questions: [newQuestion] });
    alert("Đã thêm câu hỏi đơn thành công!");
    clearFullForm();
    updateTotalQuestionsStatus();
}

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

function saveGroup() {
    if (currentGroup.questions.length === 0) {
        alert("Nhóm hiện tại chưa có câu hỏi nào.");
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
    ['question', 'A', 'B', 'C', 'D'].forEach(removeImage);
    document.getElementById("question").value = "";
    ['A', 'B', 'C', 'D'].forEach(key => {
        document.getElementById(`answer${key}`).value = "";
    });
    document.getElementById("correctAnswer").value = "A";
    document.getElementById("essayAnswer").value = "";
    document.getElementById("question").focus();
}

function updateGroupStatus() {
    const count = currentGroup.questions.length;
    document.getElementById("group-status").textContent = count === 0 ? "Chưa có câu hỏi nào trong nhóm này." : `Nhóm hiện tại có ${count} câu hỏi.`;
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
        let questionHTML = '';
        if (q.questionImage) {
            questionHTML += `<img src="${q.questionImage}" class="quiz-image" alt="Hình ảnh câu hỏi">`;
        }
        questionHTML += `<p class="question-title">Câu ${index + 1}: ${q.question}</p>`;
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
                optionLabel.htmlFor = optionId;
                
                const optionInput = document.createElement('input');
                optionInput.type = 'radio';
                optionInput.name = `question_${index}`;
                optionInput.id = optionId;
                optionInput.value = key;
                optionInput.style.display = 'none';

                // **SỬA LỖI: Thêm logic tô sáng lựa chọn**
                optionInput.onchange = () => {
                    userAnswers[index] = key;
                    document.querySelectorAll(`input[name="question_${index}"]`).forEach(radio => {
                        radio.parentElement.classList.remove('selected');
                    });
                    optionLabel.classList.add('selected');
                };

                let optionHTML = `<div class="option-content"><span>${optionLetters[optionIndex]}. ${value.text}</span>`;
                if (value.image) {
                    optionHTML += `<img src="${value.image}" class="quiz-image" alt="Hình ảnh đáp án">`;
                }
                optionHTML += `</div>`;
                
                optionLabel.appendChild(optionInput);
                optionLabel.innerHTML += optionHTML; // Nối chuỗi thay vì gán đè
                optionsContainer.appendChild(optionLabel);
            });
            questionItem.appendChild(optionsContainer);
        } else {
            const essayInput = document.createElement("textarea");
            essayInput.rows = 4;
            essayInput.placeholder = "Nhập câu trả lời của bạn...";
            essayInput.oninput = () => { userAnswers[index] = essayInput.value.trim(); };
            questionItem.appendChild(essayInput);
        }
        quizContainer.appendChild(questionItem);
    });
}

// **SỬA LỖI: Hoàn thiện logic hiển thị kết quả**
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
    
    let lastContext = null;
    flatQuestions.forEach((q, index) => {
        const resultItem = document.createElement("div");
        const userAnswerKey = userAnswers[index];
        const isCorrect = userAnswerKey === q.answer;
        
        resultItem.className = `result-item ${isCorrect ? 'correct' : 'incorrect'}`;
        
        let resultHTML = '';
        if (q.context && q.context !== lastContext) {
            resultHTML += `<div class="question-context">${q.context}</div>`;
            lastContext = q.context;
        }
        if(q.questionImage) {
            resultHTML += `<img src="${q.questionImage}" class="quiz-image" alt="Hình ảnh câu hỏi">`;
        }
        resultHTML += `<p class="question-title">Câu ${index + 1}: ${q.question}</p>`;

        // Hiển thị đáp án
        let userAnswerText = 'Chưa trả lời';
        if (q.type === 'multiple' && userAnswerKey) {
            const answerObj = q.options[userAnswerKey];
            userAnswerText = answerObj.text;
            if (answerObj.image) {
                userAnswerText += `<br><img src="${answerObj.image}" class="quiz-image" style="max-width: 150px;">`;
            }
        } else if (userAnswerKey) {
            userAnswerText = userAnswerKey; // For essay
        }

        let correctAnswerText = '';
        if (!isCorrect) {
            const correctObj = q.options[q.answer];
            correctAnswerText = correctObj.text;
            if (correctObj.image) {
                correctAnswerText += `<br><img src="${correctObj.image}" class="quiz-image" style="max-width: 150px;">`;
            }
        }
        
        resultHTML += `
            <div class="result-answer">
                <p><strong>Bạn trả lời:</strong> ${userAnswerText}</p>
                ${!isCorrect ? `<p><strong>Đáp án đúng:</strong> ${correctAnswerText}</p>` : ''}
            </div>
        `;
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
                    alert("File không hợp lệ.");
                }
            } catch (error) {
                alert("Lỗi đọc file.");
            }
        };
        reader.readAsText(file);
    });
});
