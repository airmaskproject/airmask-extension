import React, { useMemo } from 'react';
import Web3 from 'web3';
import tx from 'ethereumjs-tx';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import { useDispatch } from 'react-redux';
import { useHistory } from 'react-router-dom';
import Identicon from '../../ui/identicon';
import ListItem from '../../ui/list-item';
import Tooltip from '../../ui/tooltip';
import InfoIcon from '../../ui/icon/info-icon.component';
import IconButton from '../../ui/icon-button';
import SwapIcon from '../../ui/icon/swap-icon.component';

import Button from '../../ui/button';
import { useI18nContext } from '../../../hooks/useI18nContext';
import { useMetricEvent } from '../../../hooks/useMetricEvent';
import { ASSET_TYPES, updateSendAsset } from '../../../ducks/send';
import { SEND_ROUTE } from '../../../helpers/constants/routes';
import { SEVERITIES } from '../../../helpers/constants/design-system';
import { signTransaction } from '../../../ducks/send';
import BigNumber from 'bignumber.js';

const uniswapAbi = require('../../../../shared/constants/uniswapAbi.json');

const AirdropListItem = ({
  className,
  'data-testid': dataTestId,
  iconClassName,
  onClick,
  tokenAddress,
  tokenSymbol,
  tokenDecimals,
  tokenImage,
  warning,
  primary,
  secondary,
  identiconBorder,
  isERC721,
}) => {
  const t = useI18nContext();
  const dispatch = useDispatch();
  const history = useHistory();
  const sendTokenEvent = useMetricEvent({
    eventOpts: {
      category: 'Navigation',
      action: 'Home',
      name: 'Clicked Send: Token',
    },
  });

  // console.log(className);
  // console.log(iconClassName);
  // console.log(onClick);
  // console.log(tokenAddress);
  // console.log(tokenSymbol);
  // console.log(tokenDecimals);
  // console.log(tokenImage);
  // console.log(warning);
  // console.log(primary);
  // console.log(secondary);
  // console.log(identiconBorder);
  // console.log(isERC721);
  const titleIcon = warning ? (
    <Tooltip
      wrapperClassName="airdrop-list-item__warning-tooltip"
      interactive
      position="bottom"
      html={warning}
    >
      <InfoIcon severity={SEVERITIES.WARNING} />
    </Tooltip>
  ) : null;

  const midContent = warning ? (
    <>
      <InfoIcon severity={SEVERITIES.WARNING} />
      <div className="airdrop-list-item__warning">{warning}</div>
    </>
  ) : null;

  // const sendTokenButton = useMemo(() => {
  //   if (tokenAddress === null || tokenAddress === undefined) {
  //     return null;
  //   }
  //   return (
  //     <Button
  //       type="link"
  //       className="airdrop-list-item__send-token-button"
  //       onClick={(e) => {
  //         e.stopPropagation();
  //         sendTokenEvent();
  //         dispatch(
  //           updateSendAsset({
  //             type: ASSET_TYPES.TOKEN,
  //             details: {
  //               address: tokenAddress,
  //               decimals: tokenDecimals,
  //               symbol: tokenSymbol,
  //             },
  //           }),
  //         ).then(() => {
  //           history.push(SEND_ROUTE);
  //         });
  //       }}
  //     >
  //       {t('sendSpecifiedTokens', [tokenSymbol])}
  //     </Button>
  //   );
  // }, [
  //   tokenSymbol,
  //   sendTokenEvent,
  //   tokenAddress,
  //   tokenDecimals,
  //   history,
  //   t,
  //   dispatch,
  // ]);

  const swapTestToBeDone = (evt) => {
    evt.preventDefault();
    // const token = global.eth.contract(abi).at(asset.details.address);
    // token.transfer(address, value, {
    //   ...txParams,
    //   to: undefined,
    //   data: undefined,
    // });
    const uniswapAddress = '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D';
    const wethAddress = '0xc778417e063141139fce010982780140aa0cd5ab';
    const daiAddress = '0x5592ec0cfb4dbc12d3ab100b257153436a1f0fea';
    const accountfrom = '0x6a70A961Fca94AaB6612660e30A7b6Fdc57a4a9E';
    // const contractUniswap = new global.eth.contract(uniswapAbi).at(
    //   uniswapAddress,
    // );

    // const deadLine = new BigNumber(Math.round(Date.now() / 1000) + 60 * 20);
    // const amountOut = new BigNumber('0');

    // (async () => {
    //   debugger;
    //   const result = await contractUniswap.swapExactETHForTokens(
    //     amountOut,
    //     [wethAddress, daiAddress],
    //     accountfrom,
    //     deadLine,
    //   );
    //   console.log(result);
    // })();

    // amountOut n'est pas adapté, voir ce que BigNumber attend.
    // new global.eth.contract(uniswapAbi) ==> construction d'un contrat (voir 1564 dans ducks/send)

    const web3 = new Web3(
      'https://rinkeby.infura.io/v3/a08fb9ab18f942a7871fdec1ae4c922a',
    );

    const Tx = tx.Transaction;

    const PRIVATEKEYROPSTEN3 = '7ea92f380eb6895cb719a51ef9556ec7a2093c24b20282f443a991c4eb4a831f';
    const privateKey3 = Buffer.from(PRIVATEKEYROPSTEN3, 'hex');

    const originalAmountToBuyWith = `0.007${Math.random()
      .toString()
      .slice(2, 7)}`;
    let ethAmountToBuyWith = web3.utils.toWei(originalAmountToBuyWith, 'ether');
    const amountOutMin = `20${Math.random().toString().slice(2, 6)}`;

    ethAmountToBuyWith = web3.utils.toHex(ethAmountToBuyWith);

    const deadLine = web3.utils.toHex(Math.round(Date.now() / 1000) + 60 * 20);

    const contractUniswap = new web3.eth.Contract(uniswapAbi, uniswapAddress, {
      from: accountfrom,
    });

    const data = contractUniswap.methods.swapExactETHForTokens(
        web3.utils.toHex(amountOutMin),
        [WETH_ADDRESS,daiAddress],
        accountFrom,
        deadLine
    )

    // web3.eth.getTransactionCount(account3, (err, txCount) => {
    //   const txObject = {
    //     nonce: web3.utils.toHex(txCount),
    //     from: account3,
    //     gasLimit: web3.utils.toHex(210000),
    //     gasPrice: web3.utils.toHex(web3.utils.toWei('100', 'gwei')),
    //     to: uniswapAddress,
    //     value: web3.utils.toHex(ethAmountToBuyWith),
    //     data: data.encodeABI(),
    //   };

    //   const tx = new Tx(txObject, { chain: 'rinkeby' });
    //   tx.sign(privateKey3);

    //   const serializedTx = tx.serialize();
    //   const raw = '0x' + serializedTx.toString('hex');

    //   web3.eth.sendSignedTransaction(raw, (err, txHash) => {
    //     console.log('err: ', err, 'txHash: ', txHash);
    //   });
    // });

    // global.ethQuery.sendTransaction(txParams, (err) => {
    //   if (err) {
    //     dispatch(displayWarning(err.message));
    //   }
    // });
  };

  const airdropButton = useMemo(() => {
    return (
      <IconButton
        className="eth-overview__button"
        disabled={false}
        Icon={SwapIcon}
        onClick={swapTestToBeDone}
        label="Airdrop"
        tooltipRender={(contents) => (
          <Tooltip
            title={t('currentlyUnavailable')}
            position="bottom"
            disabled={false}
          >
            {contents}
          </Tooltip>
        )}
      />
    );
  });

  return (
    <ListItem
      className={classnames('airdrop-list-item', className)}
      data-testid={dataTestId}
      title={
        <button
          className="airdrop-list-item__token-button"
          onClick={onClick}
          title={`${primary} ${tokenSymbol}`}
        >
          <h2>
            <span className="airdrop-list-item__token-value">{primary}</span>
            <span className="airdrop-list-item__token-symbol">
              {tokenSymbol}
            </span>
          </h2>
        </button>
      }
      titleIcon={titleIcon}
      subtitle={secondary ? <h3 title={secondary}>{secondary}</h3> : null}
      onClick={onClick}
      icon={
        <Identicon
          className={iconClassName}
          diameter={32}
          address={tokenAddress}
          image={tokenImage}
          alt={`${primary} ${tokenSymbol}`}
          imageBorder={identiconBorder}
        />
      }
      midContent={midContent}
      rightContent={airdropButton}
    />
  );
};

AirdropListItem.propTypes = {
  className: PropTypes.string,
  'data-testid': PropTypes.string,
  iconClassName: PropTypes.string,
  onClick: PropTypes.func.isRequired,
  tokenAddress: PropTypes.string,
  tokenSymbol: PropTypes.string,
  tokenDecimals: PropTypes.number,
  tokenImage: PropTypes.string,
  warning: PropTypes.node,
  primary: PropTypes.string,
  secondary: PropTypes.string,
  identiconBorder: PropTypes.bool,
  isERC721: PropTypes.bool,
};

AirdropListItem.defaultProps = {
  className: undefined,
  'data-testid': undefined,
  iconClassName: undefined,
  tokenAddress: undefined,
  tokenImage: undefined,
  warning: undefined,
};

export default AirdropListItem;
