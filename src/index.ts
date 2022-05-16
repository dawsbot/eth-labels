import allCEX from "./exchange/all.json";
import cexAddresses from "./exchange/addresses.json";
import allHacks from "./phish-hack/all.json";
import hackAddresses from "./phish-hack/addresses.json";

interface CEX {
  address: string;
  nameTag: string;
}

interface HACK {
  address: string;
  nameTag: string;
}

module.exports = {
  exchange: {
    all: allCEX as CEX[],
    addresses: cexAddresses,
  },
  phishHack: {
    all: allHacks as HACK[],
    addresses: hackAddresses,
  },
};
