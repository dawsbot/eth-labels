const fs = require('fs');

emptyCount = 0
totalCount = 0
fs.readdirSync('../src/mainnet/all-json/').forEach(labelFile => {
    labelJson = require(`../src/mainnet/all-json/${labelFile}`)
    if (Object.keys(labelJson).length == 0) {
        console.log('EMPTY:', labelFile)
        fs.unlinkSync(`../src/mainnet/all-json/${labelFile}`);
        emptyCount++
    }
    totalCount++
})

console.log('Impacted labels:', emptyCount, '/', totalCount)