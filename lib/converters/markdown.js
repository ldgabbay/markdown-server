'use strict';

const child_process = require('child_process');
const stream = require('stream');


async function convert(input) {
  return new Promise((resolve, reject) => {
    let child = child_process.exec('cmark-gfm -e table -e strikethrough -e autolink', {input}, (error, stdout, stderr) => {
      if (error === null) {
        resolve(stdout);
      } else {
        console.error('STDERR BEGIN');
        console.error(stderr);
        console.error('STDERR END');
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
  typeKey: 'markdown',
  convert,
  contentType: 'text/html',
};
