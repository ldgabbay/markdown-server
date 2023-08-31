'use strict';

const child_process = require('node:child_process');
const stream = require('node:stream');


async function convert(input) {
  return new Promise((resolve, reject) => {
    let child = child_process.exec(`java -Djava.awt.headless=true -jar ${__dirname}/../../plantuml.jar -tsvg -p`, (error, stdout, stderr) => {
      if (error === null) {
        resolve(stdout);
      } else {
        reject(error);
      }
    });

    let stdin = new stream.Readable();
    stdin.push(input);  // Add data to the internal queue for users of the stream to consume
    stdin.push(null);   // Signals the end of the stream (EOF)
    stdin.pipe(child.stdin);
  });
}


module.exports = {
  typeKey: 'plantuml',
  convert,
  contentType: 'image/svg+xml',
};
