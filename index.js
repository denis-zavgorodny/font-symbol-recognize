#!/usr/bin/env node --no-warnings
const path = require('path');
const fs = require('fs');
const os = require('os');
var shell = require('shelljs');
const awaitLoader = require('./httpLoader');
const combine = require('./combineFont');

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
process.env.NODE_NO_WARNINGS = "1";

const fontBasePath = os.tmpdir() + '/extfontsymbol/font/';
shell.mkdir('-p', fontBasePath);

const argParams = {};
process.argv.forEach(function(val, index) {
    if (index > 1) {
        const param = val.split("=");
        if (param.length > 1) {
            argParams[param[0]] = param[1];
        }
    }
});

if (!argParams.path) {
    process.exit(1);
}
const pathToFont = fontBasePath + path.basename(argParams.path);

awaitLoader(argParams.path, pathToFont).then((path) => {
    combine(path).then(data => {
        // remove loaded file
        if (fs.statSync(path).isFile()) {
            fs.unlinkSync(path);
        }
        console.log(data);
    }).catch((err) => {
        if (argParams.debug) {
            console.error(err);
        }
        if (fs.statSync(path).isFile()) {
            fs.unlinkSync(path);
        }
        process.exit(1);
    });
});

