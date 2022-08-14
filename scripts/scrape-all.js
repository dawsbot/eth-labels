const { Builder, By, Key, until } = require('selenium-webdriver');
const fs = require('fs');

async function login() {
    await driver.get('https://etherscan.io/login');
    console.log('Page received')
    await driver.findElement(By.id(
        "ContentPlaceHolder1_txtUserName")).sendKeys(process.env.ETHERSCAN_USER ? process.env.ETHERSCAN_USER : '')
    await driver.findElement(By.id(
        "ContentPlaceHolder1_txtPassword")).sendKeys(process.env.ETHERSCAN_PASS ? process.env.ETHERSCAN_PASS : '')
    console.log('Waiting for login')
    await driver.wait(until.titleIs('Etherscan Client Portal and Services'), 30000);
    console.log('Logged in successful')
}

async function getLabels() {

    try {
        console.log('Getting site')
        await driver.get('https://etherscan.io/labelcloud');
        console.log('Site retrieved')
        await driver.wait(until.titleIs('Label Word Cloud | Etherscan'), 5000);
        console.log('Title detected')
        // Retrieve all hrefs

        var elems = await driver.findElements(By.xpath("//a[@href]"))
        var hrefLinks = []
        for (let i = 0; i < elems.length; i++) hrefLinks.push(await elems[i].getAttribute("href"))
        var filteredAccountLabels = []
        var labelIndex = 'https://etherscan.io/accounts/label/'.length
        hrefLinks.forEach(link => { if (link.startsWith('https://etherscan.io/accounts/label/')) filteredAccountLabels.push(link.slice(labelIndex,)) })
        console.log(filteredAccountLabels)
        console.log('Total label length:', filteredAccountLabels.length)
        return filteredAccountLabels
    }
    catch (e) { console.error(`(ERROR)(getLabels) ${e}`) }
}

async function getSingleLabel(label) {
    var index = 0
    var labelJSON = {}
    console.time(`(getLabel)${label}`)
    while (true) {
        console.log(`${label} : Index ${index}-${index + 100}`)
        await driver.get(`https://etherscan.io/accounts/label/${label}?subcatid=undefined&size=100&start=${index}`)
        // STEP 1: READ TABLE FROM PAGE SOURCE (NOT SURE JS EQUIVALENT OF pandas.read_html)
        console.time('(getLabel)(FindAllTd)')
        var tableData = await driver.findElements(By.tagName("td"))
        console.timeEnd('(getLabel)(FindAllTd)')
        console.log('Table Data length:', tableData.length)

        // STEP 2: Loop through and extract address:name pair from td element
        console.time('(getLabel)(getTextAll)')
        // Start i from 4 to ignore header row
        for (let i = 4; i + 4 <= tableData.length; i += 4) {
            address = await tableData[i].getText()
            nameTag = await tableData[i + 1].getText()
            console.log(i, address, nameTag)
            labelJSON[address] = nameTag
        }
        console.timeEnd('(getLabel)(getTextAll)')

        // STEP 3: Break out of loop if addresses found != 100
        if (tableData.length < 400) break
        index += 100
    }
    console.timeEnd(`(getLabel) ${label}`)
    console.log(`Total pairs retrieved: ${Object.keys(labelJSON).length}`)

    // Dump labelJSON / CSV to relevant file location
    fs.writeFileSync(`../src/mainnet/all-json/${label}.json`, JSON.stringify(labelJSON))
}

async function main() {
    try {

        driver = await new Builder().forBrowser('chrome').build();
        var existingLabels = fs.readdirSync('../src/mainnet/all-json/').map(label => label.slice(0, -5))
        console.log(existingLabels)
        await login()
        var labels = await getLabels()
        for (let i = 0; i < labels.length; i++) {
            if (existingLabels.includes(labels[i])) {
                console.log(`Skipping ${labels[i]} as it already exists.`)
                continue
            }
            await getSingleLabel(labels[i])
        }
    }
    finally {
        await driver.quit();
    }
}

main()