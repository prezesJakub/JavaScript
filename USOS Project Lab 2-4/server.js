const http = require('http');
const fs = require('fs');
const path = require('path');
const { IncomingForm } = require('formidable');

const PORT = 3000;
const PUBLIC_DIR = path.join(__dirname, 'public');
const UPLOAD_DIR = path.join(__dirname, 'uploads');
const DATA_FILE = path.join(__dirname, 'data', 'students.json');

if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });
if (!fs.existsSync(DATA_FILE)) fs.writeFileSync(DATA_FILE, '[]');

const server = http.createServer((req, res) => {
    if (req.method === 'GET') {
        if (req.url === '/api/students') {
            fs.readFile(DATA_FILE, 'utf8', (err, data) => {
                if (err) {
                    res.writeHead(500);
                    return res.end('Błąd odczytu danych');
                }
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(data);
            });
        }
        else if (req.url.startsWith('/uploads/')) {
            const imgPath = path.join(__dirname, req.url);
            fs.readFile(imgPath, (err, data) => {
                if (err) {
                    res.writeHead(404);
                    return res.end('Nie znaleziono obrazka');
                }
                res.writeHead(200, { 'Content-Type': 'image/jpeg' }); // zakładamy JPG
                res.end(data);
            });
        }
        else if (['.html', '.css', '.js', '.png', '.jpg', '.jpeg', '.gif'].some(ext => req.url.endsWith(ext))) {
            let filePath = req.url === '/' ? '/index.html' : req.url;
            const fullPath = path.join(PUBLIC_DIR, filePath);
            fs.readFile(fullPath, (err, data) => {
                if (err) {
                    res.writeHead(404);
                    return res.end('Nie znaleziono pliku');
                }

                const ext = path.extname(fullPath);
                const contentType = {
                    '.html': 'text/html',
                    '.css': 'text/css',
                    '.js': 'application/javascript'
                }[ext] || 'application/octet-stream';

                res.writeHead(200, { 'Content-Type': contentType });
                res.end(data);
            });
        }
        else {
            res.writeHead(404);
            res.end('Nie znaleziono');
        }
    }
    else if (req.method === 'POST' && req.url === '/add-student') {
        const form = new IncomingForm({ uploadDir: UPLOAD_DIR, keepExtensions: true });

        form.parse(req, (err, fields, files) => {
            if (err) {
                res.writeHead(500);
                return res.end('Błąd przetwarzania formularza');
            }

            const imie = fields.imie?.toString().trim() || '';
            const nazwisko = fields.nazwisko?.toString().trim() || '';
            const file = files.zdjecie;
            let zdjecie = '';

            if (Array.isArray(file)) {
                zdjecie = path.basename(file[0].filepath);
            } else if (file && file.filepath) {
                zdjecie = path.basename(file.filepath);
            }

            if (!imie || !nazwisko || !zdjecie) {
                res.writeHead(400);
                return res.end('Brak wymaganych danych');
            }

            const nowyStudent = {
                imie,
                nazwisko,
                zdjecie,
                oceny: []
            };

            fs.readFile(DATA_FILE, 'utf8', (err, data) => {
                let studenci = [];
                if (!err) {
                    try {
                        studenci = JSON.parse(data);
                        if(!Array.isArray(studenci)) studenci = [];
                    } catch (e) {
                        console.error('Niepoprawny JSON:', e);
                        studenci = [];
                    }
                }

                studenci.push(nowyStudent);

                fs.writeFile(DATA_FILE, JSON.stringify(studenci, null, 2), err => {
                    if(err) {
                        console.error('Błąd zapisu:', err);
                        res.writeHead(500);
                        return res.end('Błąd zapisu danych');
                    }

                    res.writeHead(200, { 'Content-Type': 'text/plain' });
                    res.end('Student dodany');
                });
            });
        });
    }
    else if (req.method === 'POST' && req.url === '/add-grade') {
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', () => {
            const params = new URLSearchParams(body);
            const index = parseInt(params.get('index'), 10);
            const przedmiot = params.get('przedmiot')?.trim();
            const ocena = parseFloat(params.get('ocena'));

            if (isNaN(index) || !przedmiot || isNaN(ocena)) {
                res.writeHead(400);
                return res.end("Nieprawidłowe dane");
            }

            fs.readFile(DATA_FILE, 'utf8', (err, data) => {
                if (err) {
                    res.writeHead(500);
                    return res.end("Błąd odczytu danych");
                }

                let studenci;
                try {
                    studenci = JSON.parse(data);
                } catch (e) {
                    res.writeHead(500);
                    return res.end("Nieprawidłowy format danych");
                }

                if (!studenci[index]) {
                    res.writeHead(404);
                    return res.end("Nie znaleziono studenta");
                }

                studenci[index].oceny.push({ przedmiot, ocena });

                fs.writeFile(DATA_FILE, JSON.stringify(studenci, null, 2), err => {
                    if (err) {
                        res.writeHead(500);
                        return res.end("Błąd zapisu danych");
                    }
                    res.writeHead(200);
                    res.end("Ocena dodana");
                });
            });
        });
    }
    else if(req.method === 'POST' && req.url === '/delete-grade') {
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', () => {
            const params = new URLSearchParams(body);
            const studentIndex = parseInt(params.get('studentIndex'), 10);
            const gradeIndex = parseInt(params.get('gradeIndex'), 10);

            if(isNaN(studentIndex) || isNaN(gradeIndex)) {
                res.writeHead(400);
                return res.end("Nieprawidłowe dane");
            }

            fs.readFile(DATA_FILE, 'utf8', (err, data) => {
                if(err) {
                    res.writeHead(500);
                    return res.end("Błąd odczytu danych");
                }

                let studenci;
                try {
                    studenci = JSON.parse(data);
                } catch (e) {
                    res.writeHead(500);
                    return res.end("Nieprawidłowy format danych");
                }

                if(!studenci[studentIndex] || !studenci[studentIndex].oceny[gradeIndex]) {
                    res.writeHead(404);
                    return res.end("Nie znaleziono oceny");
                }

                studenci[studentIndex].oceny.splice(gradeIndex, 1);

                fs.writeFile(DATA_FILE, JSON.stringify(studenci, null, 2), err => {
                    if(err) {
                        res.writeHead(500);
                        return res.end("Błąd zapisu danych");
                    }
                    res.writeHead(200);
                    res.end("Ocena usunięta");
                });
            });
        });
    }
    else if(req.method === 'POST' && req.url === '/edit-grade') {
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', () => {
            const params = new URLSearchParams(body);
            const studentIndex = parseInt(params.get('studentIndex'), 10);
            const gradeIndex = parseInt(params.get('gradeIndex'), 10);
            const przedmiot = params.get('przedmiot')?.trim();
            const ocena = parseFloat(params.get('ocena'));

            if(isNaN(studentIndex) || isNaN(gradeIndex) || !przedmiot || isNaN(ocena)) {
                res.writeHead(400);
                return res.end("Nieprawidłowe dane");
            }

            fs.readFile(DATA_FILE, 'utf8', (err, data) => {
                if(err) {
                    res.writeHead(500);
                    return res.end("Błąd odczytu danych");
                }

                let studenci;
                try {
                    studenci = JSON.parse(data);
                } catch (e) {
                    res.writeHead(500);
                    return res.end("Nieprawidłowy format danych");
                }

                if(!studenci[studentIndex] || !studenci[studentIndex].oceny[gradeIndex]) {
                    res.writeHead(404);
                    return res.end("Nie znaleziono oceny");
                }

                studenci[studentIndex].oceny[gradeIndex] = { przedmiot, ocena };

                fs.writeFile(DATA_FILE, JSON.stringify(studenci, null, 2), err => {
                    if(err) {
                        res.writeHead(500);
                        return res.end("Błąd zapisu danych");
                    }
                    res.writeHead(200);
                    res.end("Ocena zmodyfikowana");
                });
            });
        });
    }
    else {
        res.writeHead(405);
        res.end('Nieobsługiwana metoda');
    }
});

server.listen(PORT, () => {
    console.log(`Serwer działa na http://localhost:${PORT}`);
});