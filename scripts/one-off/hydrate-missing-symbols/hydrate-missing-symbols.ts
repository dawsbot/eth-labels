// post-processing step that enhances any missing symbols with an on-chain symbol call
import type { Chain, PublicClient } from "viem";
import { createPublicClient, http, type Address } from "viem";
import {
  arbitrum,
  base,
  bsc,
  celo,
  gnosis,
  mainnet,
  optimism,
} from "viem/chains";
import { z } from "zod";
import { TokensRepository } from "../../db/repositories/TokensRepository";

// ABI for the symbol() function
const abi = [
  {
    constant: true,
    inputs: [],
    name: "name",
    outputs: [{ name: "", type: "string" }],
    type: "function",
  },
  {
    constant: true,
    inputs: [],
    name: "symbol",
    outputs: [{ name: "", type: "string" }],
    type: "function",
  },
] as const;

async function getSymbol(address: Address, client: PublicClient) {
  try {
    const symbol = await client.readContract({
      address,
      abi: abi,
      functionName: "symbol",
    });
    return z.string().optional().parse(symbol);
  } catch (error) {
    console.info("Error fetching symbol for ", address);
    return null;
  }
}

async function getName(address: Address, client: PublicClient) {
  try {
    const name = await client.readContract({
      address,
      abi: abi,
      functionName: "name",
    });
    console.log('Token name: "', name, '"');
    return z.string().optional().parse(name);
  } catch (error) {
    console.info("Error fetching name for ", address);
    return null;
  }
}

function isValidSymbol(symbol: unknown): symbol is string {
  return z.string().min(2).safeParse(symbol).success;
}

function createViemClient(chainId: number) {
  let chain: Chain;
  const transport = http();
  switch (chainId) {
    case 1:
      chain = mainnet;
      break;
    case 10:
      chain = optimism;
      break;
    case 56:
      chain = bsc;
      break;
    case 100:
      chain = gnosis;
      break;
    case 8453:
      chain = base;
      break;
    case 42161:
      chain = arbitrum;
      break;
    case 42220:
      chain = celo;
      break;
    default:
      throw new Error(`Unsupported chainId: ${chainId}`);
  }
  return createPublicClient({
    chain,
    transport,
  });
}

async function hydrateMissingTokenSymbols() {
  const rowsWithMissingSymbols = await TokensRepository.selectMissingSymbols();

  for (const row of rowsWithMissingSymbols) {
    const { address, id, chainId } = row;
    const client = createViemClient(chainId);
    // mainnet only is supported because of http transport urls
    const symbol = await getSymbol(address, client);
    if (isValidSymbol(symbol)) {
      await TokensRepository.updateTokenSymbol(id, symbol).then(() =>
        console.log(
          "Updated token row with id ",
          id,
          ' with new symbole: "',
          symbol,
          '"',
        ),
      );
    }
  }
}
await hydrateMissingTokenSymbols();

async function hydrateMissingTokenNames() {
  const rowsWithMissingNames = await TokensRepository.selectMissingNames();

  for (const row of rowsWithMissingNames) {
    const { address, id, chainId } = row;
    const client = createViemClient(chainId);
    // mainnet only is supported because of http transport urls
    const name = await getName(address, client);
    if (isValidSymbol(name)) {
      await TokensRepository.updateTokenName(id, name).then(() =>
        console.log(
          "Updated token row with id ",
          id,
          ' with new name: "',
          name,
          '"',
        ),
      );
    }
  }
}
await hydrateMissingTokenNames();
