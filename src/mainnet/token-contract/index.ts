import tokenContractAll from "./all.json";
import tokenContractAddresses from "./addresses.json";
import { isTokenContractAddress } from "./is-token-contract-address";

interface AllData {
  address: string;
  nameTag: string;
}
export const tokenContract = {
  all: tokenContractAll as Array<AllData>,
  addresses: tokenContractAddresses,
  isTokenContractAddress,
};
