import React from 'react';
import PropTypes from 'prop-types';
import { useSelector, useDispatch } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { getAccountLink } from '@metamask/etherscan-link';
import TransactionList from '../../../components/app/transaction-list';
import { EthOverview } from '../../../components/app/wallet-overview';
import {
  getSelectedIdentity,
  getCurrentChainId,
  getRpcPrefsForCurrentProvider,
  getSelectedAddress,
} from '../../../selectors/selectors';
import { showModal } from '../../../store/actions';
import { DEFAULT_ROUTE } from '../../../helpers/constants/routes';
import { getURLHostName } from '../../../helpers/utils/util';
import { useNewMetricEvent } from '../../../hooks/useMetricEvent';
import AirdropNavigation from './airdrop-navigation';
import AirdropOptions from './airdrop-options';

export default function NativeAirdrop({ nativeCurrency }) {
  const selectedAccountName = useSelector(
    (state) => getSelectedIdentity(state).name,
  );
  const dispatch = useDispatch();

  const chainId = useSelector(getCurrentChainId);
  const rpcPrefs = useSelector(getRpcPrefsForCurrentProvider);
  const address = useSelector(getSelectedAddress);
  const history = useHistory();
  const accountLink = getAccountLink(address, chainId, rpcPrefs);

  const blockExplorerLinkClickedEvent = useNewMetricEvent({
    category: 'Navigation',
    event: 'Clicked Block Explorer Link',
    properties: {
      link_type: 'Account Tracker',
      action: 'Airdrop Options',
      block_explorer_domain: getURLHostName(accountLink),
    },
  });

  return (
    <>
      <AirdropNavigation
        accountName={selectedAccountName}
        airdropName={nativeCurrency}
        onBack={() => history.push(DEFAULT_ROUTE)}
        isEthNetwork={!rpcPrefs.blockExplorerUrl}
        optionsButton={
          <AirdropOptions
            isNativeAirdrop
            onClickBlockExplorer={() => {
              blockExplorerLinkClickedEvent();
              global.platform.openTab({
                url: accountLink,
              });
            }}
            onViewAccountDetails={() => {
              dispatch(showModal({ name: 'ACCOUNT_DETAILS' }));
            }}
          />
        }
      />
      <EthOverview className="airdrop__overview" />
      <TransactionList hideTokenTransactions />
    </>
  );
}

NativeAirdrop.propTypes = {
  nativeCurrency: PropTypes.string.isRequired,
};
