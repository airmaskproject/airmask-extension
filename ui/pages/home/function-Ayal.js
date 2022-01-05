import { ethers, utils } from 'ethers';
import { WindowPostMessageStream } from '@metamask/post-message-stream';
import log from 'loglevel';

const handleClickSwap = async (infoProps, infoState) => {
    console.log(infoProps);
    console.log(infoState);
  const providerWeb3 = infoState.providerWeb3;

  try {
    await providerWeb3.send('eth_requestAccounts', []);

     const signer = providerWeb3.getSigner();
     const userAddress = await signer.getAddress();

     console.log(userAddress, 'userAddress');

     const uniswapAddress = '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D';
     const WETH_ADDRESS = '0xc778417e063141139fce010982780140aa0cd5ab';
     const daiAddress = '0x5592ec0cfb4dbc12d3ab100b257153436a1f0fea';

     const uniswap = new ethers.Contract(
       uniswapAddress,
       [
         'function swapExactETHForTokens(uint amountOutMin, address[] calldata path, address to, uint deadline) external payable returns (uint[] memory amounts)',
       ],
       signer,
     );

     const originalAmountToBuyWith = `0.007${Math.random()
       .toString()
       .slice(2, 7)}`;
     let ethAmountToBuyWith = utils.hexlify(
       utils.parseEther(originalAmountToBuyWith),
     );
     console.log(ethAmountToBuyWith, 'ethAmountToBuyWith');
     const amountOutMin = `20${Math.random().toString().slice(2, 6)}`;

     ethAmountToBuyWith = utils.hexlify(ethAmountToBuyWith);

     const deadLine = utils.hexlify(Math.round(Date.now() / 1000) + 60 * 20);

     const gasPrice = 20e9;

     const tx = await uniswap.swapExactETHForTokens(
       amountOutMin,
       [WETH_ADDRESS, daiAddress],
       userAddress,
       deadLine,
       { value: ethAmountToBuyWith, gasPrice },
     );

     // history.push(
     //  `${CONFIRM_TRANSACTION_ROUTE}/ds/${CONFIRM_TOKEN_METHOD_PATH}`,
     // );

     const tokens = [
       {
         address: daiAddress,
         symbol: 'DAI',
         decimals: 18,
       },
     ];

     infoProps.addTokens(tokens);

     console.log(`Transaction hash: ${tx.hash}`);

     const receipt = await tx.wait();
     console.log(`Transaction confirmed in block ${receipt.blockNumber}`);
     console.log(`Gas used: ${receipt.gasUsed.toString()}`);
   } catch (e) {
     console.log(e, 'error');
     if ('message' in e) {
       infoProps.displayWarning(e.message);
     } else {
       infoProps.displayWarning(e);
     }
   }
 };

export default handleClickSwap;