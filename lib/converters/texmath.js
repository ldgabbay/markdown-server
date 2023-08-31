'use strict';

const child_process = require('node:child_process');
const stream = require('node:stream');


async function convert(input) {
  const tex = `
    \\documentclass[preview,border=1pt]{standalone}
    \\usepackage{amsmath}
    \\usepackage{amssymb}
    \\usepackage{amsfonts}
    \\begin{document}
    \\begin{equation*}
    ${input}
    \\end{equation*}
    \\end{document}
  `;

  return new Promise((resolve, reject) => {
    let child = child_process.exec(`${__dirname}/../../etc/tex2svg.sh`, (error, stdout, stderr) => {
      if (error === null) {
        resolve(stdout);
      } else {
        reject(error);
      }
    });

    let stdin = new stream.Readable();
    stdin.push(tex);  // Add data to the internal queue for users of the stream to consume
    stdin.push(null);   // Signals the end of the stream (EOF)
    stdin.pipe(child.stdin);
  });
}

module.exports = {
  typeKey: 'texmath',
  convert,
  contentType: 'image/svg+xml',
};
