import fs from 'fs';

const argv = process.argv.slice(2);

const name = argv[0];
const neighborPort = argv[1];

const response = await fetch(`http://localhost:${neighborPort}/named/${name}`, {
  method: 'POST',
  body: fs.readFileSync(`./named/${name}`)
});

console.log(await response.text());