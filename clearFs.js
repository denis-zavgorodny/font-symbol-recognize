const fs = require('fs');
function clear(path) {
    if (fs.statSync(path).isFile()) {
        fs.unlinkSync(path);
    }
}


module.exports = clear;
