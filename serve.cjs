// Run with Node.js: node serve.cjs
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const root = __dirname;
const api = require('./api.cjs').createAPI(process.env.CAPMONEY_DATA_DIR || path.resolve(root,'../../work/capmoney-data'));
const types = {'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.json':'application/json','.svg':'image/svg+xml','.png':'image/png','.wasm':'application/wasm','.traineddata':'application/octet-stream','.ttf':'font/ttf'};
http.createServer(async (request, response) => {
  const url = new URL(request.url, 'http://localhost');
  const allowedHost = process.env.PUBLIC_ORIGIN ? new URL(process.env.PUBLIC_ORIGIN).host : null;
  if (!['127.0.0.1','localhost','[::1]'].includes((request.headers.host||'').replace(/:\d+$/,'')) && request.headers.host !== allowedHost) { response.writeHead(403).end(); return; }
  response.setHeader('X-Content-Type-Options','nosniff');
  response.setHeader('Referrer-Policy','no-referrer');
  if(await api.handle(request,response,url))return;
  let pathname;
  try { pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname); }
  catch { response.writeHead(400).end(); return; }
  const file = path.resolve(root, '.' + (pathname === '/' ? '/index.html' : pathname));
  if (!file.startsWith(root + path.sep) || !types[path.extname(file)]) { response.writeHead(403).end(); return; }
  fs.readFile(file, (error, data) => {
    if (error) { response.writeHead(404).end('Not found'); return; }
    response.writeHead(200, {'Content-Type':types[path.extname(file)],'Cache-Control':'no-cache'});
    response.end(data);
  });
}).listen(Number(process.env.PORT || 8081), process.env.HOST || '127.0.0.1', () => console.log('CapMoney: http://127.0.0.1:'+(process.env.PORT || 8081)));
