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

| Label                              | CSV                                  | JSON                                   | Updated      |
| ---------------------------------- | ------------------------------------ | -------------------------------------- | ------------ |
| `exchange` (Centralized Exchanges) | [View CSV](./src/exchange/all.csv)   | [View JSON](./lib/exchange/all.json)   | May 9, 2022  |
| `phish-hack` (Phishing/Hacking)    | [View CSV](./src/phish-hack/all.csv) | [View JSON](./lib/phish-hack/all.json) | May 15, 2022 |

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

```js
import { exchange } from "evm-labels";

const NULL_ADDRESS = "0x0000000000000000000000000000000000000000";
exchange.isExchangeAddress(NULL_ADDRESS);
// false

const COINBASE_ADDRESS = "";
exchange.isExchangeAddress(COINBASE_ADDRESS);
// true
```

<br/>

## Contributing

Each label is currently pulled with custom scripts. Partially documented, partially not.

### Phish / Hack addresses

1. Install [tampermonkey](https://chrome.google.com/webstore/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo?utm_source=chrome-ntp-icon)
2. Copy userscript to tampermonkey extension
3. Open the URL `https://etherscan.io/accounts/label/phish-hack?subcatid=undefined&size=100&start=0&col=1&order=asc`. only support size = 100
4. Open the chrome dev tools. Copy the outputted csv and json to `src/phish-hack`
