#!/usr/bin/env tsx
/**
 * Test the full scraping flow to identify exact breakage points
 */

import { CheerioParser } from './scripts/CheerioParser';
import { fetchHtml } from './scripts/fetch-html';

const ETHERSCAN_URL = 'https://etherscan.io';

console.log('🧪 Full Flow Test\n');

// Test 1: Fetch and parse labelcloud page (accounts)
console.log('Test 1: Labelcloud page parsing...');
try {
  const html = await fetchHtml(`${ETHERSCAN_URL}/labelcloud`);
  console.log(`✓ Fetched labelcloud (${html.length} bytes)`);
  
  const parser = new CheerioParser();
  parser.loadHtml(html);
  
  // Test the selector used in the actual code
  const labelLinks = parser.querySelectorAll('a[href*="/accounts/label/"]');
  console.log(`✓ Found ${labelLinks.length} account label links`);
  
  if (labelLinks.length > 0) {
    // Get first few hrefs
    const hrefs = labelLinks.slice(0, 5).map(link => 
      parser.querySelector('a', link).attr('href')
    );
    console.log('  Sample hrefs:', hrefs);
  }
  
  // Also check token labels
  const tokenLinks = parser.querySelectorAll('a[href*="/tokens/label/"]');
  console.log(`✓ Found ${tokenLinks.length} token label links`);
  
} catch (error) {
  console.log('❌ Test 1 failed:', error);
}

// Test 2: Fetch a specific label page (accounts)
console.log('\nTest 2: Fetching specific account label page...');
try {
  const html = await fetchHtml(`${ETHERSCAN_URL}/accounts/label/exchange`);
  console.log(`✓ Fetched label page (${html.length} bytes)`);
  
  const parser = new CheerioParser();
  parser.loadHtml(html);
  
  // Look for account addresses in the table
  const addressLinks = parser.querySelectorAll('a[href*="/address/0x"]');
  console.log(`✓ Found ${addressLinks.length} address links`);
  
} catch (error) {
  console.log('❌ Test 2 failed:', error);
}

// Test 3: Token API (will likely fail without cookies)
console.log('\nTest 3: Token API endpoint...');
try {
  const url = `${ETHERSCAN_URL}/tokens.aspx/GetTokensBySubLabel`;
  const body = JSON.stringify({
    "dataTableModel": {
      "draw": 1,
      "columns": [
        {"data": "number", "name": "", "searchable": true, "orderable": false, "search": {"value": "", "regex": false}},
        {"data": "contractAddress", "name": "", "searchable": true, "orderable": false, "search": {"value": "", "regex": false}},
        {"data": "tokenName", "name": "", "searchable": true, "orderable": true, "search": {"value": "", "regex": false}},
        {"data": "marketCap", "name": "", "searchable": true, "orderable": true, "search": {"value": "", "regex": false}},
        {"data": "holders", "name": "", "searchable": true, "orderable": true, "search": {"value": "", "regex": false}},
        {"data": "website", "name": "", "searchable": true, "orderable": false, "search": {"value": "", "regex": false}}
      ],
      "order": [{"column": 3, "dir": "desc"}],
      "start": 0,
      "length": 10,
      "search": {"value": "", "regex": false}
    },
    "labelModel": {
      "label": "exchange",
      "subCategoryId": "1"
    }
  });
  
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'accept': 'application/json, text/javascript, */*; q=0.01',
      'content-type': 'application/json',
      'x-requested-with': 'XMLHttpRequest',
    },
    body,
  });
  
  const text = await response.text();
  console.log(`  Status: ${response.status}`);
  
  if (text.includes('Just a moment')) {
    console.log('❌ Cloudflare blocked - cookies required');
    console.log('  Response preview:', text.substring(0, 100));
  } else {
    try {
      const json = JSON.parse(text);
      console.log('✓ Valid JSON response');
      console.log('  Keys:', Object.keys(json));
    } catch {
      console.log('⚠ Not JSON:', text.substring(0, 200));
    }
  }
} catch (error) {
  console.log('❌ Test 3 failed:', error);
}

console.log('\n📋 Summary:');
console.log('- Labelcloud HTML parsing: Should work ✓');
console.log('- Account label pages: Should work ✓');
console.log('- Token API: Requires valid Cloudflare cookies ❌');
