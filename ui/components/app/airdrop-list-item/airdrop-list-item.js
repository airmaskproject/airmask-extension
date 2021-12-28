import React, { useMemo } from 'react';
import { ethers, utils } from 'ethers';

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
import {
  ASSET_TYPES,
  updateSendAsset,
  signTransaction,
} from '../../../ducks/send';
import { SEND_ROUTE } from '../../../helpers/constants/routes';
import { SEVERITIES } from '../../../helpers/constants/design-system';

const AirdropListItem = ({
  className,
  'data-testid': dataTestId,
  iconClassName,
  onClick,
  onClickSwap,
  tokenAddress,
  tokenSymbol,
  tokenDecimals,
  tokenImage,
  typeSwap,
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

  return (
    <ListItem
      className={classnames('airdrop-list-item', className)}
      data-testid={dataTestId}
      title={
        <button
          className="airdrop-list-item__token-button"
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
          style={{ display: 'flex', justifyContent: 'end' }}
          diameter={32}
          address={tokenAddress}
          image={tokenImage}
          alt={`${primary} ${tokenSymbol}`}
          imageBorder={identiconBorder}
        />
      }
      midContent={midContent}
      rightContent={
        typeSwap && (
          <IconButton
            className="eth-overview__button"
            disabled={false}
            Icon={SwapIcon}
            onClick={onClickSwap}
            label="Airdrop Uniswap"
            tooltipRender={(contents) => (
              <Tooltip
                title={t('swapAirdrop')}
                position="bottom"
                disabled={false}
              >
                {contents}
              </Tooltip>
            )}
          />
        )
      }
      classNameRight="airdrop-list-item__airdrop"
    />
  );
};

AirdropListItem.propTypes = {
  className: PropTypes.string,
  'data-testid': PropTypes.string,
  iconClassName: PropTypes.string,
  typeSwap: PropTypes.bool,
  onClick: PropTypes.func.isRequired,
  onClickSwap: PropTypes.func,
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
