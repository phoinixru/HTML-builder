const path = require('path');
const fs = require('fs');
const { stdout } = process;

const filename = 'text.txt';
const fullPath = path.join(__dirname, filename);

const readableStream = fs.createReadStream(fullPath);

readableStream.on('data', (chunk) => {
  stdout.write(chunk);
});