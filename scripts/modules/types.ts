export type AllLabels = {
  accounts: Array<string>;
  tokens: Array<string>;
  blocks: ReadonlyArray<string>;
};
export type AccountRow = {
  address: string;
  nameTag: string;
};
export type TokenRow = {
  address: string;
  tokenName: string;
  tokenSymbol: string;
  website: string;
};
export type AccountRows = Array<AccountRow>;
export type TokenRows = Array<TokenRow>;
