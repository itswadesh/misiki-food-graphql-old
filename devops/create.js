var fs = require('fs');
var mkdirp = require('mkdirp');
let path = 'dist/server'
if (fs.existsSync(path)) {
    return
}
mkdirp(path, function (err) {
    if (err) console.error(err)
    fs.writeFile(path + '/app.js', '', (r) => { })
});
