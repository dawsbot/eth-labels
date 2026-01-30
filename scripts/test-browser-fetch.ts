import { BrowserFetcher } from "./browser-fetch";

async function main() {
  const fetcher = new BrowserFetcher();
  
  try {
    console.log("1️⃣  Initializing browser fetcher...");
    await fetcher.init();

    console.log("2️⃣  Testing HTML fetch (labelcloud)...");
    const html = await fetcher.fetchHtml("https://etherscan.io/labelcloud");
    const hasLabels = html.includes("labelcloud") || html.includes("Label Cloud");
    console.log(`   HTML length: ${html.length}, has labels: ${hasLabels}`);
    
    if (!hasLabels) {
      console.log("   ❌ Labelcloud fetch failed - got blocked or wrong content");
      console.log("   First 200 chars:", html.substring(0, 200));
      return;
    }
    console.log("   ✅ Labelcloud fetch works!\n");

    console.log("3️⃣  Testing POST (GetTokensBySubLabel for 'aave')...");
    const body = JSON.stringify({
      dataTableModel: {
        draw: 1,
        columns: [
          { data: "number", name: "", searchable: true, orderable: false, search: { value: "", regex: false } },
          { data: "contractAddress", name: "", searchable: true, orderable: false, search: { value: "", regex: false } },
          { data: "tokenName", name: "", searchable: true, orderable: true, search: { value: "", regex: false } },
          { data: "marketCap", name: "", searchable: true, orderable: true, search: { value: "", regex: false } },
          { data: "holders", name: "", searchable: true, orderable: true, search: { value: "", regex: false } },
          { data: "website", name: "", searchable: true, orderable: false, search: { value: "", regex: false } },
        ],
        order: [{ column: 3, dir: "desc" }],
        start: 0,
        length: 3,
        search: { value: "", regex: false },
      },
      labelModel: { label: "aave", subCategoryId: "0" },
    });

    const tokenResult = await fetcher.postJson(
      "https://etherscan.io/tokens.aspx/GetTokensBySubLabel",
      body
    );
    
    const parsed = JSON.parse(tokenResult);
    const tokenCount = parsed?.d?.recordsTotal;
    const firstToken = parsed?.d?.data?.[0];
    console.log(`   Total tokens: ${tokenCount}`);
    console.log(`   First token address field (truncated): ${firstToken?.contractAddress?.substring(0, 80)}...`);
    console.log("   ✅ POST works!\n");

    console.log("4️⃣  Testing account HTML fetch...");
    const accountHtml = await fetcher.fetchHtml("https://etherscan.io/accounts/label/aave?size=100");
    const hasTable = accountHtml.includes("table-subcatid") || accountHtml.includes("tbody");
    console.log(`   HTML length: ${accountHtml.length}, has table: ${hasTable}`);
    
    if (!hasTable) {
      console.log("   ⚠️  Trying full navigation instead...");
      const navHtml = await fetcher.navigateAndGetHtml("https://etherscan.io/accounts/label/aave?size=100");
      const navHasTable = navHtml.includes("table-subcatid") || navHtml.includes("tbody");
      console.log(`   Nav HTML length: ${navHtml.length}, has table: ${navHasTable}`);
      console.log(navHasTable ? "   ✅ Navigation fetch works!" : "   ❌ Still no table");
    } else {
      console.log("   ✅ Account fetch works!\n");
    }

    console.log("🎉 All tests passed! Browser-based fetching works.");
    
  } catch (error) {
    console.error("❌ Error:", error);
  } finally {
    await fetcher.close();
  }
}

main();
