import phishHackAll from "./all.json";
import phishHackAddresses from "./addresses.json";
import { isPhishHackAddress } from "./is-phish-hack-address";

interface AllData {
  address: string;
  nameTag: string;
}
export const phishHack = {
  all: phishHackAll as AllData[],
  addresses: phishHackAddresses,
  isPhishHackAddress,
};
