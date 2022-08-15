const allLabels = require("./all.json")

export function hasLabel(address: string, label: string): boolean {
    var address = address.toLowerCase()
    if (allLabels[address]) return allLabels[address]['labels'].includes(label);
    else return false
}
