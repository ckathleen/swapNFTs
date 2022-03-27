import { NftSwap } from '@traderxyz/nft-swap-sdk';

async function swapMiladys () {

  const CHAIN_ID = 1; // Chain 1 corresponds to Mainnet. Visit https://chainid.network/ for a complete list of chain ids

  const MILADY_9486 = {
    tokenAddress: '0x5af0d9827e0c53e4799bb226655a1de152a425a5', // Milady contract address
    tokenId: '9486', // Token Id of the Milady we want to swap
    type: 'ERC721',
  };

  const MILADY_4040 = {
    tokenAddress: '0x5af0d9827e0c53e4799bb226655a1de152a425a5', // Milady contract address
    tokenId: '4040', // Token Id of the Milady we want to swap
    type: 'ERC721',
  };

  // User A Trade Data (@caseykcaruso)
  const walletAddressUserA = '{insert_addy}';
  const assetsToSwapUserA = [MILADY_9486];

  // User B Trade Data (@Cryptonoura)
  const walletAddressUserB = '{insert_addy}';
  const assetsToSwapUserB = [MILADY_4040];

  // ............................
  // Part 1 of the trade -- User A (the 'maker') initiates an order
  // ............................

  // Initiate the SDK for User A.
  // Pass the user's wallet signer (available via the user's wallet provider) to the Swap SDK
  const nftSwapSdk = new NftSwap(provider, signerUserA, CHAIN_ID);

  // Check if we need to approve the NFT for swapping
  const approvalStatusForUserA = await nftSwapSdk.loadApprovalStatus(
    assetsToSwapUserA[0],
    walletAddressUserA
  );
  // If we do need to approve User A's Milady for swapping, let's do that now
  if (!approvalStatusForUserA.contractApproved) {
    const approvalTx = await nftSwapSdk.approveTokenOrNftByAsset(
      assetsToSwapUserA[0],
      makerAddress
    );
    const approvalTxReceipt = await approvalTx.wait();
    console.log(
      `Approved ${assetsToSwapUserA[0].tokenAddress} contract to swap with 0x (txHash: ${approvalTxReceipt.transactionHash})`
    );
  }

  // Create the order (Remember, User A initiates the trade, so User A creates the order)
  const order = nftSwapSdk.buildOrder(
    assetsToSwapUserA,
    assetsToSwapUserB,
    walletAddressUserA
  );
  // Sign the order (User A signs since they are initiating the trade)
  const signedOrder = await nftSwapSdk.signOrder(order, takerAddress);
  // Part 1 Complete. User A is now done. Now we send the `signedOrder` to User B to complete the trade.

  // ............................
  // Part 2 of the trade -- User B (the 'taker') accepts and fills order from User A and completes trade
  // ............................
  // Initiate the SDK for User B.
  const nftSwapSdkB = new NftSwap(provider, signerUserB, CHAIN_ID);

  // Check if we need to approve the NFT for swapping
  const approvalStatusForUserB = await nftSwapSdkB.loadApprovalStatus(
    assetsToSwapUserB[0],
    walletAddressUserB
  );
  // If we do need to approve NFT for swapping, let's do that now
  if (!approvalStatusForUserB.contractApproved) {
    const approvalTx = await nftSwapSdkB.approveTokenOrNftByAsset(
      assetsToSwapUserB[0],
      walletAddressUserB
    );
    const approvalTxReceipt = await approvalTx.wait();
    console.log(
      `Approved ${assetsToSwapUserB[0].tokenAddress} contract to swap with 0x. TxHash: ${approvalTxReceipt.transactionHash})`
    );
  }
  // The final step is the taker (User B) submitting the order.
  // The taker approves the trade transaction and it will be submitted on the blockchain for settlement.
  // Once the transaction is confirmed, the trade will be settled and cannot be reversed.
  const fillTx = await nftSwapSdkB.fillSignedOrder(signedOrder);
  const fillTxReceipt = await nftSwapSdkB.awaitTransactionHash(fillTx);
  console.log(`🎉 🥳 Order filled. TxHash: ${fillTxReceipt.transactionHash}`);
}

swapMiladys();