#!/usr/bin/env node

const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');
const execSync = require('child_process').execSync;

const minimist = require('minimist');


function wrap(pathElements, body) {
  var pathElements = pathElements.slice(1);
  if (pathElements[pathElements.length-1] === '') {
    pathElements = pathElements.slice(0, -1);
  }
  
  // color #333 comes from markdown.css body
  const homeIcon = `<div class="icon baseline"><svg viewBox="0 0 24 24"><path fill="#333" d="M10,20V14H14V20H19V12H22L12,3L2,12H5V20H10Z" /></svg></div>`;
  // color #4183C4 comes from markdown.css a
  const linkHomeIcon = `<div class="icon baseline"><svg viewBox="0 0 24 24"><path fill="#4183C4" d="M10,20V14H14V20H19V12H22L12,3L2,12H5V20H10Z" /></svg></div>`;
  var crumbBody;
  if (pathElements.length === 0) {
    crumbBody = homeIcon
  } else {
    crumbBody = `<a href="/">${linkHomeIcon}</a>`;
    var url = "/";
    pathElements.slice(0, -1).forEach(function(pathElement) {
      url += `${encodeURIComponent(pathElement)}/`
      crumbBody += ` &rsaquo; <a href="${url}">${pathElement}</a>`;
    });
    crumbBody += ` &rsaquo; ${pathElements[pathElements.length-1]}`;
  }

  var localCss = '';
  if (fs.existsSync(path.join(root, ...pathElements.slice(0,-1), 'local.css'))) {
    localCss = '\n    <link rel="stylesheet" href="local.css">'
  }

  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <link rel="stylesheet" href="/markdown.css">
    <link rel="stylesheet" href="/highlight.js/9.12.0/styles/github.min.css">${localCss}
    <script src="/highlight.js/9.12.0/highlight.min.js"></script>
    <script src="/highlight.js/9.12.0/languages/swift.min.js"></script>
</head>
<body>
<div class="crumbs">${crumbBody}</div>
${body}
<script>hljs.initHighlightingOnLoad();</script>
</body>
</html>`;
}


// ⬑⬑⬑⬑⬑⬑⬑

const extensionToMimeType = {
  ".aac": "audio/aac",
  ".abw": "application/x-abiword",
  ".arc": "application/octet-stream",
  ".avi": "video/x-msvideo",
  ".azw": "application/vnd.amazon.ebook",
  ".bin": "application/octet-stream",
  ".bz": "application/x-bzip",
  ".bz2": "application/x-bzip2",
  ".csh": "application/x-csh",
  // ".css": "text/css",
  ".csv": "text/csv",
  ".doc": "application/msword",
  ".eot": "application/vnd.ms-fontobject",
  ".epub": "application/epub+zip",
  ".gif": "image/gif",
  ".htm": "text/html",
  // ".html": "text/html",
  ".ico": "image/x-icon",
  ".ics": "text/calendar",
  ".jar": "application/java-archive",
  ".jpeg": "image/jpeg",
  ".jpg": "image/jpeg",
  // ".js": "application/javascript",
  ".json": "application/json",
  ".mid": "audio/midi",
  ".midi": "audio/midi",
  ".mpeg": "video/mpeg",
  ".mpkg": "application/vnd.apple.installer+xml",
  ".odp": "application/vnd.oasis.opendocument.presentation",
  ".ods": "application/vnd.oasis.opendocument.spreadsheet",
  ".odt": "application/vnd.oasis.opendocument.text",
  ".oga": "audio/ogg",
  ".ogv": "video/ogg",
  ".ogx": "application/ogg",
  ".otf": "font/otf",
  ".png": "image/png",
  ".pdf": "application/pdf",
  ".ppt": "application/vnd.ms-powerpoint",
  ".rar": "application/x-rar-compressed",
  ".rtf": "application/rtf",
  ".sh": "application/x-sh",
  ".svg": "image/svg+xml",
  ".swf": "application/x-shockwave-flash",
  ".tar": "application/x-tar",
  ".tif": "image/tiff",
  ".tiff": "image/tiff",
  ".ts": "application/typescript",
  ".ttf": "font/ttf",
  ".vsd": "application/vnd.visio",
  ".wav": "audio/x-wav",
  ".weba": "audio/webm",
  ".webm": "video/webm",
  ".webp": "image/webp",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".xhtml": "application/xhtml+xml",
  ".xls": "application/vnd.ms-excel",
  ".xlsx": "application/vnd.ms-excel",
  ".xml": "application/xml",
  ".xul": "application/vnd.mozilla.xul+xml",
  ".zip": "application/zip",
  ".3gp": "video/3gpp",
  ".3g2": "video/3gpp2",
  ".7z": "application/x-7z-compressed",

  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.todo': 'text/plain; charset=utf-8'
};


// https://nodejs.org/dist/latest-v6.x/docs/api/http.html

const args = minimist(process.argv.slice(2));

const root = path.resolve(process.cwd(), args.r ? args.r : args.root ? args.root : '.');
const port = Number.parseInt(args.p ? args.p : args.port ? args.port : '8080');


const requestHandler = (request, response) => {
  console.log(request.method, request.url);

  if (request.method === 'GET') {
    const parsedURL = url.parse(request.url);
    const pathElements = parsedURL.pathname.split('/').map(x => decodeURIComponent(x));
    let fsPath = path.join(root, ...pathElements);

    if (!fs.existsSync(fsPath)) {
      // wasn't found in root, try in "./static/"
      fsPath = path.join(__dirname, "static", ...pathElements);
      if (!fs.existsSync(fsPath)) {
        response.statusCode = 404;
        response.end(); // `File ${parsedURL.pathname} not found!`
        return;
      }
    }

    const stat = fs.statSync(fsPath);

    response.setHeader('Access-Control-Allow-Origin', '*');


    //=== Directory

    if (stat.isDirectory()) {

      if (!parsedURL.pathname.endsWith('/')) {
        response.statusCode = 307;
        parsedURL.pathname = parsedURL.pathname + '/';
        response.setHeader('Location', url.format(parsedURL));
        response.end();
        return;
      }

      const entries = fs.readdirSync(fsPath);

      // for (let indexPath of ['index.md', 'index.html', 'index.htm']) {
      //   if (fs.existsSync(path.join(fsPath, indexPath))) {
      //     response.statusCode = 307;
      //     parsedURL.pathname = parsedURL.pathname + indexPath;
      //     response.setHeader('Location', url.format(parsedURL));
      //     response.end();
      //     return;
      //   }
      // }

      const files = [];
      const dirs = [];
      for (let entry of entries) {
        let entryPath = path.join(fsPath, entry)
        const stat = fs.statSync(entryPath);
        if (stat.isDirectory())
          dirs.push(entry);
        else if (stat.isFile())
          files.push(entry);
      }

      const chunks = [];
      chunks.push("<table><tbody>")
      for (let dir of dirs) {
        chunks.push(`<tr><td><b><a href=\"${encodeURIComponent(dir)}/\">${dir}/</a></b></td></tr>`);
      }
      for (let file of files) {
        chunks.push(`<tr><td><a href=\"${encodeURIComponent(file)}\">${file}</a></td></tr>`);
      }
      chunks.push("</tbody></table>");

      response.setHeader('Content-Type', 'text/html');
      response.end(wrap(pathElements, chunks.join('')));
      return;
    }


    //=== Markdown file

    if (parsedURL.pathname.endsWith('.md')) {
      response.statusCode = 200;
      response.setHeader('Content-Type', 'text/html');
      const html = execSync(`cmark-gfm -e table -e strikethrough -e autolink -e tagfilter "${fsPath}"`);
      response.end(wrap(pathElements, html));
      return;
    }


    //=== Static file

    {
      response.statusCode = 200;

      const suffixStart = parsedURL.pathname.lastIndexOf('.');
      if (suffixStart != -1) {
        const suffix = parsedURL.pathname.slice(suffixStart);
        if (extensionToMimeType[suffix]) {
          response.setHeader('Content-Type', extensionToMimeType[suffix]);
        }
      }

      const readStream = fs.createReadStream(fsPath);
      readStream.pipe(response);
      // response.end();
    }
  }
};

const server = http.createServer(requestHandler);

server.listen(port, (err) => {
  if (err) {
    return console.log('something bad happened', err)
  }

  console.log(`server is listening on ${port}`)
});
