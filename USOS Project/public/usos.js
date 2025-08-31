function xmlFetch(url, method, xmlBody) {
    return fetch(url, {
        method,
        headers: { 'Content-Type': 'application/xml' },
        body: xmlBody
    });
}

document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll('.grade-item').forEach(el => {
        el.addEventListener('dragstart', e => {
            e.dataTransfer.setData("text/plain", el.dataset.grade);
            console.log('dragstart grade=', el.dataset.grade);
        });
    });

    document.querySelectorAll('.card[data-student-id]').forEach(card => {
        const studentId = card.dataset.studentId;
        const ocenyList = card.querySelector('.oceny-list');

        card.addEventListener('dragover', e => {
            if (!e.target.closest('.grade-slot')) e.preventDefault();
        });

        card.addEventListener('drop', async e => {
            if (e.target.closest('.grade-slot')) return;
            e.preventDefault();

            const ocena = e.dataTransfer.getData("text/plain");
            let przedmiot = prompt("Podaj nazwę przedmiotu:");
            if (!przedmiot) return;
            przedmiot = przedmiot.trim();
            if (!przedmiot) return;

            console.log('add-grade drop', { studentId, przedmiot, ocena });

            const form = new FormData();
            form.append('studentId', studentId);
            form.append('przedmiot', przedmiot);
            form.append('ocena', ocena);

            try {
                const res = await fetch('/add-grade', { method: 'POST', body: form });
                if (res.ok) {
                    window.location.reload();
                } else {
                    console.error('add-grade error', await res.text());
                    alert('Błąd dodawania oceny: ' + await res.text());
                }
            } catch (err) {
                console.error('add-grade fetch error', err);
                alert('Błąd sieci podczas dodawania oceny');
            }
        });

        if (ocenyList) {
            ocenyList.addEventListener('dragover', e => {
                const li = e.target.closest('.grade-slot[data-grade-index]');
                if (li) e.preventDefault();
            });

            ocenyList.addEventListener('drop', async e => {
                e.preventDefault();
                e.stopPropagation();

                const li = e.target.closest('.grade-slot[data-grade-index]');
                if (!li) return;

                const ocena = e.dataTransfer.getData("text/plain");
                const gradeIndex = Number(li.dataset.gradeIndex);
                const przedmiot = li.dataset.przedmiot;

                console.log('edit-grade drop', { studentId, gradeIndex, przedmiot, ocena });

                if (!studentId || Number.isNaN(gradeIndex) || !przedmiot) {
                    alert("Brak danych przedmiotu lub indeksu oceny!");
                    return;
                }

                try {
                    const res = await fetch('/edit-grade', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ studentId, gradeIndex, przedmiot, ocena })
                    });

                    if (res.ok) {
                        window.location.reload();
                    } else {
                        console.error('edit-grade server:', await res.text());
                        alert('Błąd przy zamianie oceny: ' + await res.text());
                    }
                } catch (err) {
                    console.error('edit-grade fetch error', err);
                    alert('Błąd sieci podczas edycji oceny');
                }
            });

            ocenyList.addEventListener('click', async e => {
                const li = e.target.closest('.grade-slot[data-grade-index]');
                if (!li) return;
                e.stopPropagation();

                if (!confirm("Usunąć tę ocenę?")) return;

                const gradeIndex = Number(li.dataset.gradeIndex);
                console.log('delete-grade click', { studentId, gradeIndex });

                if (!studentId || Number.isNaN(gradeIndex)) {
                    alert("Niepoprawny indeks oceny!");
                    return;
                }

                try {
                    const res = await fetch('/delete-grade', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ studentId, gradeIndex })
                    });

                    if (res.ok) {
                        window.location.reload();
                    } else {
                        console.error('delete-grade server:', await res.text());
                        alert('Błąd podczas usuwania oceny: ' + await res.text());
                    }
                } catch (err) {
                    console.error('delete-grade fetch error', err);
                    alert('Błąd sieci podczas usuwania oceny');
                }
            });
        }
    });

    const form = document.getElementById('editGradeForm');
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const studentId = document.getElementById('editStudentId').value;
            const gradeIndex = Number(document.getElementById('editGradeIndex').value);
            const przedmiot = document.getElementById('editPrzedmiot').value.trim();
            const ocena = Number(document.getElementById('editOcena').value);

            if (!studentId || Number.isNaN(gradeIndex) || !przedmiot || Number.isNaN(ocena)) {
                alert("Uzupełnij poprawnie wszystkie pola!");
                return;
            }

            try {
                const res = await fetch('/edit-grade', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ studentId, gradeIndex, przedmiot, ocena })
                });

                if (res.ok) {
                    window.location.reload();
                } else {
                    console.error('modal edit-grade server:', await res.text());
                    alert('Błąd podczas edytowania oceny: ' + await res.text());
                }
            } catch (err) {
                console.error('modal edit-grade fetch err', err);
                alert('Błąd sieci podczas edycji oceny');
            }
        });
    }
});
