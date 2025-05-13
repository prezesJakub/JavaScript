const fs = require('node:fs');
const { argv, stdin, stdout } = require('node:process');
const path = require('node:path');
const { exec } = require('node:child_process');

const COUNTER_FILE = path.join(__dirname, 'run_count.txt');

function runSync() {
    try {
        let count = 0;
        if (fs.existsSync(COUNTER_FILE)) {
            const data = fs.readFileSync(COUNTER_FILE, 'utf8');
            count = parseInt(data) || 0;
        }
        count++;
        fs.writeFileSync(COUNTER_FILE, count.toString());
        console.log(`Liczba uruchomień: ${count}`);
    } catch(err) {
        console.error('Błąd (sync):', err.message);
    }
}

function runAsync() {
    fs.readFile(COUNTER_FILE, 'utf8', (err, data) => {
        let count = 0;
        if (!err && data) {
            count = parseInt(data) || 0;
        }
        count++;
        fs.writeFile(COUNTER_FILE, count.toString(), (err) => {
            if(err) {
                console.error('Błąd (async):', err.message);
            } else {
                console.log(`Liczba uruchomień: ${count}`);
            }
        });
    });
}

function runInteractive() {
    console.log('Wprowadź komendy - naciśnięcie Ctrl+D kończy wprowadzanie danych');

    let input = '';
    stdin.setEncoding('utf8');

    stdin.on('data', (chunk) => {
        input += chunk;
    });

    stdin.on('end', () => {
        const commands = input.trim().split('\n');
        for (const cmd of commands) {
            exec(cmd, (err, stdout, stderr) => {
                if(err) {
                    console.error(`Błąd przy uruchamianiu "${cmd}":`, stderr.trim());
                } else {
                    console.log(stdout.trim());
                }
            });
        }
    });
}

if(argv.includes('--sync')) {
    runSync();
} else if(argv.includes('--async')) {
    runAsync();
} else {
    runInteractive();
}