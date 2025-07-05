let danhSach = [];

function themCauHoi() {
    const cauHoi = document.getElementById("q").value;
    const dapan = [
        document.getElementById("a").value,
        document.getElementById("b").value,
        document.getElementById("c").value,
        document.getElementById("d").value
    ];
    const dung = parseInt(document.getElementById("correct").value);

    if (!cauHoi || dapan.some(d => !d)) {
        alert("Điền đầy đủ câu hỏi và các đáp án!");
        return;
    }

    danhSach.push({ cauHoi, dapan, dung });
    alert("Đã thêm câu hỏi ✅");
    
    // Reset input
    document.getElementById("q").value = "";
    document.getElementById("a").value = "";
    document.getElementById("b").value = "";
    document.getElementById("c").value = "";
    document.getElementById("d").value = "";
    document.getElementById("correct").value = "0";
}

function xuatFile() {
    if (danhSach.length === 0) {
        alert("Chưa có câu hỏi nào!");
        return;
    }
    const blob = new Blob([JSON.stringify(danhSach, null, 2)], { type: "application/json" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "de_trac_nghiem.json";
    link.click();
}

let de = [];

function taiDe(input) {
    const reader = new FileReader();
    reader.onload = function(e) {
        de = JSON.parse(e.target.result);
        hienThiCauHoi();
    };
    reader.readAsText(input.files[0]);
}

function hienThiCauHoi() {
    let html = '';
    de.forEach((c, i) => {
        html += `<div><b>${i + 1}. ${c.cauHoi}</b><br>`;
        c.dapan.forEach((da, j) => {
            html += `<input type="radio" name="q${i}" value="${j}"> ${String.fromCharCode(65 + j)}. ${da}<br>`;
        });
        html += `</div><br>`;
    });
    html += `<button onclick="nopBai()">✅ Nộp bài</button>`;
    document.getElementById("noidung").innerHTML = html;
}

function nopBai() {
    let dung = 0;
    de.forEach((c, i) => {
        const chon = document.querySelector(`input[name="q${i}"]:checked`);
        if (chon && parseInt(chon.value) === c.dung) dung++;
    });
    alert(`🎉 Bạn đã làm đúng ${dung}/${de.length} câu!`);
}
