import tokenContractAddresses from "./addresses.json";
export function isTokenContractAddress(address: string): boolean {
  return tokenContractAddresses.addresses.includes(address.toLowerCase());
}
