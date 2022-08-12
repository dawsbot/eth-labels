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
    while (true) {
        await driver.get(`https://etherscan.io/accounts/label/${label}?subcatid=undefined&size=100&start=${index}`)
        // STEP 1: READ TABLE FROM PAGE SOURCE (NOT SURE JS EQUIVALENT OF pandas.read_html)

        // STEP 2: Loop through and extract address:name pair

        // STEP 3: Break out of loop if addresses found != 100

        index += 100
    }

    // Dump labelJSON / CSV to relevant file location
    // fs.writeFileSync(`../src/mainnet/{label}.json`,labelJSON)
}

async function main() {
    try {
        driver = await new Builder().forBrowser('chrome').build();
        await login()
        //var labels = await getLabels()
        //for (let i=0;i<labels.length;i++) await getSingleLabel(labels[i])
    }
    finally {
        await driver.quit();
    }
}

main()