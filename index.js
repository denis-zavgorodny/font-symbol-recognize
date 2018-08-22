const opentype = require('opentype.js');
const tesseract = require('node-tesseract');
const PImage = require('pureimage');
const fs = require('fs');
const path = require('path');

const img1 = PImage.make(500, 50);
const ctx = img1.getContext('2d');

const imageSize = {
    width: 500,
    height: 50
};
const argParams = {};
process.argv.forEach(function(val, index, array) {
    if (index > 1) {
        const param = val.split("=");
        if (param.length > 1) {
            argParams[param[0]] = param[1];
        }
    }
});

const pathToFont = argParams.path ? argParams.path : 'font/font3.woff';
const fontName = path.basename(pathToFont);
const renderImageTo = `${__dirname}/images/${fontName}.jpg`;

ctx.fillStyle = 'rgba(255,255,255, 1)';
ctx.fillRect(0, 0, imageSize.width, imageSize.height);

opentype.load(pathToFont, function(err, font) {
    if (err) {
        console.log('Could not load font: ' + err);
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
            tesseract.process(renderImageTo, function(err, text) {
                if (err) {
                    console.error(err);
                } else {
                    const res = text.trim().split("").filter(el => el != ' ').reduce((acc, el, index) => {
                        return {
                            ...acc,
                            [el]: unicodes[index]
                        };
                    }, {});
                    console.log(JSON.stringify(res));
                }
            });
        });
    }
});
