const express = require('express');
const path = require('path');
const crypto = require('crypto');
const fs = require('fs');

const app = express();
const distDir = path.join(__dirname, 'dist', 'angular-csp-nonce-b', 'browser');

// Serve static files without auto-serving index.html (we need to inject a nonce)
app.use(express.static(distDir, { index: false }));

// Fallback handler for all routes (don’t use '*' on Express 5)
app.use((req, res) => {
  // Per-request random nonce
  const nonce = crypto.randomBytes(16).toString('base64');

  // Tight CSP: Angular runtime styles are allowed via this nonce
  const csp = [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}'`,  // no inline scripts; add 'nonce-…' here only if you really need them
    `style-src 'self' 'nonce-${nonce}'`,  // Angular + our DynamicStyleService styles
    "img-src 'self' data:",
    "font-src 'self'",
    "object-src 'none'",
    "base-uri 'self'",
    "frame-ancestors 'none'"
  ].join('; ');

  res.setHeader('Content-Security-Policy', csp);

  const indexPath = path.join(distDir, 'index.html');
  let html = fs.readFileSync(indexPath, 'utf8');
  // Stamp the same nonce into all placeholders (meta tag)
  html = html.replace(/__NONCE__/g, nonce);

  res.status(200).send(html);
});

const port = process.env.PORT || 4000;
app.listen(port, () => {
  console.log(`Serving on http://localhost:${port} with CSP nonces (Option B)`);
});
