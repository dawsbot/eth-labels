<p align="center">
  <a><img src="https://etherscan.io/images/logo-ether.png?v=0.0.2" title="Logo" width="400"/></a>
</p>
<p align="center">
  <b>
    EVM Labels
  </b>
  <br>
  <i>A public dataset of crypto addresses labeled (<a href="https://etherscan.io/labelcloud">Ethereum and more</a></i>)
  <br>
</p>

<br/>

## Ethereum

| Label                              | CSV                                          | JSON                                           | Updated      |
| ---------------------------------- | -------------------------------------------- | ---------------------------------------------- | ------------ |
| `exchange` (Centralized Exchanges) | [View CSV](./src/mainnet/exchange/all.csv)   | [View JSON](./src/mainnet/exchange/all.json)   | May 9, 2022  |
| `phish-hack` (Phishing/Hacking)    | [View CSV](./src/mainnet/phish-hack/all.csv) | [View JSON](./src/mainnet/phish-hack/all.json) | May 15, 2022 |

More chains coming soon

<br/>

## Install

```sh
npm install --save evm-labels

// or with yarn
yarn add evm-labels
```

<br/>

## Use

You can install the CSV or JSON manually if you are not a dev. If you want to use this in code:

### Exchange (CEX's)

```js
import { exchange } from "evm-labels";

// A Coinbase hot wallet
const COINBASE_ADDRESS = "0x71660c4005ba85c37ccec55d0c4493e66fe775d3";
exchange.isExchangeAddress(COINBASE_ADDRESS);
// true

const NULL_ADDRESS = "0x0000000000000000000000000000000000000000";
exchange.isExchangeAddress(NULL_ADDRESS);
// false
```

### Phish/Hack (Addresses that performed phishing or hacks)

```js
import { phishHack } from "evm-labels";

// A Nexus Mutual Hacker
const HACKER_ADDRESS = "0x09923e35f19687a524bbca7d42b92b6748534f25";
phishHack.isPhishHackAddress(HACKER_ADDRESS);
// true

const NULL_ADDRESS = "0x0000000000000000000000000000000000000000";
phishHack.isPhishHackAddress(NULL_ADDRESS);
// false
```

<br/>

### Genesis

```js
import { genesis } from "evm-labels";

const GENESIS_ADDRESS = "0x0000000000000000000000000000000000000002";
genesis.isGenesisAddress(GENESIS_ADDRESS);
// true

const OATHER_ADDRESS = "0x09923e35f19687a524bbca7d42b92b6748534f25";
genesis.isGenesisAddress(OATHER_ADDRESS);
// false
```

## Contributing

Each label is currently pulled with custom scripts. Partially documented, partially not.

### Phish / Hack addresses

1. Install [tampermonkey](https://chrome.google.com/webstore/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo?utm_source=chrome-ntp-icon)
2. Copy phishhack-userscript to tampermonkey extension
3. Open the URL `https://etherscan.io/accounts/label/phish-hack?subcatid=undefined&size=100&start=0&col=1&order=asc`. only support size = 100
4. Open the chrome dev tools. Copy the outputted csv and json to `src/phish-hack`

### Genesis addresses

1. Install [tampermonkey](https://chrome.google.com/webstore/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo?utm_source=chrome-ntp-icon)
2. Copy genesis-userscript to tampermonkey extension
3. Open the URL `https://etherscan.io/accounts/label/genesis?subcatid=1&size=100&start=0&col=1&order=asc`. only support size = 100
4. Open the chrome dev tools. Copy the outputted csv and json to `src/genesis`
