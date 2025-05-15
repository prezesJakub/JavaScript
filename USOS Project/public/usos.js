document.addEventListener("DOMContentLoaded", () => {
    fetch('/api/students')
        .then(res => res.json())
        .then(students => {
            const container = document.getElementById("kartyStudenci");
            students.forEach((student, index) => {
                const div = document.createElement("div");
                div.className = "col-md-4 mb-4";
                div.innerHTML = `
                    <div class="card h-100">
                        <div class="card-header text-center">${student.imie} ${student.nazwisko}</div>
                        <div class="card-body text-center">
                            <img src="/uploads/${student.zdjecie}" alt="Zdjęcie" class="img-fluid rounded-circle mb-3 shadow" style="max-width: 250px; max-height: 250px; object-fit: cover;">
                            <p class="card-text">${formatOceny(student.oceny, index)}</p>
                        </div>
                        <div class="card-footer text-center">Student nr ${index}</div>    
                    </div>
                `;
                container.appendChild(div);
            });
        });
});

function formatOceny(oceny, studentIndex) {
    if (!oceny || oceny.length === 0) return "Brak ocen";
    return oceny.map((o, i) => `
        <div>
            ${o.przedmiot}: ${o.ocena}
            <button onclick="usunOcene(${studentIndex}, ${i})" class="btn btn-sm btn-danger ms-2">Usuń</button>
            <button onclick="edytujOcene(${studentIndex}, ${i}, '${o.przedmiot}', ${o.ocena})" class="btn btn-sm btn-warning ms-1">Edytuj</button>
        </div>
    `).join("");
}

document.getElementById("formOcena").addEventListener("submit", function (e) {
    e.preventDefault();

    const studentIndex = document.getElementById("studentIndex").value;
    const przedmiot = document.getElementById("przedmiot").value.trim();
    const ocena = parseFloat(document.getElementById("ocena").value);

    const formData = new URLSearchParams();
    formData.append("index", studentIndex);
    formData.append("przedmiot", przedmiot);
    formData.append("ocena", ocena);

    fetch("/add-grade", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: formData.toString()
    })
    .then(res => res.text())
    .then(msg => {
        alert(msg);
        location.reload();
    })
    .catch(err => {
        alert("Błąd dodawania oceny");
        console.error(err);
    });
});

function usunOcene(studentIndex, gradeIndex) {
    const formData = new URLSearchParams();
    formData.append("studentIndex", studentIndex);
    formData.append("gradeIndex", gradeIndex);

    fetch("/delete-grade", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: formData.toString()
    })
    .then(res => res.text())
    .then(msg => {
        alert(msg);
        location.reload();
    })
    .catch(err => {
        alert("Błąd usuwania oceny");
        console.error(err);
    });
}

function edytujOcene(studentIndex, gradeIndex, przedmiot, ocena) {
    const nowyPrzedmiot = prompt("Nowy przedmiot:", przedmiot);
    const nowaOcena = parseFloat(prompt("Nowa ocena:", ocena));

    if (!nowyPrzedmiot || isNaN(nowaOcena)) return;

    const formData = new URLSearchParams();
    formData.append("studentIndex", studentIndex);
    formData.append("gradeIndex", gradeIndex);
    formData.append("przedmiot", nowyPrzedmiot);
    formData.append("ocena", nowaOcena);

    fetch("/edit-grade", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: formData.toString()
    })
    .then(res => res.text())
    .then(msg => {
        alert(msg);
        location.reload();
    })
    .catch(err => {
        alert("Błąd edytowania oceny");
        console.error(err);
    });
}