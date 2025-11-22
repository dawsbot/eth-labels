<p align="center">
  <a><img src="https://raw.githubusercontent.com/dawsbot/eth-labels/v1/docs/img/etherscan.svg" title="Logo" width="400"/></a>
</p>
<p align="center">
  <b>
    Eth Labels
  </b>
  <br>
  <i>A public dataset of crypto addresses labeled (<a href="https://etherscan.io/labelcloud">Ethereum and MANY more EVM chains</a></i>)
  <br>
</p>

<br/>

## API

A public API to consume this data is available for free. You can [use it remotely here](https://eth-labels-production.up.railway.app/swagger)

<br/>

### Ethereum

<img src="https://raw.githubusercontent.com/dawsbot/eth-labels/v1/docs/img/etherscan.svg" width="200"/></a>

[View labels here](https://eth-labels-production.up.railway.app/accounts?chainId=1)

### Base

<a><img src="https://raw.githubusercontent.com/dawsbot/eth-labels/v1/docs/img/basescan.svg" width="200"/></a>

[View labels here](https://eth-labels-production.up.railway.app/accounts?chainId=8453)

### Arbitrum

<a><img src="https://raw.githubusercontent.com/dawsbot/eth-labels/v1/docs/img/arbiscan.svg" width="200"/></a>

[View labels here](https://eth-labels-production.up.railway.app/accounts?chainId=42161)

### Optimism

<a><img src="https://raw.githubusercontent.com/dawsbot/eth-labels/v1/docs/img/optimism.svg" width="200"/></a>

[View labels here](https://eth-labels-production.up.railway.app/accounts?chainId=10)

### Binance Smart Chain

<img src="https://raw.githubusercontent.com/dawsbot/eth-labels/v1/docs/img/bscscan.svg" width="200"/></a>

[View labels here](https://eth-labels-production.up.railway.app/accounts?chainId=56)

### Gnosis Chain

<img src="https://raw.githubusercontent.com/dawsbot/eth-labels/v1/docs/img/gnosis.svg" width="200"/></a>

[View labels here](https://eth-labels-production.up.railway.app/accounts?chainId=100)

### Celo

<img src="https://raw.githubusercontent.com/dawsbot/eth-labels/v1/docs/img/celo.svg" width="200"/></a>

[View labels here](https://eth-labels-production.up.railway.app/accounts?chainId=42220)

## Q & A

- Where does this data come from?
  - This data is already organized by the kind folks at Etherscan. Unfortunately that data is not accessible for researchers, so we've copied the data out and into a more shareable format here.

## Star History

[![Star History Chart](https://api.star-history.com/svg?repos=dawsbot/eth-labels&type=Date)](https://star-history.com/#dawsbot/eth-labels&Date)

## Development

To use this API locally, start it like this:

```sh
bun run dev:api
```

Documentation for the API is available via swagger at `http://localhost:3000/swagger`
