'use strict';

const fs = require('node:fs/promises');
const path = require('path');
const util = require('util');

const keccak256 = require('keccak256');

const platform = require('../platform.js');

const plantuml = require('./plantuml.js');
const texmath = require('./texmath.js');
const markdown = require('./markdown.js');


const APPNAME = 'mdserver';


function cache(converter) {
  return async function(input) {
    const hash = keccak256(Buffer.concat([Buffer.from(input), Buffer.from(converter.typeKey)])).toString('hex');
    const cachePath = await platform.getCachePath(APPNAME);
    const cacheFn = path.join(cachePath, hash);
    let body;
    let error;
    try {
      await fs.access(cacheFn, fs.constants.F_OK | fs.constants.R_OK);
      try {
        const stats = await fs.stat(cacheFn);
        if (stats.isFile()) {
          // file exists and is readable and is a file
          body = await fs.readFile(cacheFn);
        } else {
          // file exists and is readable but not a file
          error = new Error(`${cacheFn} exists but is not a file`);
        }
      }
      catch (err) {
        // file exists and is readable but some error running stat
        error = err;
      }
    }
    catch (err) {
      // file does not exist or is not readable
      try {
        body = await converter.convert(input);
        try {
          await fs.writeFile(cacheFn, body);
        }
        catch (err) {
          // failed to write
          console.warn(`failed to write to ${cacheFn}`);
        }
      }
      catch (err) {
        // failed to convert
        error = err;
      }
    }

    if (error) throw error;

    return {
      body,
      contentType: converter.contentType,
    };
  }
}


module.exports = {
  plantuml: cache(plantuml),
  texmath: cache(texmath),
  markdown: cache(markdown),
};
