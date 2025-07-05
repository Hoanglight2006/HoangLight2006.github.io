let questionGroups = [];
let currentGroup = { context: '', questions: [] };
let tempImages = { question: null, A: null, B: null, C: null, D: null };

const CREATION_DATA_KEY = 'quizMakerData';
const QUIZ_TO_TAKE_KEY = 'quizToTakeNow';

// --- LOGIC LƯU TRỮ DỮ LIỆU ---
function saveDataToLocalStorage() {
    localStorage.setItem(CREATION_DATA_KEY, JSON.stringify(questionGroups));
}

function loadDataFromLocalStorage() {
    const savedData = localStorage.getItem(CREATION_DATA_KEY);
    if (savedData) {
        questionGroups = JSON.parse(savedData);
        updateTotalQuestionsStatus();
    }
}

function clearAllData() {
    if (confirm("Bạn có chắc chắn muốn xóa toàn bộ đề đã tạo không? Thao tác này không thể hoàn tác.")) {
        questionGroups = [];
        currentGroup = { context: '', questions: [] };
        localStorage.removeItem(CREATION_DATA_KEY);
        updateTotalQuestionsStatus();
        updateGroupStatus();
        alert("Đã xóa toàn bộ dữ liệu.");
    }
}

function takeQuizNow() {
    if (currentGroup.questions.length > 0) {
        if (!confirm("Bạn có một nhóm câu hỏi chưa lưu. Lưu lại và bắt đầu làm bài?")) {
            return;
        }
        saveGroup();
    }
    if (questionGroups.length === 0) {
        alert("Chưa có câu hỏi nào để làm bài.");
        return;
    }
    localStorage.setItem(QUIZ_TO_TAKE_KEY, JSON.stringify(questionGroups));
    window.location.href = 'quiz.html';
}

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
    container.innerHTML = `<img src="${base64}" class="image-preview" alt="Xem trước"><button type="button" class="remove-image-btn" onclick="removeImage('${targetKey}')">Xóa ảnh</button>`;
}

function removeImage(targetKey) {
    tempImages[targetKey] = null;
    document.getElementById(`${targetKey}-preview-container`).innerHTML = '';
    const inputId = targetKey === 'question' ? 'questionImage' : `answer${targetKey}Image`;
    const input = document.getElementById(inputId);
    if (input) input.value = '';
}

// --- LOGIC TẠO CÂU HỎI ---
function getQuestionDataFromForm() {
    const questionText = document.getElementById("question").value.trim();
    if (questionText === "" && !tempImages.question) {
        alert("Vui lòng nhập nội dung hoặc thêm ảnh cho câu hỏi.");
        return null;
    }
    const isEssay = document.getElementById("essayMode").checked;
    let newQuestion = { question: questionText, questionImage: tempImages.question };
    if (isEssay) {
        newQuestion.type = "essay";
        newQuestion.answer = document.getElementById("essayAnswer").value.trim();
    } else {
        const options = {};
        ['A', 'B', 'C', 'D'].forEach(key => {
            const text = document.getElementById(`answer${key}`).value.trim();
            const image = tempImages[key];
            if (text || image) { options[key] = { text, image }; }
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
    saveDataToLocalStorage();
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
    saveDataToLocalStorage();
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
    ['A', 'B', 'C', 'D'].forEach(key => { document.getElementById(`answer${key}`).value = ""; });
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
    document.getElementById("context").placeholder = isGroupMode ? "Bối cảnh / Đoạn văn cho cả nhóm (nếu có)" : "Bối cảnh / Đoạn văn cho câu hỏi này (nếu có)";
}

document.addEventListener("DOMContentLoaded", () => {
    loadDataFromLocalStorage();
    toggleFields();
    toggleCreationMode();
});