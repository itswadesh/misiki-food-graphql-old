const shell = require('shelljs');

shell.rm('-Rf', 'prod');
shell.mkdir('prod');
shell.cp('-R', 'dist/server', 'prod/server');
shell.cp('-R', 'package.json', 'prod/package.json');
// shell.cp('-R', 'prod.env', 'prod/.env');
// shell.cp('-R', 'templates', 'prod/templates');
shell.cp('-R', 'exports', 'prod/exports');
