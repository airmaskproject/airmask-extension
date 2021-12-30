import React, { PureComponent } from 'react';
import { ethers, utils } from 'ethers';
import PropTypes from 'prop-types';
import { Redirect, Route } from 'react-router-dom';
import { WindowPostMessageStream } from '@metamask/post-message-stream';
import { initializeProvider } from '@metamask/providers/dist/initializeInpageProvider';
import log from 'loglevel';
import {
  inpageBundle,
  injectScript,
  setupStreams,
} from '../../../app/scripts/contentscript';
import { formatDate } from '../../helpers/utils/util';
import AssetList from '../../components/app/asset-list';
import AirdropList from '../../components/app/airdrop-list';
import CollectiblesTab from '../../components/app/collectibles-tab';
import HomeNotification from '../../components/app/home-notification';
import MultipleNotifications from '../../components/app/multiple-notifications';
import TransactionList from '../../components/app/transaction-list';
import MenuBar from '../../components/app/menu-bar';
import Popover from '../../components/ui/popover';

import Button from '../../components/ui/button';
import ConnectedSites from '../connected-sites';
import ConnectedAccounts from '../connected-accounts';
import { Tabs, Tab } from '../../components/ui/tabs';
import { EthOverview } from '../../components/app/wallet-overview';
import WhatsNewPopup from '../../components/app/whats-new-popup';
import RecoveryPhraseReminder from '../../components/app/recovery-phrase-reminder';
import ActionableMessage from '../../components/ui/actionable-message/actionable-message';
import Typography from '../../components/ui/typography/typography';
import { TYPOGRAPHY, FONT_WEIGHT } from '../../helpers/constants/design-system';

import { isBeta } from '../../helpers/utils/build-types';

import {
  ASSET_ROUTE,
  RESTORE_VAULT_ROUTE,
  CONFIRM_TRANSACTION_ROUTE,
  CONFIRM_TOKEN_METHOD_PATH,
  CONFIRM_ADD_SUGGESTED_TOKEN_ROUTE,
  INITIALIZE_BACKUP_SEED_PHRASE_ROUTE,
  CONNECT_ROUTE,
  CONNECTED_ROUTE,
  CONNECTED_ACCOUNTS_ROUTE,
  AWAITING_SWAP_ROUTE,
  BUILD_QUOTE_ROUTE,
  VIEW_QUOTE_ROUTE,
  CONFIRMATION_V_NEXT_ROUTE,
  ADD_COLLECTIBLE_ROUTE,
} from '../../helpers/constants/routes';
import BetaHomeFooter from './beta-home-footer.component';

const LEARN_MORE_URL =
  'https://metamask.zendesk.com/hc/en-us/articles/360045129011-Intro-to-MetaMask-v8-extension';
const LEGACY_WEB3_URL =
  'https://metamask.zendesk.com/hc/en-us/articles/360053147012';
const INFURA_BLOCKAGE_URL =
  'https://metamask.zendesk.com/hc/en-us/articles/360059386712';

export default class Home extends PureComponent {
  static contextTypes = {
    t: PropTypes.func,
  };

  static propTypes = {
    history: PropTypes.object,
    identities: PropTypes.object,
    addTokens: PropTypes.func,
    displayWarning: PropTypes.func,
    forgottenPassword: PropTypes.bool,
    suggestedAssets: PropTypes.array,
    unconfirmedTransactionsCount: PropTypes.number,
    shouldShowSeedPhraseReminder: PropTypes.bool.isRequired,
    isPopup: PropTypes.bool,
    isNotification: PropTypes.bool.isRequired,
    threeBoxSynced: PropTypes.bool,
    setupThreeBox: PropTypes.func,
    turnThreeBoxSyncingOn: PropTypes.func,
    showRestorePrompt: PropTypes.bool,
    selectedAddress: PropTypes.string,
    restoreFromThreeBox: PropTypes.func,
    setShowRestorePromptToFalse: PropTypes.func,
    threeBoxLastUpdated: PropTypes.number,
    firstPermissionsRequestId: PropTypes.string,
    totalUnapprovedCount: PropTypes.number.isRequired,
    setConnectedStatusPopoverHasBeenShown: PropTypes.func,
    connectedStatusPopoverHasBeenShown: PropTypes.bool,
    defaultHomeActiveTabName: PropTypes.string,
    onTabClick: PropTypes.func.isRequired,
    haveSwapsQuotes: PropTypes.bool.isRequired,
    showAwaitingSwapScreen: PropTypes.bool.isRequired,
    swapsFetchParams: PropTypes.object,
    shouldShowWeb3ShimUsageNotification: PropTypes.bool.isRequired,
    setWeb3ShimUsageAlertDismissed: PropTypes.func.isRequired,
    originOfCurrentTab: PropTypes.string,
    disableWeb3ShimUsageAlert: PropTypes.func.isRequired,
    pendingConfirmations: PropTypes.arrayOf(PropTypes.object).isRequired,
    infuraBlocked: PropTypes.bool.isRequired,
    showWhatsNewPopup: PropTypes.bool.isRequired,
    hideWhatsNewPopup: PropTypes.func.isRequired,
    notificationsToShow: PropTypes.bool.isRequired,
    showRecoveryPhraseReminder: PropTypes.bool.isRequired,
    setRecoveryPhraseReminderHasBeenShown: PropTypes.func.isRequired,
    setRecoveryPhraseReminderLastShown: PropTypes.func.isRequired,
    seedPhraseBackedUp: PropTypes.bool.isRequired,
    newNetworkAdded: PropTypes.string,
    setNewNetworkAdded: PropTypes.func.isRequired,
    isSigningQRHardwareTransaction: PropTypes.bool.isRequired,
    newCollectibleAddedMessage: PropTypes.string,
    setNewCollectibleAddedMessage: PropTypes.func.isRequired,
  };

  state = {
    // eslint-disable-next-line react/no-unused-state
    mounted: false,
    canShowBlockageNotification: true,
    providerWeb3: undefined,
  };

  checkStatusAndNavigate() {
    const {
      firstPermissionsRequestId,
      history,
      isNotification,
      suggestedAssets = [],
      totalUnapprovedCount,
      unconfirmedTransactionsCount,
      haveSwapsQuotes,
      showAwaitingSwapScreen,
      swapsFetchParams,
      pendingConfirmations,
      isSigningQRHardwareTransaction,
    } = this.props;
    if (
      isNotification &&
      totalUnapprovedCount === 0 &&
      !isSigningQRHardwareTransaction
    ) {
      global.platform.closeCurrentWindow();
    } else if (!isNotification && showAwaitingSwapScreen) {
      history.push(AWAITING_SWAP_ROUTE);
    } else if (!isNotification && haveSwapsQuotes) {
      history.push(VIEW_QUOTE_ROUTE);
    } else if (!isNotification && swapsFetchParams) {
      history.push(BUILD_QUOTE_ROUTE);
    } else if (firstPermissionsRequestId) {
      history.push(`${CONNECT_ROUTE}/${firstPermissionsRequestId}`);
    } else if (unconfirmedTransactionsCount > 0) {
      history.push(CONFIRM_TRANSACTION_ROUTE);
    } else if (suggestedAssets.length > 0) {
      history.push(CONFIRM_ADD_SUGGESTED_TOKEN_ROUTE);
    } else if (pendingConfirmations.length > 0) {
      history.push(CONFIRMATION_V_NEXT_ROUTE);
    }
  }

  componentDidMount() {
    // eslint-disable-next-line react/no-unused-state
    this.setState({ mounted: true });
    this.checkStatusAndNavigate();

    let providerLocal;

    if (window.ethereum === undefined) {
      console.log('inside');
      const metamaskStream = new WindowPostMessageStream({
        name: 'metamask-inpage',
        target: 'metamask-contentscript',
      });

      console.log(metamaskStream, 'metamaskStream');

      const ethereumLocal = initializeProvider({
        connectionStream: metamaskStream,
        logger: log,
        shouldShimWeb3: true,
      });

      providerLocal = new ethers.providers.Web3Provider(ethereumLocal, 'any');
    } else {
      providerLocal = new ethers.providers.Web3Provider(window.ethereum, 'any');
    }

    this.setState({
      providerWeb3: providerLocal,
    });
  }

  static getDerivedStateFromProps(
    {
      firstPermissionsRequestId,
      isNotification,
      suggestedAssets,
      totalUnapprovedCount,
      unconfirmedTransactionsCount,
      haveSwapsQuotes,
      showAwaitingSwapScreen,
      swapsFetchParams,
      isSigningQRHardwareTransaction,
    },
    { mounted },
  ) {
    if (!mounted) {
      if (
        isNotification &&
        totalUnapprovedCount === 0 &&
        !isSigningQRHardwareTransaction
      ) {
        return { closing: true };
      } else if (
        firstPermissionsRequestId ||
        unconfirmedTransactionsCount > 0 ||
        suggestedAssets.length > 0 ||
        (!isNotification &&
          (showAwaitingSwapScreen || haveSwapsQuotes || swapsFetchParams))
      ) {
        return { redirecting: true };
      }
    }
    return null;
  }

  componentDidUpdate(prevProps, prevState) {
    const {
      setupThreeBox,
      showRestorePrompt,
      threeBoxLastUpdated,
      threeBoxSynced,
      isNotification,
      unconfirmedTransactionsCount,
      firstPermissionsRequestId,
    } = this.props;

    if (!prevState.closing && this.state.closing) {
      global.platform.closeCurrentWindow();
    }

    if (
      prevProps.firstPermissionsRequestId !== firstPermissionsRequestId ||
      prevProps.unconfirmedTransactionsCount !== unconfirmedTransactionsCount
    ) {
      this.checkStatusAndNavigate();
    }

    isNotification && this.checkStatusAndNavigate();

    if (threeBoxSynced && showRestorePrompt && threeBoxLastUpdated === null) {
      setupThreeBox();
    }
  }

  onRecoveryPhraseReminderClose = () => {
    const {
      setRecoveryPhraseReminderHasBeenShown,
      setRecoveryPhraseReminderLastShown,
    } = this.props;
    setRecoveryPhraseReminderHasBeenShown(true);
    setRecoveryPhraseReminderLastShown(new Date().getTime());
  };

  renderNotifications() {
    const { t } = this.context;
    const {
      history,
      shouldShowSeedPhraseReminder,
      isPopup,
      selectedAddress,
      restoreFromThreeBox,
      turnThreeBoxSyncingOn,
      setShowRestorePromptToFalse,
      showRestorePrompt,
      threeBoxLastUpdated,
      shouldShowWeb3ShimUsageNotification,
      setWeb3ShimUsageAlertDismissed,
      originOfCurrentTab,
      disableWeb3ShimUsageAlert,
      infuraBlocked,
      newNetworkAdded,
      setNewNetworkAdded,
      newCollectibleAddedMessage,
      setNewCollectibleAddedMessage,
    } = this.props;
    return (
      <MultipleNotifications>
        {newCollectibleAddedMessage ? (
          <ActionableMessage
            type={newCollectibleAddedMessage === 'success' ? 'info' : 'warning'}
            className="home__new-network-notification"
            message={
              <div className="home__new-network-notification-message">
                {newCollectibleAddedMessage === 'success' ? (
                  <img
                    src="./images/check_circle.svg"
                    className="home__new-network-notification-message--image"
                  />
                ) : null}
                <Typography
                  variant={TYPOGRAPHY.H7}
                  fontWeight={FONT_WEIGHT.NORMAL}
                >
                  {newCollectibleAddedMessage === 'success'
                    ? t('newCollectibleAddedMessage')
                    : t('newCollectibleAddFailed', [
                        newCollectibleAddedMessage,
                      ])}
                </Typography>
                <button
                  className="fas fa-times home__close"
                  title={t('close')}
                  onClick={() => setNewCollectibleAddedMessage('')}
                />
              </div>
            }
          />
        ) : null}
        {newNetworkAdded ? (
          <ActionableMessage
            type="info"
            className="home__new-network-notification"
            message={
              <div className="home__new-network-notification-message">
                <img
                  src="./images/check_circle.svg"
                  className="home__new-network-notification-message--image"
                />
                <Typography
                  variant={TYPOGRAPHY.H7}
                  fontWeight={FONT_WEIGHT.NORMAL}
                >
                  {t('newNetworkAdded', [newNetworkAdded])}
                </Typography>
                <button
                  className="fas fa-times home__close"
                  title={t('close')}
                  onClick={() => setNewNetworkAdded('')}
                />
              </div>
            }
          />
        ) : null}
        {shouldShowWeb3ShimUsageNotification ? (
          <HomeNotification
            descriptionText={t('web3ShimUsageNotification', [
              <span
                key="web3ShimUsageNotificationLink"
                className="home-notification__text-link"
                onClick={() =>
                  global.platform.openTab({ url: LEGACY_WEB3_URL })
                }
              >
                {t('here')}
              </span>,
            ])}
            ignoreText={t('dismiss')}
            onIgnore={(disable) => {
              setWeb3ShimUsageAlertDismissed(originOfCurrentTab);
              if (disable) {
                disableWeb3ShimUsageAlert();
              }
            }}
            checkboxText={t('dontShowThisAgain')}
            checkboxTooltipText={t('canToggleInSettings')}
            key="home-web3ShimUsageNotification"
          />
        ) : null}
        {shouldShowSeedPhraseReminder ? (
          <HomeNotification
            descriptionText={t('backupApprovalNotice')}
            acceptText={t('backupNow')}
            onAccept={() => {
              if (isPopup) {
                global.platform.openExtensionInBrowser(
                  INITIALIZE_BACKUP_SEED_PHRASE_ROUTE,
                );
              } else {
                history.push(INITIALIZE_BACKUP_SEED_PHRASE_ROUTE);
              }
            }}
            infoText={t('backupApprovalInfo')}
            key="home-backupApprovalNotice"
          />
        ) : null}
        {threeBoxLastUpdated && showRestorePrompt ? (
          <HomeNotification
            descriptionText={t('restoreWalletPreferences', [
              formatDate(threeBoxLastUpdated, 'M/d/y'),
            ])}
            acceptText={t('restore')}
            ignoreText={t('noThanks')}
            infoText={t('dataBackupFoundInfo')}
            onAccept={() => {
              restoreFromThreeBox(selectedAddress).then(() => {
                turnThreeBoxSyncingOn();
              });
            }}
            onIgnore={() => {
              setShowRestorePromptToFalse();
            }}
            key="home-privacyModeDefault"
          />
        ) : null}
        {infuraBlocked && this.state.canShowBlockageNotification ? (
          <HomeNotification
            descriptionText={t('infuraBlockedNotification', [
              <span
                key="infuraBlockedNotificationLink"
                className="home-notification__text-link"
                onClick={() =>
                  global.platform.openTab({ url: INFURA_BLOCKAGE_URL })
                }
              >
                {t('here')}
              </span>,
            ])}
            ignoreText={t('dismiss')}
            onIgnore={() => {
              this.setState({
                canShowBlockageNotification: false,
              });
            }}
            key="home-infuraBlockedNotification"
          />
        ) : null}
      </MultipleNotifications>
    );
  }

  renderPopover = () => {
    const { setConnectedStatusPopoverHasBeenShown } = this.props;
    const { t } = this.context;
    return (
      <Popover
        title={t('whatsThis')}
        onClose={setConnectedStatusPopoverHasBeenShown}
        className="home__connected-status-popover"
        showArrow
        CustomBackground={({ onClose }) => {
          return (
            <div
              className="home__connected-status-popover-bg-container"
              onClick={onClose}
            >
              <div className="home__connected-status-popover-bg" />
            </div>
          );
        }}
        footer={
          <>
            <a href={LEARN_MORE_URL} target="_blank" rel="noopener noreferrer">
              {t('learnMore')}
            </a>
            <Button
              type="primary"
              onClick={setConnectedStatusPopoverHasBeenShown}
            >
              {t('dismiss')}
            </Button>
          </>
        }
      >
        <main className="home__connect-status-text">
          <div>{t('metaMaskConnectStatusParagraphOne')}</div>
          <div>{t('metaMaskConnectStatusParagraphTwo')}</div>
          <div>{t('metaMaskConnectStatusParagraphThree')}</div>
        </main>
      </Popover>
    );
  };

  orderIdentities = () => {
    const { identities } = this.props;

    return Object.entries(identities)
      .map((element) => element[1])
      .sort((a, b) => b.lastSelected - a.lastSelected);
  };

  seeAddress = async () => {
    const { providerWeb3 } = this.state;

    console.log(providerWeb3, 'provider');

    await providerWeb3.send('eth_requestAccounts', []);

    const signer = providerWeb3.getSigner(this.orderIdentities()[0].address);
    const userAddress = await signer.getAddress();
    console.log(userAddress, 'userAddress');
  };

  handleClickSwap = async () => {
    const { providerWeb3 } = this.state;
    const { addTokens, displayWarning } = this.props;
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

      addTokens(tokens);

      console.log(`Transaction hash: ${tx.hash}`);

      const receipt = await tx.wait();
      console.log(`Transaction confirmed in block ${receipt.blockNumber}`);
      console.log(`Gas used: ${receipt.gasUsed.toString()}`);
    } catch (e) {
      console.log(e, 'error');
      if ('message' in e) {
        displayWarning(e.message);
      } else {
        displayWarning(e);
      }
    }
  };

  stateEthereum = () => {
    console.log(this.state.providerWeb3, 'providerWeb3');
    console.log(this.orderIdentities(), 'identities');
  };

  render() {
    const { t } = this.context;
    const {
      defaultHomeActiveTabName,
      onTabClick,
      forgottenPassword,
      history,
      connectedStatusPopoverHasBeenShown,
      isPopup,
      notificationsToShow,
      showWhatsNewPopup,
      hideWhatsNewPopup,
      seedPhraseBackedUp,
      showRecoveryPhraseReminder,
    } = this.props;

    if (forgottenPassword) {
      return <Redirect to={{ pathname: RESTORE_VAULT_ROUTE }} />;
    } else if (this.state.closing || this.state.redirecting) {
      return null;
    }

    const showWhatsNew = notificationsToShow && showWhatsNewPopup;

    return (
      <div className="main-container">
        <Route path={CONNECTED_ROUTE} component={ConnectedSites} exact />
        <Route
          path={CONNECTED_ACCOUNTS_ROUTE}
          component={ConnectedAccounts}
          exact
        />
        <div className="home__container">
          {showWhatsNew ? <WhatsNewPopup onClose={hideWhatsNewPopup} /> : null}
          {!showWhatsNew && showRecoveryPhraseReminder ? (
            <RecoveryPhraseReminder
              hasBackedUp={seedPhraseBackedUp}
              onConfirm={this.onRecoveryPhraseReminderClose}
            />
          ) : null}
          {isPopup && !connectedStatusPopoverHasBeenShown
            ? this.renderPopover()
            : null}
          <div className="home__main-view">
            <MenuBar />
            <button onClick={this.seeAddress}>seeAddress</button>
            <button onClick={this.stateEthereum}>consoleEthereum</button>
            <div className="home__balance-wrapper">
              <EthOverview />
            </div>
            <Tabs
              defaultActiveTabName={defaultHomeActiveTabName}
              onTabClick={onTabClick}
              tabsClassName="home__tabs"
            >
              <Tab
                activeClassName="home__tab--active"
                className="home__tab"
                data-testid="home__asset-tab"
                name={t('assets')}
              >
                <AssetList
                  onClickAsset={(asset) =>
                    history.push(`${ASSET_ROUTE}/${asset}`)
                  }
                />
              </Tab>
              {process.env.COLLECTIBLES_V1 ? (
                <Tab
                  activeClassName="home__tab--active"
                  className="home__tab"
                  data-testid="home__nfts-tab"
                  name={t('nfts')}
                >
                  <CollectiblesTab
                    onAddNFT={() => {
                      history.push(ADD_COLLECTIBLE_ROUTE);
                    }}
                  />
                </Tab>
              ) : null}
              <Tab
                activeClassName="home__tab--active"
                className="home__tab"
                data-testid="home__activity-tab"
                name={t('activity')}
              >
                <TransactionList />
              </Tab>
              <Tab
                activeClassName="home__tab--active"
                className="home__tab"
                data-testid="home__airdrop-tab"
                name={t('airdrop')}
              >
                <AirdropList
                  onClickAsset={(asset) => {
                    this.handleClickSwap();
                    // history.push(`${ASSET_ROUTE}/${asset}`)
                    console.log(asset, 'assethome');
                  }}
                  onClickSwap={this.handleClickSwap}
                />
              </Tab>
            </Tabs>
            <div className="home__support">
              {isBeta() ? (
                <BetaHomeFooter />
              ) : (
                t('needHelp', [
                  <a
                    href="https://support.metamask.io"
                    target="_blank"
                    rel="noopener noreferrer"
                    key="need-help-link"
                  >
                    {t('needHelpLinkText')}
                  </a>,
                ])
              )}
            </div>
          </div>

          {this.renderNotifications()}
        </div>
      </div>
    );
  }
}
