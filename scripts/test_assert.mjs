const fs = require('fs');
const path = require('path');

function findTestFiles(folderPath) {
    const files = fs.readdirSync(folderPath);

    let testFiles = [];

    files.forEach(file => {
        const filePath = path.join(folderPath, file);
        const stat = fs.statSync(filePath);

        if (stat.isDirectory()) {
            testFiles = testFiles.concat(findTestFiles(filePath));
        } else if (file.endsWith('.test.ts')) {
            testFiles.push(filePath);
        }
    });

    return testFiles;
}

const folderPath = path.join(__dirname, 'src');
const testFiles = findTestFiles(folderPath);

console.log(testFiles);