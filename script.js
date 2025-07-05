//============== PHẦN 1: TẠO CÂU HỎI ==============
let questions = [];

function addQuestion() {
    const question = document.getElementById("question").value.trim();
    const isEssay = document.getElementById("essayMode").checked;

    if (question === "") {
        alert("Vui lòng nhập nội dung câu hỏi.");
        return;
    }

    if (isEssay) {
        const essayAnswer = document.getElementById("essayAnswer").value.trim();
        if (essayAnswer === "") {
            alert("Vui lòng nhập đáp án cho câu hỏi tự luận.");
            return;
        }
        questions.push({ type: "essay", question, answer: essayAnswer });
    } else {
        const options = {};
        const potentialOptions = {
            A: document.getElementById("answerA").value.trim(),
            B: document.getElementById("answerB").value.trim(),
            C: document.getElementById("answerC").value.trim(),
            D: document.getElementById("answerD").value.trim()
        };

        for (const key in potentialOptions) {
            if (potentialOptions[key] !== "") {
                options[key] = potentialOptions[key];
            }
        }
        
        if (Object.keys(options).length < 2) {
            alert("Vui lòng điền ít nhất 2 đáp án cho câu hỏi trắc nghiệm.");
            return;
        }

        const answer = document.getElementById("correctAnswer").value;
        if (!options[answer]) {
            alert(`Đáp án đúng "${answer}" không có nội dung. Vui lòng kiểm tra lại.`);
            return;
        }

        questions.push({ type: "multiple", question, options, answer });
    }

    alert("Đã thêm câu hỏi thành công!");
    clearForm();
}

function clearForm() {
    document.getElementById("question").value = "";
    document.getElementById("answerA").value = "";
    document.getElementById("answerB").value = "";
    document.getElementById("answerC").value = "";
    document.getElementById("answerD").value = "";
    document.getElementById("correctAnswer").value = "A";
    document.getElementById("essayAnswer").value = "";
}

function exportToJson() {
    if (questions.length === 0) {
        alert("Chưa có câu hỏi nào để xuất file.");
        return;
    }
    const dataStr = JSON.stringify(questions, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "de_trac_nghiem.json";
    a.click();
    URL.revokeObjectURL(url);
}

function toggleFields() {
    const isEssay = document.getElementById("essayMode").checked;
    document.getElementById("multipleChoiceFields").style.display = isEssay ? "none" : "block";
    document.getElementById("essayFields").style.display = isEssay ? "block" : "none";
}

//============== PHẦN 2: LÀM BÀI TRẮC NGHIỆM ==============
let quizQuestions = [];
let userAnswers = {};

/**
 * Hàm xáo trộn mảng (thuật toán Fisher-Yates)
 * @param {Array} array Mảng cần xáo trộn
 */
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

function startQuiz(questionsData) {
    quizQuestions = questionsData;
    document.getElementById("creation-wrapper").style.display = "none";
    document.getElementById("quiz-wrapper").style.display = "block";
    renderQuiz();
}

function renderQuiz() {
    const quizContainer = document.getElementById("quiz-container");
    quizContainer.innerHTML = "";
    userAnswers = {};

    quizQuestions.forEach((q, index) => {
        const questionItem = document.createElement("div");
        questionItem.className = "quiz-question-item";
        questionItem.innerHTML = `<p class="question-title">${index + 1}. ${q.question}</p>`;

        if (q.type === "multiple") {
            const optionsContainer = document.createElement("div");
            optionsContainer.className = "options-container";
            
            // Chuyển options thành mảng, xáo trộn và render
            const optionEntries = Object.entries(q.options);
            shuffleArray(optionEntries);

            optionEntries.forEach(([key, value]) => {
                const optionId = `q${index}_${key}`;
                const optionLabel = document.createElement('label');
                optionLabel.className = 'option-label';
                optionLabel.htmlFor = optionId;
                
                const optionInput = document.createElement('input');
                optionInput.type = 'radio';
                optionInput.name = `question_${index}`;
                optionInput.id = optionId;
                optionInput.value = key; // Value là key gốc (A, B, C, D)
                optionInput.style.display = 'none'; // Ẩn radio button mặc định

                optionInput.onchange = () => {
                    userAnswers[index] = key;
                    // Cập nhật giao diện cho lựa chọn
                    document.querySelectorAll(`input[name="question_${index}"]`).forEach(radio => {
                        radio.parentElement.classList.remove('selected');
                    });
                    optionLabel.classList.add('selected');
                };

                optionLabel.appendChild(optionInput);
                optionLabel.append(` ${value}`); // Thêm nội dung đáp án
                optionsContainer.appendChild(optionLabel);
            });
            questionItem.appendChild(optionsContainer);
        } else { // Câu hỏi tự luận
            const essayInput = document.createElement("textarea");
            essayInput.className = "essay-answer-input";
            essayInput.rows = 4;
            essayInput.placeholder = "Nhập câu trả lời của bạn...";
            essayInput.oninput = () => {
                userAnswers[index] = essayInput.value.trim();
            };
            questionItem.appendChild(essayInput);
        }
        quizContainer.appendChild(questionItem);
    });
}

function submitQuiz() {
    const totalQuestions = quizQuestions.length;
    let correctCount = 0;
    
    quizQuestions.forEach((q, index) => {
        if (userAnswers[index] && userAnswers[index] === q.answer) {
            correctCount++;
        }
    });

    const resultsContainer = document.getElementById("results-container");
    resultsContainer.innerHTML = `<h2>Kết quả: ${correctCount} / ${totalQuestions} câu đúng</h2>`;
    
    quizQuestions.forEach((q, index) => {
        const resultItem = document.createElement("div");
        const userAnswer = userAnswers[index] || "Chưa trả lời";
        const isCorrect = userAnswer === q.answer;
        
        resultItem.className = `result-item ${isCorrect ? 'correct' : 'incorrect'}`;
        resultItem.innerHTML = `
            <p class="question-title">${index + 1}. ${q.question}</p>
            <div class="result-answer">
                <p><strong>Bạn trả lời:</strong> ${q.options?.[userAnswer] || userAnswer}</p>
                ${!isCorrect ? `<p><strong>Đáp án đúng:</strong> ${q.options?.[q.answer] || q.answer}</p>` : ''}
            </div>
        `;
        resultsContainer.appendChild(resultItem);
    });

    resultsContainer.style.display = "block";
    document.getElementById("submit-btn").style.display = "none";
}

//============== PHẦN 3: SỰ KIỆN KHỞI TẠO ==============
document.addEventListener("DOMContentLoaded", () => {
    // Chạy lần đầu để đảm bảo giao diện đúng
    toggleFields();

    // Lắng nghe sự kiện chọn file
    const fileInput = document.getElementById("jsonFileInput");
    fileInput.addEventListener("change", (event) => {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const questionsData = JSON.parse(e.target.result);
                if (Array.isArray(questionsData) && questionsData.length > 0) {
                    startQuiz(questionsData);
                } else {
                    alert("File JSON không hợp lệ hoặc không có câu hỏi nào.");
                }
            } catch (error) {
                alert("Có lỗi xảy ra khi đọc file. Vui lòng kiểm tra lại định dạng JSON.");
                console.error("Lỗi parse JSON:", error);
            }
        };
        reader.readAsText(file);
    });
});
