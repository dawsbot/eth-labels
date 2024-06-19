import { AccountsRepository } from "./repositories/AccountsRepository";

const address = "0x02466e547bfdab679fc49e96bbfc62b9747d997c";
const accountRow = await AccountsRepository.selectAccountsByAddress(
  address.toUpperCase(),
);
console.dir({ accountRow });
