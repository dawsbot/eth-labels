const fs = require('fs');

var combinedLabelsJSON = {}

fs.readdirSync('../src/mainnet/all-json/').forEach(labelFile => {
    labelJson = require(`../src/mainnet/all-json/${labelFile}`)
    for (const [address, nameTag] of Object.entries(labelJson)) {
        if (!combinedLabelsJSON[address]) combinedLabelsJSON[address] = { 'labels': [], 'name': nameTag }
        combinedLabelsJSON[address]['labels'].push(labelFile.slice(0, -5))
    }
})

fs.writeFileSync(`../src/mainnet/all-json/all.json`, JSON.stringify(combinedLabelsJSON))