const opentype = require('opentype.js');
const tesseract = require('node-tesseract');
const PImage = require('pureimage');
const fs = require('fs');
const os = require('os');
var shell = require('shelljs');
const path = require('path');


function combine(pathToFont) {
    const imageSize = {
        width: 500,
        height: 50
    };
    const img1 = PImage.make(500, 50);
    const ctx = img1.getContext('2d');

    const fontName = path.basename(pathToFont);
    const renderImageToBase = `${os.tmpdir()}/extfontsymbol/font/images/`;
    const renderImageTo = `${renderImageToBase}${fontName}.jpg`;
    shell.mkdir('-p', renderImageToBase);

    ctx.fillStyle = 'rgba(255,255,255, 1)';
    ctx.fillRect(0, 0, imageSize.width, imageSize.height);
    return new Promise((resolve, reject) => {
        opentype.load(pathToFont, function (err, font) {
            if (err) {
                reject(err);
            } else {
                const { glyphs } = font.glyphs;
                const x = 10;
                const y = 40;
                const unicodes = [];
                for (index in glyphs) {
                    const glyph = glyphs[index];
                    if (glyph.unicode) {
                        glyph.draw(ctx, x + index * 30, y, 40);
                        unicodes.push(glyph.unicode);
                    }
                }

                PImage.encodeJPEGToStream(img1, fs.createWriteStream(renderImageTo)).then(() => {
                    tesseract.process(renderImageTo, function (err, text) {
                        if (err) {
                            reject(err);
                        } else {
                            const res = text.trim().split("").filter(el => el != ' ').reduce((acc, el, index) => {
                                return {
                                    ...acc,
                                    [el]: unicodes[index]
                                };
                            }, {});
                            resolve(JSON.stringify(res));
                        }
                    });
                });
            }
        });
    });
}



module.exports = combine;
