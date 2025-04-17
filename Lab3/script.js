document.addEventListener("DOMContentLoaded", () => {
    const setBtn = document.getElementById("set");
    const delBtn = document.getElementById("delete");
    const addBtn = document.getElementById("add");

    const body = document.body;
    const main = document.getElementById("main");

    const styledElements = [
        document.getElementById("header"),
        document.getElementById("nav"),
        document.getElementById("aside"),
        main,
        document.getElementById("footer"),
    ];

    const paragraphs = [
        "Natenczas Wojski chwycił na taśmie przypięty\nSwój róg bawoli, długi, cętkowany, kręty\nJak wąż boa, oburącz do ust go przycisnął,\nWzdął policzki jak banię, w oczach krwią zabłysnął,\nZasunął wpół powieki, wciągnął w głąb pół brzucha\nI do płuc wysłał z niego cały zapas ducha,\nI zagrał: róg jak wicher, wirowatym dechem\nNiesie w puszczę muzykę i podwaja echem.",
    "Umilkli strzelcy, stali szczwacze zadziwieni\nMocą, czystością, dziwną harmoniją pieni.\nStarzec cały kunszt, którym niegdyś w lasach słynął,\nJeszcze raz przed uszami myśliwców rozwinął;\nNapełnił wnet, ożywił knieje i dąbrowy,\nJakby psiarnię w nie wpuścił i rozpoczął łowy.",
    "Bo w graniu była łowów historyja krótka:\nZrazu odzew dźwięczący, rześki: to pobudka;\nPotem jęki po jękach skomlą: to psów granie;\nA gdzieniegdzie ton twardszy jak grzmot: to strzelanie."
    ];

    let currentParagraph = 0;

    setBtn.addEventListener("click", () => {
        document.querySelectorAll("*").forEach(el => {
            el.style.boxSizing = "border-box";
            el.style.margin = "0";
        });

        body.style.fontFamily = '"Times New Roman", serif';
        body.style.margin = "20px";

        document.querySelectorAll("h1, h2").forEach(h => {
            h.style.fontWeight = "bold";
        });

        styledElements.forEach(el => {
            el.classList.add("azure", "bordered");
            el.style.marginBottom = "20px";
        });

        main.style.width = "600px";

        document.getElementById("nav").style.width = "200px";
        document.getElementById("nav").style.marginBottom = "10px";
        document.getElementById("nav").style.display = "inline-block";
        document.getElementById("nav").style.verticalAlign = "top";

        document.getElementById("aside").style.width = "300px";
        document.getElementById("aside").style.float = "right";
        document.getElementById("aside").style.verticalAlign = "top";

        document.getElementById("footer").style.width = "100%";
        document.getElementById("footer").style.clear = "both";

        document.querySelectorAll("a").forEach(link => {
            link.style.color = "blue";
        });

        document.querySelectorAll("nav ul, aside ul").forEach(ul => {
            ul.style.listStylePosition = "inside";
            ul.style.paddingLeft = "15px";
        });

        document.querySelectorAll("nav li").forEach(li => {
            li.style.margin = "5px 0";
        });
    });

    delBtn.addEventListener("click", () => {
        document.querySelectorAll("*").forEach(el => {
            el.removeAttribute("style");
            el.classList.remove("azure", "bordered");
        });
    });

    addBtn.addEventListener("click", () => {
        if(currentParagraph >= paragraphs.length) {
            addBtn.disabled = true;
            return;
        }

        const blockquote = document.createElement("blockquote");
        blockquote.textContent = paragraphs[currentParagraph++];
        blockquote.style.fontStyle = "italic";
        blockquote.style.whiteSpace = "pre-line";
        blockquote.style.lineHeight = "1.5";
        blockquote.style.textAlign = "left";
        blockquote.style.marginLeft = "20px";
        blockquote.style.padding = "10px";

        main.appendChild(blockquote);

        if(currentParagraph >= paragraphs.length) {
            addBtn.disabled = true;
        }
    });
});