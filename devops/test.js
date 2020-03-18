const shell = require('shelljs');

// Add to remote git repo and execute commands through post-receive hook
shell.rm('-rf', 'prod/*');
shell.cp('-R', 'dist/server', 'prod/server');
shell.cp('-R', 'package.json', 'prod/package.json');
shell.cp('-R', 'exports', 'prod/exports');
shell.cd('prod')
    .exec('git init')
    .exec('git remote add test ssh://ubuntu@52.50.224.218/opt/api.git')
    .exec('git pull test master')
    .exec('git add .')
    .exec("git commit -m '-'")
    .exec('git push test master -f')