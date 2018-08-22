const request = require('request');
const fs = require('fs');

function awaitLoader(from, to, proxy = null) {
    let requestTo = request;
    if (proxy) {
        requestTo = request.defaults({ 'proxy': proxy});
    }
    return new Promise((resolve, reject) => {
        const stream = requestTo(from).pipe(fs.createWriteStream(to));
        stream.on('finish', function () {
            setTimeout(() => {
                resolve(to);
            }, 500);
        });
    });
}


module.exports = awaitLoader;
