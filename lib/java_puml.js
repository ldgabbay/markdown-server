'use strict';

const util = require('util');
const exec = util.promisify(require('child_process').exec);

async function as_svg(filename) {
  const { stdout, stderr } = await exec(`cat ${filename} | java -Djava.awt.headless=true -jar ./plantuml.jar -tsvg -p`);
  return stdout;
};

module.exports = { as_svg };
