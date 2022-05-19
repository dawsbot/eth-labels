import exchangeAddresses from "./addresses.json";
export function isExchangeAddress(address: string): boolean {
  return exchangeAddresses.addresses.includes(address.toLowerCase());
}
