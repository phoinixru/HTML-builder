const path = require('path');
const { readdir, readFile, writeFile } = require('fs/promises');

const srcFolder = path.join(__dirname, 'styles');
const bundleFile = path.join(__dirname, 'project-dist', 'bundle.css');

async function mergeFiles(srcFolder, destFile, ext = 'css') {
  const files = await readdir(srcFolder, { withFileTypes: true });
  const filesToMerge = [];

  for (const file of files) {
    const { name } = file;
    const fileExt = path.extname(name).slice(1);
    if (file.isDirectory() || fileExt !== ext) {
      continue;
    }

    filesToMerge.push(
      readFile(path.join(srcFolder, name), { encoding: 'utf8' })
    );
  }

  const contents = await Promise.all(filesToMerge);
  
  writeFile(destFile, contents.join`\n`);
}

mergeFiles(srcFolder, bundleFile);