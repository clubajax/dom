const files = require('@clubajax/node-file-managment');

files.updateBuildPackage('./scripts', './build');
files.copyFile('./README.md', './build/README.md');
files.copyFile('./src/dom.js', './build/dom.js');
