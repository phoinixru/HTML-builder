
const path = require('path');
const { readdir, rm, mkdir, copyFile } = require('fs/promises');

const dirPath = path.join(__dirname, 'files');
const dirCopyPath = path.join(__dirname, 'files-copy');

async function copyDir(from, to) {
  await mkdir(to, { recursive: true });

  const files = await readdir(from, { withFileTypes: true });

  for (const file of files) {
    const filePath = path.join(from, file.name);
    const fileCopyPath = path.join(to, file.name);

    if (file.isDirectory()) {
      await copyDir(filePath, fileCopyPath);
    } else {
      await copyFile(filePath, fileCopyPath);
    }
  }
}

rm(dirCopyPath, { recursive: true, force: true })
  .catch(console.log)
  .finally(() => {
    copyDir(dirPath, dirCopyPath);
  });