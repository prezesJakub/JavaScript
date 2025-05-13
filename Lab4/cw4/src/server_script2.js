/**
 * Moduły wbudowane Node.js:
 * - http: tworzenie serwera
 * - fs: operacje na plikach
 * - url: parsowanie adresów URL
 * - querystring: parsowanie danych z formularzy
 */
const http = require('http');
const fs = require('fs');
const { URL } = require('url');
const querystring = require('querystring');

const PORT = 8000;
const FILE_PATH = __dirname + '/entries.txt';

/**
 * Generuje pełną stronę HTML na podstawie wpisów.
 * @param {string} entriesHtml - HTML zawierający wszystkie wpisy.
 * @returns {string} - Gotowy dokument HTML jako tekst.
 * @author Jakub Zając <jakubtomaszkrzysztof@gmail.com>
 */
function renderPage(entriesHtml) {
    return `
        <!DOCTYPE html>
        <html lang="pl">
        <head>
            <meta charset="UTF-8">
            <title>Księga Gości</title>
        </head>
        <body>
            <h1>Księga Gości</h1>
            <h2>Poprzednie wpisy</h2>
            <div>${entriesHtml}</div>
            <hr>
            <h2>Nowy wpis</h2>
            <form method="POST" action="/">
                <label>Imię i nazwisko:<br>
                    <input type="text" name="name" required>
                </label><br><br>
                <label>Treść wpisu:<br>
                    <textarea name="message" rows="4" cols="50" required></textarea>
                </label><br><br>
                <input type="submit" value="Dodaj wpis">
            </form>
        </body>
        </html>`;
}

/**
 * Tworzy serwer HTTP, który obsługuje wyświetlanie oraz zapisywanie wpisów do księgi gości.
 * @param {http.IncomingMessage} req - Żądanie HTTP.
 * @param {http.ServerResponse} res - Odpowiedź HTTP.
 */
const server = http.createServer((req, res) => {
    const url = new URL(req.url, `http://${req.headers.host}`);

    if(req.method === 'GET' && url.pathname === '/') {
        fs.readFile(FILE_PATH, 'utf-8', (err, data) => {
            const entriesHtml = err || !data || !data.trim()
                ? '<p>Brak wpisów.</p>'
                : data.split('\n').map(entry => `<p>${entry}</p>`).join('');
            res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
            res.end(renderPage(entriesHtml));
        });
    }
    else if(req.method === 'POST' && url.pathname === '/') {
        let body = '';
        req.on('data', chunk => body += chunk.toString());
        req.on('end', () => {
            const { name, message } = querystring.parse(body);
            const entry = `${new Date().toLocaleString()} - ${name}: ${message.replace(/\r?\n/g, ' ')}`;
            fs.appendFile(FILE_PATH, entry + '\n', err => {
                if (err) {
                    res.writeHead(500, { 'Content-Type': 'text/plain' });
                    return res.end('Błąd zapisu danych');
                }
                res.writeHead(302, { Location: '/' });
                res.end();
            });
        });
    }
    else {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('Nie znaleziono strony.');
    }
});

/**
 * Uruchomienie serwera i nasłuchiwanie na porcie 8000.
 */
server.listen(PORT, () => {
    console.log(`Serwer działa na http://localhost:${PORT}/`);
});