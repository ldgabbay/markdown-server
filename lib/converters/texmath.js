'use strict';

const child_process = require('child_process');


async function convert(input) {
  const tex = `
    \\documentclass[border=1pt]{standalone}
    \\usepackage{amsmath}
    \\usepackage{amssymb}
    \\usepackage{amsfonts}
    \\begin{document}
    $${input}$
    \\end{document}
  `;
  return child_process.execSync('etc/tex2svg.sh', {input: tex});
}

module.exports = {
  typeKey: 'texmath',
  convert,
  contentType: 'image/svg+xml',
};
