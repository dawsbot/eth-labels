#!/usr/bin/env bun
/**
 * Diagnostic script to test Etherscan scraping
 * Tests:
 * 1. Can we fetch /labelcloud page?
 * 2. Is Cloudflare blocking us?
 * 3. Do the HTML selectors still work?
 * 4. Does the token API endpoint still work?
 */

const ETHERSCAN_URL = 'https://etherscan.io';
const LABELCLOUD_URL = `${ETHERSCAN_URL}/labelcloud`;

console.log('🔍 Etherscan Diagnostic Test\n');

// Test 1: Fetch labelcloud page
console.log('Test 1: Fetching /labelcloud page...');
try {
  const response = await fetch(LABELCLOUD_URL);
  const html = await response.text();
  
  console.log(`✓ Status: ${response.status}`);
  console.log(`✓ Response size: ${html.length} bytes`);
  
  // Check for Cloudflare block
  if (html.includes('Just a moment...') || html.includes('cloudflare')) {
    console.log('❌ BLOCKED: Cloudflare protection detected!');
    console.log('   First 500 chars:', html.substring(0, 500));
  } else {
    console.log('✓ No Cloudflare block detected');
    
    // Test 2: Check HTML structure
    console.log('\nTest 2: Checking HTML selectors...');
    
    // Look for label links (old selector pattern)
    const labelLinkPattern = /href="\/accounts\/label\/([^"]+)"/g;
    const matches = [...html.matchAll(labelLinkPattern)];
    console.log(`✓ Found ${matches.length} label links with old pattern`);
    
    if (matches.length > 0) {
      console.log('  Sample labels:', matches.slice(0, 5).map(m => m[1]));
    }
    
    // Look for any href patterns that might be labels
    const anyLabelPattern = /href="[^"]*label[^"]*"/gi;
    const anyMatches = [...html.matchAll(anyLabelPattern)];
    console.log(`✓ Found ${anyMatches.length} total label-related links`);
    
    if (anyMatches.length > 0) {
      console.log('  Sample:', anyMatches.slice(0, 5).map(m => m[0]));
    }
    
    // Save HTML for manual inspection
    const fs = await import('fs/promises');
    await fs.writeFile('/tmp/etherscan-labelcloud.html', html);
    console.log('\n✓ Full HTML saved to /tmp/etherscan-labelcloud.html');
  }
} catch (error) {
  console.log('❌ Fetch failed:', error);
}

// Test 3: Check token API endpoint
console.log('\nTest 3: Testing token API endpoint...');
try {
  const apiUrl = `${ETHERSCAN_URL}/labelcloud/GetTokensBySubLabel`;
  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
      'X-Requested-With': 'XMLHttpRequest',
    },
    body: 'subcatid=1&size=10&start=0&order=desc',
  });
  
  const data = await response.text();
  console.log(`✓ API Status: ${response.status}`);
  console.log(`✓ Response: ${data.substring(0, 200)}...`);
  
  // Try to parse as JSON
  try {
    const json = JSON.parse(data);
    console.log('✓ Valid JSON response');
    console.log('  Keys:', Object.keys(json));
  } catch {
    console.log('⚠ Response is not JSON');
  }
} catch (error) {
  console.log('❌ API call failed:', error);
}

console.log('\n✅ Diagnostic complete!');
