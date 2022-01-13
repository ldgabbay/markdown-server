'use strict';

const child_process = require('child_process');


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
  return child_process.execSync(`${__dirname}/../../etc/tex2svg.sh`, {input: tex});
}

module.exports = {
  typeKey: 'texmath',
  convert,
  contentType: 'image/svg+xml',
};
