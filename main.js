import { getData } from './.ntwk/store.js';
import http from 'http';
import fs from 'fs';
import Moustache from 'mustache';

console.log("Hello via Bun!");

/*
implement the web server part, make it so that the network requests files it does not have yet
*/

const requestListener = async (req, res) => {
  const { method, url } = req;
  const parts = url.split('/');
  console.log('Received request:', method, url);
  console.log('parts:', parts);

  if (parts[1] === 'data') {
    const filename = parts[2];
    const file = await getData(filename);
    console.log('returning: ', file);
    res.end(file);
    return;
  }

  if (url === '/state') {
    const res = await fetch(`http://localhost:8888/state`);
    console.log(await res.text());
    return;
  }

  if (fs.existsSync(`./.ntwk/named/${parts[1]}`)) {
    console.log('named file found:', parts[1]);
    const filename = fs.readFileSync(`./.ntwk/named/${parts[1]}`);
    console.log('filename:', filename);
    let projectObject = JSON.parse(await getData(filename));
    projectObject['css'] = "data/" + projectObject['css'];
    projectObject['js'] = "data/" + projectObject['js'];
    console.log('projectObject:', projectObject);
    const htmlTemplate = await getData(projectObject['html']);
    console.log('htmlTemplate:', htmlTemplate)
    const html = Moustache.render(htmlTemplate, projectObject);
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(html);
    console.log('html:', html);
    return;
  }

  res.end('File not found');
}

const server = http.createServer(requestListener);

server.listen(8080);
console.log('Server is listening on port 8080');