import all from "./all.json";
import addresses from "./addresses.json";

interface all {
  address: string;
  nameTag: string;
}

export default {
  all: all as all[],
  addresses,
};
