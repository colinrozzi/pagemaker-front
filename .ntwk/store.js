import fs from 'fs';
import { neighborInfo } from './info.js';

export async function getData(filename) {
  if (fs.existsSync(`./.ntwk/data/${filename}`)) {
    return fs.readFileSync(`./.ntwk/data/${filename}`).toString();
  } else {
    const response = await fetch(`http://localhost:${neighborInfo.port}/data/${filename}`);
    const file = await response.text();
    fs.writeFileSync(`./.ntwk/data/${filename}`, file);
    return file;
  }
}