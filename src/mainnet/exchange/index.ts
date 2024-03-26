import exchangeAll from "./all.json";
import exchangeAddresses from "./addresses.json";
import { isExchangeAddress } from "./is-exchange-address";

interface AllData {
  address: string;
  nameTag: string;
}
export const exchange = {
  all: exchangeAll as Array<AllData>,
  addresses: exchangeAddresses,
  isExchangeAddress,
};
