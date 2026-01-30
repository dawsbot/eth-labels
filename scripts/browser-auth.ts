import puppeteer from "puppeteer";

/**
 * Automated login to Etherscan using Puppeteer
 * Extracts session cookies after successful login
 */
export async function getEtherscanCookies(): Promise<string> {
  const username = process.env.ETHERSCAN_USERNAME;
  const password = process.env.ETHERSCAN_PASSWORD;

  if (!username || !password) {
    throw new Error(
      "Missing credentials! Please create a .env file with ETHERSCAN_USERNAME and ETHERSCAN_PASSWORD"
    );
  }

  console.log("🌐 Launching browser...");
  const browser = await puppeteer.launch({
    headless: false, // Using headed mode to debug
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  try {
    const page = await browser.newPage();

    // Set a realistic user agent to avoid detection
    await page.setUserAgent(
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    );

    console.log("🔐 Navigating to Etherscan login page...");
    await page.goto("https://etherscan.io/login", {
      waitUntil: "networkidle2",
      timeout: 60000,
    });

    // Wait for the login form to be present
    await page.waitForSelector('input[name="ctl00$ContentPlaceHolder1$txtUserName"]', {
      timeout: 30000,
    });

    // Wait for CAPTCHA to load (if present)
    await new Promise((resolve) => setTimeout(resolve, 3000));

    console.log("✍️  Filling in credentials...");
    
    // Fill in username
    await page.type(
      'input[name="ctl00$ContentPlaceHolder1$txtUserName"]',
      username,
      { delay: 100 }
    );

    // Fill in password
    await page.type(
      'input[name="ctl00$ContentPlaceHolder1$txtPassword"]',
      password,
      { delay: 100 }
    );

    console.log("\n⚠️  IMPORTANT: Etherscan requires solving a CAPTCHA");
    console.log("   A browser window should be open. Please:");
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

    // Extract cookies
    const cookies = await page.cookies();
    
    // Format cookies as a cookie header string (name=value; name2=value2)
    const cookieString = cookies
      .map((cookie) => `${cookie.name}=${cookie.value}`)
      .join("; ");

    console.log(`🍪 Extracted ${cookies.length} cookies`);

    return cookieString;
  } catch (error) {
    console.error("❌ Error during automated login:", error);
    throw error;
  } finally {
    await browser.close();
  }
}
