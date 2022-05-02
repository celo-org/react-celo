const { readFileSync, writeFileSync } = require('fs');
const { resolve } = require('path');
const { argv } = require('process');

(function () {
  const [fileName, dirName] = argv.slice(2);

  if (!fileName.endsWith('.json')) {
    throw new Error(`fileName must end with .json (Got ${fileName})`);
  }

  const filePath = resolve(fileName);
  const dir = resolve(dirName);
  const outPath = resolve(dir, fileName.split('.json')[0] + '.ts');

  const content = readFileSync(filePath);

  writeFileSync(
    outPath,
    `export default ${content.toString().trimEnd()} as const;\n`
  );
})();
