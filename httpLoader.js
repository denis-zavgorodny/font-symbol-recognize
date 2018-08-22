const request = require('request');
const fs = require('fs');

function awaitLoader(from, to) {
    return new Promise((resolve, reject) => {
        const stream = request(from).pipe(fs.createWriteStream(to));
        stream.on('finish', function () {
            setTimeout(() => {
                resolve(to);
            }, 500);
        });
    });
}


module.exports = awaitLoader;
