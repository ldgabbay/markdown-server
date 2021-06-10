'use strict';

const child_process = require('child_process');


async function convert(input) {
  return child_process.execSync(`cmark-gfm -e table -e strikethrough -e autolink`, {input});
}


module.exports = {
  typeKey: 'markdown',
  convert,
  contentType: 'text/html',
};
