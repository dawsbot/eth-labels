import phishHackAddresses from "./addresses.json";
export function isPhishHackAddress(address: string): boolean {
  return phishHackAddresses.addresses.includes(address.toLowerCase());
}
