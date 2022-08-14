const { Builder, By, Key, until } = require('selenium-webdriver');
const fs = require('fs');

async function login() {
    driver = await new Builder().forBrowser('chrome').build();
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
    catch (e) { throw `(ERROR)(getLabels) ${e}` }
}

async function getSingleLabel(label) {
    try {
        var index = 0
        var labelJSON = {}
        console.time(`(getLabel) ${label}`)
        while (true) {
            console.log(`${label} : Index ${index}-${index + 100}`)
            await driver.get(`https://etherscan.io/accounts/label/${label}?subcatid=undefined&size=100&start=${index}`)
            // STEP 1: READ TABLE FROM PAGE SOURCE (NOT SURE JS EQUIVALENT OF pandas.read_html)
            console.time('(getLabel)(FindAllTd)')
            var tableData = await driver.findElements(By.tagName("td"))
            console.timeEnd('(getLabel)(FindAllTd)')
            console.log('Table Data length:', tableData.length)

            // STEP 2: Loop through and extract address:name pair from td element
            console.time(`(getLabel)(getTextAll)${index}`)
            // Start i from 4 to ignore header row
            for (let i = 4; i + 4 <= tableData.length; i += 4) {
                address = await tableData[i].getText()
                nameTag = await tableData[i + 1].getText()
                console.log(i, address, nameTag)
                labelJSON[address] = nameTag
            }
            console.timeEnd(`(getLabel)(getTextAll)${index}`)

            // STEP 3: Break out of loop if addresses found != 100
            if (tableData.length < 400) break
            index += 100
        }
        console.timeEnd(`(getLabel) ${label}`)
        var addressesFound = Object.keys(labelJSON).length
        console.log(`Total addresses: ${addressesFound}`)

        if (addressesFound == 0) console.error(`(ERROR) Invalid label, no addreses found`)
        // Dump labelJSON / CSV to relevant file location
        else fs.writeFileSync(`../src/mainnet/all-json/${label}.json`, JSON.stringify(labelJSON))
    }
    catch (e) { throw `(getSingleLabel) L: ${label} / ${e}` }
}

async function getAllLabels() {
    try {
        var existingLabels = fs.readdirSync('../src/mainnet/all-json/').map(label => label.slice(0, -5))
        // Large size: Eth2/gnsos , Bugged: Liqui , NoData: Remaining labels
        var ignore_list = ['eth2-depositor', 'gnosis-safe-multisig', 'liqui.io', 'education', 'electronics', 'flashbots', 'media', 'music', 'network', 'prediction-market', 'real-estate', 'vpn']
        var labels = await getLabels()
        var filteredLabels = labels.filter(label => !existingLabels.includes(label) && !ignore_list.includes(label))
        console.log(`Labels to extract ${filteredLabels.length}/${labels.length} after filtering`)

        for (let i = 0; i < filteredLabels.length; i++)
            await getSingleLabel(filteredLabels[i])
    }
    catch (e) { throw e }
}

async function main() {
    const myArgs = process.argv
    if (myArgs.length > 3) {
        console.log('(ERROR) Invalid number of arguments, example format "node scrape-all exchange" or "node scrape-all"')
        return
    }

    try {
        await login() // Log in 
        if (myArgs.length == 2) { // Default to extract all if no label specified
            console.log('Retrieving all labels')
            await getAllLabels()
        }
        else if (myArgs.length == 3) // Get single label if specified
            await getSingleLabel(process.argv[2])
    } finally {
        await driver.quit();
    }
}

main()