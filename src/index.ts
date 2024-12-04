import {
	http,
	type Address,
	type Chain,
	type WalletClient,
	createPublicClient,
	createWalletClient,
	encodeAbiParameters,
	getContract,
	nonceManager,
} from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { odysseyTestnet } from "viem/chains";
import market from "../data/abis/Market.json" with { type: "json" };
import params from "../data/params.json" with { type: "json" };

if (!process.env.PRIVATE_KEY) {
	throw new Error("Envionment variables not configured.");
}

const chain = odysseyTestnet;
const account = privateKeyToAccount(process.env.PRIVATE_KEY as `0x${string}`, {
	nonceManager,
});
const walletClient = createWalletClient({
	chain,
	transport: http(),
	account,
});
const contract = getContract({
	address: "0x1b61ca933a4806be95353fa64b368637e899b7c3",
	abi: market.abi,
	client: walletClient,
});
const publicClient = createPublicClient({
	chain,
	transport: http(),
});

const reveal = async (
	marketId: bigint,
	encodedHeadlineProof: `0x${string}`,
	encodedEmbeddingProof: `0x${string}`,
) => {
	const { result } = await contract.simulate.reveal([
		marketId,
		encodedHeadlineProof,
		encodedEmbeddingProof,
	]);
	console.log(result);
	const hash = await contract.write.reveal([
		marketId,
		encodedHeadlineProof,
		encodedEmbeddingProof,
	]);
	console.log(`Waiting for tx: ${hash}`)
	const receipt = await publicClient.waitForTransactionReceipt({
		hash,
		timeout: 60_000,
	});
	if (receipt.status !== "success") {
		console.warn("[reveal] failed with receipt", receipt);
		throw Error(`[reveal] transaction failed: ${receipt}`);
	}
};

const main = async () => {
	await reveal(
		6n,
		params.encodedHeadlineProof as `0x${string}`,
		params.encodedEmbeddingProof as `0x${string}`,
	);
};

main();
