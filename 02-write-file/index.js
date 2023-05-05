const path = require('path');
const fs = require('fs');
const readline = require('readline');
const { stdout, stdin } = process;


const filename = 'console.txt';
const fullPath = path.join(__dirname, filename);
const writableStream = fs.createWriteStream(fullPath, { flags: 'a+' });

const rl = readline.createInterface(stdin);

stdout.write('Hi! Write something meaningful... Or write `exit` to finish.\n');

rl.on('line', (input) => {
  if (input.trim() === 'exit') {
    process.exit(0);
  }

  writableStream.write(`${input}\n`);
});


process.on('SIGINT', () => {
  process.exit(0);
});

process.on('exit', (code) => {
  rl.close();
  writableStream.close();

  stdout.write('Have a nice day!');
});