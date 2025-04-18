const studenci = ["Jan Kowalski", "Anna Nowak", "Jerzy Żmuda", "Robert Masłowski"];
const przedmioty = ["Matematyka", "Informatyka", "Fizyka", "Geografia"];

let db;

const request = indexedDB.open("USOSDB", 1);

request.onupgradeneeded = function(event) {
    db = event.target.result;
    if(!db.objectStoreNames.contains("oceny")) {
        const store = db.createObjectStore("oceny", { keyPath: "id", autoIncrement: true });
        store.createIndex("student", "student", {unique: false});
        store.createIndex("przedmiot", "przedmiot", {unique: false});
    }
};

request.onsuccess = function(event) {
    db = event.target.result;
    console.log("IndexedDB gotowy!");
    generujKarty();
};

request.onerror = function(event) {
    pokazKomunikat("Błąd otwierania IndexedDB:", event.target.errorCode);
};

document.getElementById("dodajBtn").addEventListener("click", dodajOcene);
document.getElementById("zmienBtn").addEventListener("click", zmienOcene);
document.getElementById("wyswietlBtn").addEventListener("click", wyswietlOceny);

function dodajOcene() {
    const input = document.getElementById("inputData").value;
    const dane = input.split(",").map(item => item.trim());

    if(dane.length !== 3) {
        pokazKomunikat("Błąd: Wprowadź dane w formacie 'Imię Nazwisko, Przedmiot, Ocena'.");
        return;
    }

    const [student, przedmiot, ocena] = dane;

    if(!studenci.includes(student)) {
        pokazKomunikat(`Błąd: Student ${student} nie istnieje.`);
        return;
    }

    if(!przedmioty.includes(przedmiot)) {
        pokazKomunikat(`Błąd: Przedmiot ${przedmiot} nie istnieje.`);
        return;
    }
    
    if(isNaN(ocena) || ocena < 2 || ocena > 5) {
        pokazKomunikat("Błąd: Ocena musi być liczbą od 2 do 5.");
        return;
    }

    const transaction = db.transaction(["oceny"], "readwrite");
    const store = transaction.objectStore("oceny");
    const request = store.openCursor();

    request.onsuccess = function(event) {
        const cursor = event.target.result;
        if(cursor) {
            if(cursor.value.student === student && cursor.value.przedmiot === przedmiot) {
                pokazKomunikat(`Błąd: Student ${student} ma już ocenę z przedmiotu ${przedmiot}. Możesz ją tylko zmienić.`, "warning");
                return;
            }
            cursor.continue();
        } else {
            const transaction = db.transaction(["oceny"], "readwrite");
            const store = transaction.objectStore("oceny");

            const nowaOcena = {
                student,
                przedmiot,
                ocena: Number(ocena)
            };

            store.add(nowaOcena);
            pokazKomunikat(`Dodano ocenę: ${student} - ${przedmiot}: ${ocena}`, "success");
        }
    };
}

function zmienOcene() {
    const input = document.getElementById("inputData").value;
    const dane = input.split(",").map(item => item.trim());

    if(dane.length !== 3) {
        pokazKomunikat("Błąd: Wprowadź dane w formacie 'Imię Nazwisko, Przedmiot, Nowa Ocena'.");
        return;
    }

    const [student, przedmiot, nowaOcena] = dane;

    if(isNaN(nowaOcena) || nowaOcena < 2 || nowaOcena > 5) {
        pokazKomunikat("Błąd: Ocena musi być liczbą od 2 do 5");
        return;
    }

    const transaction = db.transaction(["oceny"], "readwrite");
    const store = transaction.objectStore("oceny");

    const request = store.openCursor();
    request.onsuccess = function(event) {
        const cursor = event.target.result;
        if(cursor) {
            if(cursor.value.student === student && cursor.value.przedmiot === przedmiot) {
                const updatedRecord = cursor.value;
                updatedRecord.ocena = Number(nowaOcena);
                cursor.update(updatedRecord);
                pokazKomunikat(`Zmieniono ocenę: ${student} - ${przedmiot}: ${nowaOcena}`);
                return;
            }
            cursor.continue();
        } else {
            pokazKomunikat("Błąd: Ocena nie istnieje");
        }
    };
}

function wyswietlOceny() {
    const student = document.getElementById("inputData").value.trim();

    if(!studenci.includes(student)) {
        pokazKomunikat(`Błąd: Student ${student} nie istnieje.`);
        return;
    }

    const transaction = db.transaction(["oceny"], "readonly");
    const store = transaction.objectStore("oceny");
    const request = store.openCursor();

    let oceny = [];

    request.onsuccess = function(event) {
        const cursor = event.target.result;
        if(cursor) {
            if(cursor.value.student === student) {
                oceny.push(`${cursor.value.przedmiot}: ${cursor.value.ocena}`);
            }
            cursor.continue();
        } else {
            if(oceny.length > 0) {
                pokazKomunikat(`Oceny dla ${student}: ${oceny.join(", ")}`, "success");
            } else {
                pokazKomunikat(`Brak ocen dla ${student}`);
            }
        }
    };
}

function pokazKomunikat(tresc, typ = "danger") {
    const komunikatDiv = document.getElementById("komunikat");
    komunikatDiv.innerText = tresc;
    komunikatDiv.className = `alert alert-${typ} mt-3`;
}

function generujKarty() {
    const kontener = document.getElementById("kartyStudenci");
    kontener.innerHTML = "";

    studenci.forEach(student => {
        const karta = document.createElement("div");
        karta.className = "col-md-4 mb-4";

        const transaction = db.transaction(["oceny"], "readonly");
        const store = transaction.objectStore("oceny");
        const request = store.index("student").getAll(student);

        request.onsuccess = function () {
            const ocenyStudenta = request.result;

            const maOceny = ocenyStudenta.length > 0;
            const listaOcen = ocenyStudenta.map(o => `${o.przedmiot}: ${o.ocena}`).join("<br>") || "Brak ocen";

            const kartaHTML = `
                <div class="card ${maOceny ? "" : "bg-secondary text-white"} h-100">
                    <div class="card-header text-center" style="cursor:pointer" data-student="${student}">${student}</div>
                    <div class="card-body text-center">
                        <img src="https://cdn-icons-png.flaticon.com/512/847/847969.png" alt="Student" class="img-fluid" style="max-width: 100px;">
                        <p class="card-text">${listaOcen}</p>
                    </div>
                    <div class="card-footer text-center">${maOceny ? "Student" : "Brak przypisanych przedmiotów"}</div>
                </div>
            `;
            
            karta.innerHTML = kartaHTML;
            kontener.appendChild(karta);

            const header = karta.querySelector(".card-header");
            header.addEventListener("click", () => edytujOceny(student));
        };
    });
}

function edytujOceny(student) {
    const transaction = db.transaction(["oceny"], "readonly");
    const store = transaction.objectStore("oceny");
    const request = store.index("student").getAll(student);

    request.onsuccess = function () {
        const ocenyStudenta = request.result;

        const akcja = prompt(
            `Co chcesz zrobić dla ${student}?\n1. Zmień ocenę\n2. Usuń ocenę\n3. Dodaj nową ocenę`
        );

        if(akcja === "3") {
            const dane = prompt("Podaj dane w formacie: Przedmiot, Ocena: ");
            if(!dane)
                return;

            const [przedmiot, ocenaStr] = dane.split(",").map(s => s.trim());
            const ocena = Number(ocenaStr);

            if(!przedmioty.includes(przedmiot)) {
                alert("Nieznany przedmiot");
                return;
            }

            if(isNaN(ocena) || ocena < 2 || ocena > 5) {
                alert("Błędna ocena");
                return;
            }

            const istnieje = ocenyStudenta.some(o => o.przedmiot === przedmiot);
            if (istnieje) {
                alert("Ocena z tego przedmiotu już istnieje. Użyj opcji edycji");
                return;
            }

            const tx = db.transaction(["oceny"], "readwrite");
            const store = tx.objectStore("oceny");
            store.add({student, przedmiot, ocena});
            pokazKomunikat(`Dodano ocenę: ${przedmiot} - ${ocena}`, "success");
            setTimeout(generujKarty, 300);
            return;
        }

        if(ocenyStudenta.length === 0) {
            alert("Brak ocen do edycji lub usunięcia");
            return;
        }

        const wybor = prompt(
            `Wybierz przedmiot do edycji/usunięcia:\n` +
            ocenyStudenta.map((o, i) => `${i+1}. ${o.przedmiot}: ${o.ocena}`).join("\n")
        );

        const index = parseInt(wybor) - 1;
        if(isNaN(index) || index < 0 || index >= ocenyStudenta.length) {
            alert("Nieprawidłowy wybór");
            return;
        }

        const ocenaDoZmiany = ocenyStudenta[index];

        if(akcja === "1") {
            const nowaOcenaStr = prompt("Podaj nową ocenę (2-5):");
            const nowaOcena = Number(nowaOcenaStr);
            if(isNaN(nowaOcena) || nowaOcena < 2 || nowaOcena > 5) {
                alert("Błędna ocena");
                return;
            }

            const tx = db.transaction(["oceny"], "readwrite");
            const store = tx.objectStore("oceny");
            store.get(ocenaDoZmiany.id).onsuccess = function (e) {
                const record = e.target.result;
                record.ocena = nowaOcena;
                store.put(record);
                pokazKomunikat(`Zmieniono ocenę na ${nowaOcena}`, "success");
                setTimeout(generujKarty, 300);
            };
        } else if(akcja === "2") {
            const tx = db.transaction(["oceny"], "readwrite");
            const store = tx.objectStore("oceny");
            store.delete(ocenaDoZmiany.id);
            pokazKomunikat(`Usunięto ocenę z ${ocenaDoZmiany.przedmiot}`, "warning");
            setTimeout(generujKarty, 300);
        } else {
            alert("Nieznana akcja");
        }
    };
}