const express = require('express');
const http = require('http');

const app = express();

app.use((req, res, next) => {
  if (!req.secure) {
    return res.redirect(`https://${req.headers.host}${req.url}`);
  }
  next();
});

const httpServer = http.createServer(app);

httpServer.listen(80, () => {
  console.log('HTTP Server running on port 80 and redirecting to HTTPS');
});
