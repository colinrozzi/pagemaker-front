import http from 'http';
import { selfInfo, neighborInfo } from './info.js';
import fs from 'fs';

/*
  attempt to connect to other nodes in the network
  add them to the list of known nodes
  whenever state changes, broadcast the change to all other nodes
  listen for incoming connections
*/

// list of other nodes
const peers = [];

// create a server to listen for incoming connections
const server = http.createServer(async (req, res) => {
  const { method, url } = req;
  const parts = url.split('/');

  console.log('Received request:', method, url);

  if (url === '/setupConnection') {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    req.on('end', () => {
      const { host, port } = JSON.parse(body);
      peers.push({ host, port });
      console.log('Added peer:', host, port);
      res.end('Connection established');
    });
    return;
  }

  if (parts[1] === 'connectWith') {
    const host = parts[2];
    const port = parts[3];
    const res = await fetch(`http://${host}:${port}/setupConnection`, {
      method: 'POST',
      body: JSON.stringify(selfInfo),
    });
    if (res.status === 200) {
      peers.push({ host, port });
      console.log('Added peer:', host, port);
    }
    return;
  }

  if (parts[1] === 'statusCheck') {
    const peerhash = parts[2];
    const selfHash = makeDataHash();
  }

  if (parts[1] === 'data') {
    const filename = parts[2];
    if (!fs.existsSync(`./data/${filename}`)) {
      res.end('File not found');
      return;
    }
    const file = fs.readFileSync(`./data/${filename}`);
    res.end(file);
    return;
  }

  if (parts[1] === 'named' && method === 'GET') {
    const filename = parts[2];
    if (!fs.existsSync(`./named/${filename}`)) {
      res.end('File not found');
      return;
    }
    const file = fs.readFileSync(`./named/${filename}`);
    res.end(file);
    return;
  }

  if (parts[1] === 'named' && method === 'POST') {
    const filename = parts[2];
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    req.on('end', () => {
      fs.writeFileSync(`./named/${filename}`, body);
      console.log('Updated named file:', filename);
      res.end('File updated');
    });
    return;
  }

  if (parts[1] === 'state' && method === 'GET') {
    const files = fs.readdirSync('./named');
    const state = {};
    files.forEach(file => {
      state[file] = fs.readFileSync(`./named/${file}`);
    });
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(state));
  }
});

server.listen(selfInfo.port, selfInfo.host, () => {
  console.log('Listening on:', selfInfo.host, selfInfo.port);
});