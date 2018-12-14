const request = require('request');
exports.clearCache = clearCache;

async function clearCache() {
    request
        .post('http://localhost:4000/internal/clear-cache')
        .on('response', function (response) {
            console.log(response.statusCode) // 200
            console.log('cleared the cache') // 'image/png'
        })

}