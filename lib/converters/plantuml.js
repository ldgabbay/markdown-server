'use strict';

const child_process = require('child_process');


async function convert(input) {
  return child_process.execSync(`java -Djava.awt.headless=true -jar ${__dirname}/../../plantuml.jar -tsvg -p`, {input});
}


module.exports = {
  typeKey: 'plantuml',
  convert,
  contentType: 'image/svg+xml',
};
