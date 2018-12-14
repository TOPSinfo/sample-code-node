const imagemin = require('imagemin');
const imageminMozjpeg = require('imagemin-mozjpeg');
const imageminPngquant = require('imagemin-pngquant');
const fs = require('fs');
const path = require('path');
const staticPath = path.join(__dirname,'../static/images')

exports.compressImages = compressImages;

async function compressImages(files) {
    let images = files && Array.isArray(files) ? files : [files];
    for(const image of images) {
        if (fs.existsSync(image)) {
            const files = await imagemin([image], staticPath, {
                plugins: [
                    imageminMozjpeg({ quality: '50' }),
                    imageminPngquant({ quality: '50' })
                ]
            });
            console.log(files,'files')
        }
    }
    return true;
   
}