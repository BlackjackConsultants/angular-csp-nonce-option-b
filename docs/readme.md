# Example Readme
Option B from chatgpt answer which does not add nonce in server side.   The nonce is added dynamically later on the client.

## Running the application
1. to build, from the root folder, type ```npm run watch```.
2. to run, type ```npm run start``` 
3. Notice in the console that you see the url that the server is serving. ```http://localhost:4000```

## References
> Note: This is option be from the answer chatgpt gave below. this option allows the nonce to be added in client as opposed to server.
> 
The following chatgpt reply helped build this example
```https://chatgpt.com/share/68c1bec5-173c-8003-865c-c4d3956a6c8c```
Go to the second prompt.   This is the part that was used by this example.  Make sure though that you install version 4 of express not version 5 or it will not work.
```bash
npm i express@4
```

## Changing application
When you change the code, run ```npm run build```

## The Server Side
Make sure to install express version 4.  The latest version wont work.
```
npm i express@4
```
after installing the server side package, create the server.js file
```javascript
const express = require('express');
const path = require('path');
const crypto = require('crypto');
const fs = require('fs');

const app = express();
const distDir = path.join(__dirname, 'dist', 'angular-csp-nonce', 'browser');

// Serve static files without auto-index so we can inject nonce on "*"
app.use(express.static(distDir, { index: false }));

app.get('*', (req, res) => {
  // 128-bit (16-byte) cryptographically strong nonce, base64-encoded
  const nonce = crypto.randomBytes(16).toString('base64');

  // Strict CSP that allows styles only if they carry this nonce
  // If you don't use inline scripts, 'script-src' can be just 'self'
  const csp = [
    "default-src 'self'",
    "script-src 'self'",
    `style-src 'self' 'nonce-${nonce}'`,
    "img-src 'self' data:",
    "font-src 'self'",
    "object-src 'none'",
    "base-uri 'self'",
    "frame-ancestors 'none'"
  ].join('; ');

  res.setHeader('Content-Security-Policy', csp);

  const indexPath = path.join(distDir, 'index.html');
  let html = fs.readFileSync(indexPath, 'utf8');
  // Stamp the same nonce into all placeholders
  html = html.replace(/__NONCE__/g, nonce);

  res.status(200).send(html);
});

const port = process.env.PORT || 4000;
app.listen(port, () => {
  console.log(`Serving on http://localhost:${port} with CSP nonces`);
});

```
To run the server side code and serve the page run
```javascript
node server.js
```
Notice in the console that you see the url that the server is serving.
```bash
http://localhost:4000
```
## ngCspNonce attribute

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>Angular CSP Nonce Demo</title>
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <!-- (optional) Store it in a meta in case you want to read it later -->
    <meta name="csp-nonce" content="__NONCE__" />
  </head>
  <body>
    <!-- Option A: Angular picks up the nonce from here -->
    <app-root ngCspNonce="__NONCE__"></app-root>
  </body>
</html>
```
The code snippet ngCspNonce in your index.html file refers to a security feature used in Angular applications to support Content Security Policy (CSP). CSP is a browser security mechanism that helps prevent cross-site scripting (XSS) and other code injection attacks by restricting the sources from which scripts can be loaded and executed.

Angular uses a nonce (a random, single-use token) to mark scripts as safe to execute. When you set a nonce value (often as an attribute like ngCspNonce="{{nonce}}"), Angular will attach this nonce to dynamically generated <script> tags, allowing them to run even under strict CSP rules. This is especially important in environments where inline scripts are blocked by default.

In summary, ngCspNonce is a mechanism for integrating Angular with CSP by ensuring that Angular-generated scripts are allowed to execute, improving your application's security posture. If you see this in your index.html, it means your project is likely configured to work with CSP, and you should ensure the nonce value is securely generated and passed to Angular during runtime.