import exchangeAll from "./exchange/all.json";
import exchangeAddresses from "./exchange/addresses.json";

import phishHackAll from "./phish-hack/all.json";
import phishHackAddresses from "./phish-hack/addresses.json";

interface all {
  address: string;
  nameTag: string;
}
export default {
  exchange: {
    all: exchangeAll as all[],
    addresses: exchangeAddresses,
  },
  "phish-hack": {
    all: phishHackAll as all[],
    addresses: phishHackAddresses,
  },
};
