const studenci = ["Jan Kowalski", "Anna Nowak", "Jerzy Żmuda"];
const przedmioty = ["Matematyka", "Informatyka", "Fizyka"];

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