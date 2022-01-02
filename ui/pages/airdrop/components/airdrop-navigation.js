import React from 'react';
import PropTypes from 'prop-types';

import AirdropBreadcrumb from './airdrop-breadcrumb';

const AirdropNavigation = ({ accountName, airdropName, onBack, optionsButton }) => {
  return (
    <div className="airdrop-navigation">
      <AirdropBreadcrumb
        accountName={accountName}
        airdropName={airdropName}
        onBack={onBack}
      />
      {optionsButton}
    </div>
  );
};

AirdropNavigation.propTypes = {
  accountName: PropTypes.string.isRequired,
  airdropName: PropTypes.string.isRequired,
  onBack: PropTypes.func.isRequired,
  optionsButton: PropTypes.element,
};

AirdropNavigation.defaultProps = {
  optionsButton: undefined,
};

export default AirdropNavigation;
