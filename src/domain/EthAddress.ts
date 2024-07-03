import type { Address } from "viem";
import { isAddress } from "viem";

// ValueObject
export class EthAddress {
  public value: Address;
  private constructor(address: Address) {
    this.value = address;
  }
  public static create(address: string) {
    address = address.toLowerCase().trim();
    if (!isAddress(address)) {
      throw new Error(`Invalid ethereum address "${address}"`);
    }
    return new EthAddress(address);
  }
}
