let questions = [];

function addQuestion() {
    const question = document.getElementById("question").value.trim();
    const isEssay = document.getElementById("essayMode").checked;

    if (question === "") {
        alert("Vui lòng nhập nội dung câu hỏi.");
        return;
    }

    if (isEssay) {
        // Xử lý câu hỏi tự luận
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
        // Xử lý câu hỏi trắc nghiệm
        const options = {};
        const potentialOptions = {
            A: document.getElementById("answerA").value.trim(),
            B: document.getElementById("answerB").value.trim(),
            C: document.getElementById("answerC").value.trim(),
            D: document.getElementById("answerD").value.trim()
        };

        // Chỉ thêm các đáp án có nội dung
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
        // Kiểm tra xem đáp án đúng có nằm trong các lựa chọn đã nhập không
        if (!options[answer]) {
            alert(`Đáp án đúng "${answer}" không có nội dung. Vui lòng kiểm tra lại.`);
            return;
        }

        questions.push({
            type: "multiple",
            question,
            options,
            answer
        });
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

// Chạy lần đầu để đảm bảo giao diện đúng với trạng thái checkbox
document.addEventListener("DOMContentLoaded", toggleFields);
