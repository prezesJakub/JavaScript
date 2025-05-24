const form = document.getElementById("formOcena");
const komunikat = document.getElementById("komunikat");

if (form && komunikat) {
    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        const formData = new FormData(form);

        try {
            const response = await fetch("/add-grade", {
                method: "POST",
                body: formData,
            });

            if (!response.ok) {
                const errorText = await response.text();
                komunikat.textContent = "Błąd: " + errorText;
                komunikat.classList.remove("d-none", "alert-success");
                komunikat.classList.add("alert-danger");
                return;
            }

            komunikat.textContent = "Ocena dodana pomyślnie!";
            komunikat.classList.remove("d-none", "alert-danger");
            komunikat.classList.add("alert-success");

            const studentId = formData.get("studentId");
            const przedmiot = formData.get("przedmiot");
            const ocena = formData.get("ocena");

            const studentCard = document.querySelector(`[data-student-id="${studentId}"]`);
            if (studentCard) {
                const ulOceny = studentCard.querySelector("ul");
                if (ulOceny) {
                    const brakOcenLi = ulOceny.querySelector("li");
                    if (brakOcenLi && brakOcenLi.textContent === "Brak ocen") {
                        brakOcenLi.remove();
                    }
                    const li = document.createElement("li");
                    li.innerHTML = `${przedmiot}: ${ocena} `;

                    const editBtn = document.createElement("button");
                    editBtn.classList.add("btn", "btn-sm", "btn-warning", "ms-2", "edit-grade-btn");
                    editBtn.textContent = "Edytuj";
                    editBtn.dataset.studentId = studentId;
                    editBtn.dataset.index = ulOceny.children.length;
                    editBtn.dataset.przedmiot = przedmiot;
                    editBtn.dataset.ocena = ocena;
                    editBtn.addEventListener("click", () => {
                        document.getElementById('editStudentId').value = editBtn.dataset.studentId;
                        document.getElementById('editGradeIndex').value = editBtn.dataset.index;
                        document.getElementById('editPrzedmiot').value = editBtn.dataset.przedmiot;
                        document.getElementById('editOcena').value = editBtn.dataset.ocena;
                        const modal = new bootstrap.Modal(document.getElementById('editGradeModal'));
                        modal.show();
                    });

                    const deleteBtn = document.createElement("button");
                    deleteBtn.classList.add("btn", "btn-sm", "btn-danger", "ms-1", "delete-grade-btn");
                    deleteBtn.textContent = "Usuń";
                    deleteBtn.dataset.studentId = studentId;
                    deleteBtn.dataset.gradeIndex = ulOceny.children.length;
                    deleteBtn.addEventListener("click", async () => {
                        if (!confirm("Na pewno chcesz usunąć ocenę?")) return;

                        const res = await fetch('/delete-grade', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ studentId, gradeIndex: deleteBtn.dataset.gradeIndex })
                        });

                        if (res.ok) {
                            li.remove();
                        } else {
                            alert('Błąd podczas usuwania oceny');
                        }
                    });

                    li.appendChild(editBtn);
                    li.appendChild(deleteBtn);
                    ulOceny.appendChild(li);
                }
            }
            form.reset();
        } catch (err) {
            komunikat.textContent = "Błąd sieci: " + err.message;
            komunikat.classList.remove("d-none", "alert-success");
            komunikat.classList.add("alert-danger");
        }
    });
}

document.addEventListener("DOMContentLoaded", () => {
    const modal = new bootstrap.Modal(document.getElementById('editGradeModal'));

    document.querySelectorAll('.edit-grade-btn').forEach(button => {
        button.addEventListener('click', () => {
            document.getElementById('editStudentId').value = button.dataset.studentId;
            document.getElementById('editGradeIndex').value = button.dataset.index;
            document.getElementById('editPrzedmiot').value = button.dataset.przedmiot;
            document.getElementById('editOcena').value = button.dataset.ocena;
            modal.show();
        });
    });

    document.getElementById('editGradeForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const studentId = document.getElementById('editStudentId').value;
        const gradeIndex = document.getElementById('editGradeIndex').value;
        const przedmiot = document.getElementById('editPrzedmiot').value;
        const ocena = document.getElementById('editOcena').value;

        const res = await fetch('/edit-grade', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ studentId, gradeIndex, przedmiot, ocena })
        });

        if (res.ok) {
            window.location.reload();
        } else {
            alert('Błąd podczas edytowania oceny');
        }
    });

    document.querySelectorAll('.delete-grade-btn').forEach(button => {
        button.addEventListener('click', async () => {
            if (!confirm("Na pewno chcesz usunąć ocenę?")) return;
            const studentId = button.dataset.studentId;
            const gradeIndex = button.dataset.gradeIndex;

            const res = await fetch('/delete-grade', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ studentId, gradeIndex })
            });

            if (res.ok) {
                window.location.reload();
            } else {
                alert('Błąd podczas usuwania oceny');
            }
        });
    });
});