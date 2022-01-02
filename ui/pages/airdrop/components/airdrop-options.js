import React, { useContext, useState } from 'react';
import PropTypes from 'prop-types';

import { I18nContext } from '../../../contexts/i18n';
import { Menu, MenuItem } from '../../../components/ui/menu';

const AirdropOptions = ({
  onRemove,
  onClickBlockExplorer,
  onViewAccountDetails,
  tokenSymbol,
  isNativeAirdrop,
  isEthNetwork,
}) => {
  const t = useContext(I18nContext);
  const [airdropOptionsButtonElement, setAirdropOptionsButtonElement] = useState(
    null,
  );
  const [airdropOptionsOpen, setAirdropOptionsOpen] = useState(false);

  return (
    <>
      <button
        className="fas fa-ellipsis-v airdrop-options__button"
        data-testid="airdrop-options__button"
        onClick={() => setAirdropOptionsOpen(true)}
        ref={setAirdropOptionsButtonElement}
        title={t('airdropOptions')}
      />
      {airdropOptionsOpen ? (
        <Menu
          anchorElement={airdropOptionsButtonElement}
          onHide={() => setAirdropOptionsOpen(false)}
        >
          <MenuItem
            iconClassName="fas fa-qrcode"
            data-testid="airdrop-options__account-details"
            onClick={() => {
              setAirdropOptionsOpen(false);
              onViewAccountDetails();
            }}
          >
            {t('accountDetails')}
          </MenuItem>
          <MenuItem
            iconClassName="fas fa-external-link-alt airdrop-options__icon"
            data-testid="airdrop-options__etherscan"
            onClick={() => {
              setAirdropOptionsOpen(false);
              onClickBlockExplorer();
            }}
          >
            {isEthNetwork
              ? t('viewOnEtherscan', [t('blockExplorerAirdropAction')])
              : t('viewinExplorer', [t('blockExplorerAirdropAction')])}
          </MenuItem>
          {isNativeAirdrop ? null : (
            <MenuItem
              iconClassName="fas fa-trash-alt airdrop-options__icon"
              data-testid="airdrop-options__hide"
              onClick={() => {
                setAirdropOptionsOpen(false);
                onRemove();
              }}
            >
              {t('hideTokenSymbol', [tokenSymbol])}
            </MenuItem>
          )}
        </Menu>
      ) : null}
    </>
  );
};

AirdropOptions.propTypes = {
  isEthNetwork: PropTypes.bool,
  isNativeAirdrop: PropTypes.bool,
  onRemove: PropTypes.func.isRequired,
  onClickBlockExplorer: PropTypes.func.isRequired,
  onViewAccountDetails: PropTypes.func.isRequired,
  tokenSymbol: PropTypes.string,
};

export default AirdropOptions;
