'use strict';

const fs = require('fs');
const path = require('path');
const util = require('util');

const keccak256 = require('keccak256');

const platform = require('../platform.js');

const plantuml = require('./plantuml.js');
const texmath = require('./texmath.js');
const markdown = require('./markdown.js');


const async_fs_exists = util.promisify(fs.exists);


const APPNAME = 'mdserver';


function cache(converter) {
  return async function(input) {
    const hash = keccak256(Buffer.concat([Buffer.from(input), Buffer.from(converter.typeKey)])).toString('hex');
    const cachePath = await platform.getCachePath(APPNAME);
    const cacheFn = path.join(cachePath, hash);
    let body;
    if (!await async_fs_exists(cacheFn)) {
      body = await converter.convert(input);
      await fs.promises.writeFile(cacheFn, body);
    } else {
      body = await fs.promises.readFile(cacheFn);
    }
    const contentType = converter.contentType;
    return {
      body,
      contentType,
    };
  }
}


module.exports = {
  plantuml: cache(plantuml),
  texmath: cache(texmath),
  markdown: cache(markdown),
};
