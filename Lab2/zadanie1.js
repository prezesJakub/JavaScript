function testPrompt() {
    for (let i = 0; i < 4; i++) {
        let input = window.prompt("Podaj wartość (" + (i + 1) + "/4):", "");

        if(input === null) {
            console.log("Anulowano operację: null");
        } else if(input === "") {
            console.log("Pusta wartość: string");
        } else {
            console.log(`${input}: ${typeof input}`);
        }
    }
}

function funkcja_zwrotna() {
    let form = document.forms[0];
    let textField = form.elements["pole_tekstowe"].value;
    let numberField = parseFloat(form.elements["pole_liczbowe"].value) || 0;

    console.log(`Wczytana wartość z pola tekstowego: ${textField} | typ: ${typeof textField}`);
    console.log(`Wczytana wartość z pola liczbowego: ${numberField} | typ: ${typeof numberField}`);
}