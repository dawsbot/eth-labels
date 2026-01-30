import puppeteer from 'puppeteer-core';

/**
 * Automated login to Etherscan using Chrome DevTools Protocol
 * Connects to an already-running Chrome instance to avoid automation detection
 */
export async function getEtherscanCookies(): Promise<string> {
  // Try CDP endpoints
  const endpoints = [
    'http://127.0.0.1:18800/json/version',  // Clawdbot managed browser
    'http://127.0.0.1:9222/json/version',    // Standard Chrome DevTools
  ];
  
  for (const endpoint of endpoints) {
    try {
      const resp = await fetch(endpoint);
      const data = await resp.json();
      const wsUrl = data.webSocketDebuggerUrl;
      if (wsUrl) {
        console.log(`✅ Found Chrome at ${endpoint}`);
        return await loginAndExtractCookies(wsUrl);
      }
    } catch (error) {
      // Silently continue to next endpoint
    }
  }
  
  // Fallback: check .env for manual cookie
  if (process.env.ETHERSCAN_COOKIE) {
    console.log('ℹ️  Using ETHERSCAN_COOKIE from .env');
    return process.env.ETHERSCAN_COOKIE;
  }
  
  throw new Error(
    '❌ No Chrome instance found and no ETHERSCAN_COOKIE in .env.\n' +
    '\n' +
    'Options:\n' +
    '1. Start Chrome with remote debugging:\n' +
    '   /Applications/Google\\ Chrome.app/Contents/MacOS/Google\\ Chrome --remote-debugging-port=9222\n' +
    '2. Use Clawdbot managed browser (should be running at port 18800)\n' +
    '3. Manually extract cookies and add ETHERSCAN_COOKIE to .env\n' +
    '\n' +
    'See README for more details.'
  );
}

/**
 * Connect to Chrome via CDP, login to Etherscan, and extract cookies
 */
async function loginAndExtractCookies(wsUrl: string): Promise<string> {
  const username = process.env.ETHERSCAN_USERNAME;
  const password = process.env.ETHERSCAN_PASSWORD;

  if (!username || !password) {
    throw new Error(
      "Missing credentials! Please add ETHERSCAN_USERNAME and ETHERSCAN_PASSWORD to your .env file"
    );
  }

  console.log("🔗 Connecting to Chrome via CDP...");
  const browser = await puppeteer.connect({
    browserWSEndpoint: wsUrl,
    defaultViewport: null,
  });

  let page;
  try {
    // Create a new page/tab
    page = await browser.newPage();
    
    console.log("🔐 Navigating to Etherscan login page...");
    await page.goto("https://etherscan.io/login", {
      waitUntil: "networkidle2",
      timeout: 60000,
    });

    // Wait for the login form to be present
    await page.waitForSelector('input[name="ctl00$ContentPlaceHolder1$txtUserName"]', {
      timeout: 30000,
    });

    // Wait a moment for any dynamic content to load
    await new Promise((resolve) => setTimeout(resolve, 2000));

    console.log("✍️  Filling in credentials...");
    
    // Fill in username with realistic typing delay
    await page.type(
      'input[name="ctl00$ContentPlaceHolder1$txtUserName"]',
      username,
      { delay: 100 }
    );

    // Fill in password with realistic typing delay
    await page.type(
      'input[name="ctl00$ContentPlaceHolder1$txtPassword"]',
      password,
      { delay: 100 }
    );

    console.log("\n⚠️  IMPORTANT: Etherscan requires solving a CAPTCHA");
    console.log("   A browser tab should be open. Please:");
    console.log("   1. Solve the CAPTCHA");
    console.log("   2. Click the 'Sign In' button");
    console.log("   3. Wait for the page to load");
    console.log("   The script will detect when you've logged in (up to 2 minutes)...\n");
    
    // Wait for the user to solve CAPTCHA and login manually
    // We'll wait for navigation away from the /login page
    await page.waitForFunction(
      () => !window.location.href.includes('/login'),
      { timeout: 120000 } // 2 minutes
    );

    console.log("✅ Login successful!");

    // Extract cookies using CDP (includes httpOnly cookies)
    const client = await page.target().createCDPSession();
    const { cookies } = await client.send('Network.getCookies', { 
      urls: ['https://etherscan.io'] 
    });
    
    // Format cookies as a cookie header string
    const cookieString = cookies
      .map((cookie) => `${cookie.name}=${cookie.value}`)
      .join("; ");

    console.log(`🍪 Extracted ${cookies.length} cookies (including httpOnly)`);

    return cookieString;
  } catch (error) {
    console.error("❌ Error during automated login:", error);
    throw error;
  } finally {
    // CRITICAL: Close only the page/tab, NOT the browser!
    if (page) {
      await page.close();
      console.log("🧹 Closed login tab (browser still running)");
    }
    // Disconnect from the browser but don't close it
    browser.disconnect();
  }
}
