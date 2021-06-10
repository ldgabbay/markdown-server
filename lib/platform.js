'use strict';

const fs = require('fs');
const os = require('os');
const path = require('path');

const homedir = os.homedir();

let _path = {};

if (process.platform === 'darwin') {
  _path = {
    data: path.join(homedir, 'Library', 'Application Support'),
    config: path.join(homedir, 'Library', 'Preferences'),
    cache: path.join(homedir, 'Library', 'Caches'),
  };
} else if (process.platform === 'linux') {
  // https://specifications.freedesktop.org/basedir-spec/basedir-spec-0.6.html
  _path = {
    data: process.env.XDG_DATA_HOME ? process.env.XDG_DATA_HOME : path.join(homedir, '.local', 'share'),
    config: process.env.XDG_CONFIG_HOME ? process.env.XDG_CONFIG_HOME : path.join(homedir, '.config'),
    cache: process.env.XDG_CACHE_HOME ? process.env.XDG_CACHE_HOME : path.join(homedir, '.cache'),
  };
} else if (process.platform === 'win32') {
  _path = {
    data: process.env.APPDATA,
    cache: process.env.LOCALAPPDATA,
  };
// } else if (process.platform === 'aix') {
// } else if (process.platform === 'freebsd') {
// } else if (process.platform === 'openbsd') {
// } else if (process.platform === 'sunos') {
// } else {
}

function ensureDirFunc(basePath) {
  return async function(appName) {
    const dirPath = path.join(basePath, appName);
    try {
      const baseStats = await fs.promises.stat(dirPath);
      // 'dirPath' it exists
      if (!baseStats.isDirectory()) {
        throw new Error(`${dirPath} exists but not as directory`);
      }
    } catch(error) {
      if (error.code === 'ENOENT') {
        // 'dirPath' does not exist, create it
        await fs.promises.mkdir(dirPath);
      } else {
        return undefined;
      }
    }
    return dirPath;
  }
}

module.exports = {
  path: _path,
  getDataPath: ensureDirFunc(_path.data),
  getConfigPath: ensureDirFunc(_path.config),
  getCachePath: ensureDirFunc(_path.cache),
};
