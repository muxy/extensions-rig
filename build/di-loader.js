const fs = require('fs');
const path = require('path');
const replace = require('buffer-replace');

module.exports = function directInjection(content) {
  let out = content;
  const appDirs = this.query.apps || [];
  const apps = [];

  appDirs.forEach((appDir) => {
    try {
      const manifestFile = `${appDir}/manifest.json`;

      this.addContextDependency(path.resolve(__dirname, 'src')); // Watch for file changes.
      this.addContextDependency(path.resolve(__dirname, appDir));
      this.addDependency(path.resolve(__dirname, manifestFile));

      const manifestObj = JSON.parse(fs.readFileSync(manifestFile, 'utf8'));
      manifestObj._rig_id = path.basename(appDir);
      apps.push(manifestObj);
    } catch (err) {
      console.error(err);
    }
  });

  // DI:ExtensionList
  //
  // Inserts a list of extension configuration objects.
  // [ { _rig_id: <folder name>, etc. } ]

  try {
    out = replace(out, '/* DI:ExtensionList */', `/* eslint-disable */[${apps.map(a => JSON.stringify(a)).join(', ')}]/* eslint-enable */`);
  } catch (err) {
    console.error(err);
    throw err;
  }

  return out;
};
