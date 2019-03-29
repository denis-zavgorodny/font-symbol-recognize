#!/usr/bin/env node
const needle = require('needle');
const cheerio = require('cheerio');
var shell = require('shelljs');
const url = require('url');

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
process.env.NODE_NO_WARNINGS = "1";


const options = {
    compressed: true,
    follow_max: 5,
    rejectUnauthorized: false
}
const regexFont = /src: url\('(.+\.woff)'\)/m;

const argParams = {};
let proxy = '';
let needleOptions = {
    silent: true
};

process.argv.forEach(function (val, index) {
    if (index > 1) {
        const param = val.split("=");
        if (param.length > 1) {
            argParams[param[0]] = param[1];
        }
    }
});
if (!argParams.url) {
    process.exit(1);
}
const inputURL = new url.URL(argParams.url);
const fontDomain = inputURL.origin;

if (argParams.proxy) {
    proxy = ` proxy=${argParams.proxy}`;
    needleOptions = {
        ...needleOptions,
        proxy
    }
}
process.env.NODE_TLS_REJECT_UNAUTHORIZED = 0;
needle('get', argParams.url, options).then(res => {
    const match = res.body.match(regexFont);
    shell.exec(`extfontsymbol path=${fontDomain}${match[1]} ${proxy}`, needleOptions, (code, fontRes, stderr) => {
        try {
            fontRes = JSON.parse(fontRes);
            const fontResMatch = {};
            for (i in fontRes) {
                fontResMatch[fontRes[i]] = i;
            }

            var $ = cheerio.load(res.body);
            const productName = $('h1').text();
            const regexpID = /present\/(\d+)/m;
            const productID = argParams.url.match(regexpID);

            const prices = [];
            $('.Right.Middle .price').map((index, span) => {
                const pharmacie = $(span).closest('tr');
                const pharmacieID = pharmacie.attr('data-id');
                const pharmacieName = pharmacie.find('td').eq(0).find('a').text();
                const pharmacieAddress = pharmacie.find('td').eq(2).find('p').eq(0).text();
                const rawPrice = $(span).contents().text();
                if (rawPrice != 'Уточняйте в аптеке') {
                    prices.push({
                        pharmacieName,
                        pharmacieID,
                        pharmacieAddress,
                        price: rawPrice.split('').reduce((acc, char) => {
                            return `${acc}${fontResMatch[char.charCodeAt()]}`;
                        }, '')
                    });
                }
            });
            console.log(JSON.stringify({
                name: productName,
                ID: productID[1],
                prices
            }));
            process.exit(0);
        } catch (error) {
            process.exit(1);
        }
    });
}).catch(err => { console.error(`Error: ${err}`); process.exit(1); });
