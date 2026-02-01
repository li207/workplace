// Simple test server without dependencies
const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const port = 3000;
const publicDir = path.join(__dirname, 'public');

// Simple MIME type mapping
const mimeTypes = {
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.json': 'application/json'
};

const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url);
  let pathname = parsedUrl.pathname;
  
  // Default to static dashboard for root path
  if (pathname === '/') {
    pathname = '/static-dashboard.html';
  }
  
  const filePath = path.join(publicDir, pathname);
  const ext = path.extname(filePath);
  const mimeType = mimeTypes[ext] || 'text/plain';
  
  // Check if file exists and is within public directory
  if (!filePath.startsWith(publicDir)) {
    res.writeHead(403, { 'Content-Type': 'text/plain' });
    res.end('Forbidden');
    return;
  }
  
  fs.readFile(filePath, (err, data) => {
    if (err) {
      if (err.code === 'ENOENT') {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('File not found');
      } else {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('Internal server error');
      }
      return;
    }
    
    res.writeHead(200, { 'Content-Type': mimeType });
    res.end(data);
  });
});

server.listen(port, () => {
  console.log(`🌐 Simple server running at http://localhost:${port}`);
  console.log(`📁 Serving from: ${publicDir}`);
});

// Handle process termination
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down server...');
  server.close(() => {
    console.log('✅ Server stopped');
    process.exit(0);
  });
});