import phishHackAddresses from "./addresses.json";
import phishHackAll from "./all.json";
import { isPhishHackAddress } from "./is-phish-hack-address";

interface AllData {
  address: string;
  nameTag: string;
}
export const phishHack = {
  all: phishHackAll as Array<AllData>,
  addresses: phishHackAddresses,
  isPhishHackAddress,
};
