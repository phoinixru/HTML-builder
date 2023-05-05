const path = require('path');
const fs = require('fs');
const { readdir } = require('fs/promises');

const secretFolderPath = path.join(__dirname, 'secret-folder');

const listFiles = async (dirPath) => {
  const files = await readdir(dirPath, { withFileTypes: true });

  for await (const file of files) {
    if (file.isDirectory()) {
      continue;
    }

    const filePath = path.join(secretFolderPath, file.name);
    const { name, ext } = path.parse(filePath);

    fs.stat(filePath, (err, data) => {
      if (err) {
        console.log(err.message);
        process.exit();
      }

      const fileSize = data.size;
      console.log(`${name} - ${ext.slice(1)} - ${fileSize}`);
    });
  }
}


fs.opendir(secretFolderPath, (err) => {
  if (err) {
    console.log(err.message);
    process.exit();
  }

  listFiles(secretFolderPath);
});