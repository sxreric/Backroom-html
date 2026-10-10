import fs from 'node:fs';
import path from 'node:path';
import { unzipSync } from 'fflate';

const archive = path.resolve('backrooms-render-upload.zip');
if (!fs.existsSync(archive)) {
  throw new Error(`找不到 ${archive}`);
}

const files = unzipSync(fs.readFileSync(archive));
for (const [name, data] of Object.entries(files)) {
  const normalized = name.replaceAll('\\', '/');
  if (!normalized || normalized.endsWith('/')) continue;
  if (normalized.startsWith('/') || normalized.split('/').includes('..')) {
    throw new Error(`ZIP contains unsafe path: ${name}`);
  }
  const target = path.resolve(normalized);
  if (!target.startsWith(`${process.cwd()}${path.sep}`) && target !== process.cwd()) {
    throw new Error(`ZIP path escapes project directory: ${name}`);
  }
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, data);
}

console.log(`Unpacked ${Object.keys(files).length} files from ${path.basename(archive)}`);