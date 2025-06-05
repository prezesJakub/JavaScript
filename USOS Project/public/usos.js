function xmlFetch(url, method, xmlBody) {
    return fetch(url, {
        method,
        headers: {
            'Content-Type': 'application/xml'
        },
        body: xmlBody
    });
}

document.addEventListener("DOMContentLoaded", () => {
    const modal = new bootstrap.Modal(document.getElementById('editGradeModal'));

    document.querySelectorAll('.grade-item').forEach(el => {
        el.addEventListener('dragstart', e => {
            e.dataTransfer.setData("text/plain", el.dataset.grade);
        });
    });

    document.querySelectorAll('.card').forEach(card => {
        const studentId = card.dataset.studentId;

        card.addEventListener('dragover', e => {
            if (e.target.closest('.grade-slot')) return;
            e.preventDefault();
        });

        card.addEventListener('drop', async e => {
            if (e.target.closest('.grade-slot')) return;
            e.preventDefault();
            const ocena = e.dataTransfer.getData("text/plain");
            const przedmiot = prompt("Podaj nazwę przedmiotu:");

            if (!przedmiot) return;

            const xml = `
                <grade>
                    <studentId>${studentId}</studentId>
                    <przedmiot>${przedmiot}</przedmiot>
                    <ocena>${ocena}</ocena>
                </grade>
            `;

            const res = await xmlFetch("/add-grade-xml", "POST", xml);
            if (res.ok) {
                window.location.reload();
            } else {
                const errorText = await res.text();
                alert("Błąd dodawania oceny: " + errorText);
            }
        });
    });

    document.querySelectorAll('.grade-slot').forEach(li => {
        li.addEventListener('dragover', e => e.preventDefault());

        li.addEventListener('drop', async e => {
            e.preventDefault();
            const ocena = e.dataTransfer.getData("text/plain");
            const studentId = li.closest('.card').dataset.studentId;
            const gradeIndex = li.dataset.gradeIndex;
            const przedmiot = li.dataset.przedmiot;

            if (!gradeIndex || !przedmiot) {
                alert("Brak danych przedmiotu lub indeksu oceny!");
                return;
            }

            const xml = `
                <grade>
                    <studentId>${studentId}</studentId>
                    <gradeIndex>${gradeIndex}</gradeIndex>
                    <przedmiot>${przedmiot}</przedmiot>
                    <ocena>${ocena}</ocena>
                </grade>
            `;

            const res = await xmlFetch("/edit-grade-xml", "POST", xml);
            if (res.ok) {
                window.location.reload();
            } else {
                const errorText = await res.text();
                alert("Błąd przy zamianie oceny: " + errorText);
            }
        });
    });

    document.querySelectorAll('.grade-slot').forEach(li => {
        li.addEventListener('click', async () => {
            if (!confirm("Usunąć tę ocenę?")) return;

            const studentId = li.closest('.card').dataset.studentId;
            const gradeIndex = li.dataset.gradeIndex;

            const xml = `
                <grade>
                    <studentId>${studentId}</studentId>
                    <gradeIndex>${gradeIndex}</gradeIndex>
                </grade>
            `;

            const res = await xmlFetch("/delete-grade-xml", "POST", xml);
            if (res.ok) {
                window.location.reload();
            } else {
                const errorText = await res.text();
                alert("Błąd podczas usuwania oceny: " + errorText);
            }
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
            const errorText = await res.text();
            alert("Błąd podczas edytowania oceny: " + errorText);
        }
    });
});