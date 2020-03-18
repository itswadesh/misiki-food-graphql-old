const shell = require('shelljs');

// Add to remote git repo and execute commands through post-receive hook
shell.mkdir('prod');
shell.rm('-rf', 'prod/*');
shell.cp('-R', 'dist/server', 'prod/server');
shell.cp('-R', 'package.json', 'prod/package.json');
shell.cp('-R', 'exports', 'prod/exports');
shell.cd('prod')
    .exec('git init')
    .exec('git remote add live ssh://root@165.22.222.60/opt/misiki-api.git')
    .exec('git pull live master')
    .exec('git add .')
    .exec("git commit -m '-'")
    .exec('git push live master -f')
