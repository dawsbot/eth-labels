import genesisAddresses from "./addresses.json";
export function isGenesisAddress(address: string): boolean {
  return genesisAddresses.addresses.includes(address.toLowerCase());
}
