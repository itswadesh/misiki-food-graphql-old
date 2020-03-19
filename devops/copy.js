const shell = require('shelljs');

shell.rm('-Rf', 'prod');
shell.mkdir('prod');
shell.cp('-R', 'dist', 'prod');
shell.cp('-R', 'package.json', 'prod/package.json');
shell.cp('-R', 'exports', 'prod/exports');
