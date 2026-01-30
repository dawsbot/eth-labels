import "dotenv/config";
import { getEtherscanCookies } from "./browser-auth";

/**
 * Quick test script to verify automated login works
 */
async function testLogin() {
  try {
    console.log("🧪 Testing automated Etherscan login...\n");
    const cookies = await getEtherscanCookies();
    console.log("\n✅ Login test successful!");
    console.log("\n📋 Cookie string (first 100 chars):");
    console.log(cookies.substring(0, 100) + "...");
    console.log(`\n📊 Total cookie length: ${cookies.length} characters`);
  } catch (error) {
    console.error("\n❌ Login test failed:", error);
    process.exit(1);
  }
}

testLogin();
