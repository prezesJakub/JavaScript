export function sum(x, y) {
    return x+y;
}

export function sum_strings(a) {
    return a.reduce((sum, str) => {
        const match = str.match(/^\d+/);
        return sum + (match ? parseInt(match[0], 10) : 0);
    }, 0);
}

export function digits(s) {
    let oddSum = 0, evenSum = 0;
    for (const char of s) {
        if(/\d/.test(char)) {
            const num = parseInt(char, 10);
            if (num % 2 === 0) evenSum += num;
            else oddSum += num;
        }
    }
    return [oddSum, evenSum];
}

export function letters(s) {
    let lowerCount = 0, upperCount = 0;
    for (const char of s) {
        if(/[a-z]/.test(char)) lowerCount++;
        if(/[A-Z]/.test(char)) upperCount++;
    }
    return [lowerCount, upperCount];
}