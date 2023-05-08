const path = require('path');
const { readdir, readFile, writeFile, rm, mkdir, copyFile } = require('fs/promises');

const DEFAULT_TEMPLATE_FILE = 'template.html';
const DEFAULT_ASSEST_FOLDER = 'assets';
const DEFAULT_DIST_FOLDER = 'project-dist';
const DEFAULT_COMPONENTS_FOLDER = 'components';
const DEFAULT_STYLES_FOLDER = 'styles';

const DEFAULT_STYLES_FILE = 'style.css';
const DEFAULT_INDEX_FILE = 'index.html';

const absolutePath = (...paths) => path.join(__dirname, ...paths);


async function loadFiles({ srcFolder, fileNames = [], fileExt = 'css' }) {
  const files = await readdir(srcFolder, { withFileTypes: true });
  const filesToLoad = [];
  const names = [];

  for (const file of files) {
    const { name } = file;
    let { name: fileName, ext } = path.parse(name);
    ext = ext.slice(1);

    if (
      file.isDirectory()
      || ext !== fileExt
      || (fileNames.length && !fileNames.includes(fileName))
    ) {
      continue;
    }

    filesToLoad.push(
      readFile(path.join(srcFolder, name), { encoding: 'utf8' })
    );
    names.push(fileName);
  }

  const contents = await Promise.all(filesToLoad);

  return Object.fromEntries(
    names.map((key, i) => [key, contents[i]])
  );
}


async function mergeStyles(srcFolder, destFile) {
  const stylesFolder = absolutePath(srcFolder);
  const outputFile = absolutePath(DEFAULT_DIST_FOLDER, destFile);

  const styleFiles = await loadFiles({ srcFolder: stylesFolder, ext: 'css' });
  const content = Object.values(styleFiles).join`\n`;

  writeFile(outputFile, content);
}

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

async function removeFolder(folder) {
  return rm(
    absolutePath(folder),
    { recursive: true, force: true }
  ).catch(console.log);
}

async function processTemplate(templateFile, componentsFolder, destFile) {
  const template = await readFile(
    absolutePath(templateFile),
    { encoding: 'utf8' }
  );

  const templateComponents = template.match(/\{\{(.+?)\}\}/g) || [];
  const names = templateComponents.map(name => name.slice(2, -2));
  const components = await loadFiles({
    srcFolder: absolutePath(componentsFolder),
    fileNames: names,
    fileExt: 'html'
  });

  const outputContent = names.reduce((output, name) => {
    return output.replaceAll(`{{${name}}}`, components[name] || '');
  }, template);


  const outputFile = absolutePath(DEFAULT_DIST_FOLDER, destFile);
  writeFile(outputFile, outputContent);
}

async function copyAssets(folderName, distFolder) {
  return copyDir(
    absolutePath(folderName),
    absolutePath(distFolder, folderName)
  );
}

async function buildPage({
  distFolder = DEFAULT_DIST_FOLDER,
  assetsFolder = DEFAULT_ASSEST_FOLDER,
  stylesFolder = DEFAULT_STYLES_FOLDER,
  componentsFolder = DEFAULT_COMPONENTS_FOLDER,
  templateFile = DEFAULT_TEMPLATE_FILE,
  indexFile = DEFAULT_INDEX_FILE,
  stylesFile = DEFAULT_STYLES_FILE
} = {}) {

  await removeFolder(distFolder);
  await copyAssets(assetsFolder, distFolder);
  await processTemplate(templateFile, componentsFolder, indexFile);
  await mergeStyles(stylesFolder, stylesFile);
}

buildPage();