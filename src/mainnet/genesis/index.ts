import genesisAddresses from "./addresses.json";
import genesisAll from "./all.json";
import { isGenesisAddress } from "./is-genesis-address";

interface AllData {
  address: string;
  nameTag: string;
}
export const genesis = {
  all: genesisAll as Array<AllData>,
  addresses: genesisAddresses,
  isGenesisAddress,
};
