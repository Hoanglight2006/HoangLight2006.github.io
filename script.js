// script.js (cập nhật hỗ trợ câu hỏi tự luận và trắc nghiệm)

let questions = [];

function addQuestion() {
    const question = document.getElementById("question").value.trim();
    const optionA = document.getElementById("optionA").value.trim();
    const optionB = document.getElementById("optionB").value.trim();
    const optionC = document.getElementById("optionC").value.trim();
    const optionD = document.getElementById("optionD").value.trim();
    const answer = document.getElementById("answer").value;
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

        questions.push({
            type: "essay",
            question,
            answer: essayAnswer
        });
    } else {
        if (!optionA || !optionB || !optionC || !optionD) {
            alert("Vui lòng điền đầy đủ các đáp án A đến D.");
            return;
        }

        questions.push({
            type: "multiple",
            question,
            options: {
                A: optionA,
                B: optionB,
                C: optionC,
                D: optionD
            },
            answer
        });
    }

    alert("Đã thêm câu hỏi thành công!");
    clearForm();
    toggleFields();
}

function clearForm() {
    document.getElementById("question").value = "";
    document.getElementById("optionA").value = "";
    document.getElementById("optionB").value = "";
    document.getElementById("optionC").value = "";
    document.getElementById("optionD").value = "";
    document.getElementById("answer").value = "A";
    document.getElementById("essayAnswer").value = "";
}

function exportToJson() {
    const dataStr = JSON.stringify(questions, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "questions.json";
    a.click();
    URL.revokeObjectURL(url);
}

function toggleFields() {
    const isEssay = document.getElementById("essayMode").checked;
    document.getElementById("multipleChoiceFields").style.display = isEssay ? "none" : "block";
    document.getElementById("essayFields").style.display = isEssay ? "block" : "none";
}

document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("essayMode").addEventListener("change", toggleFields);
    toggleFields();
});
