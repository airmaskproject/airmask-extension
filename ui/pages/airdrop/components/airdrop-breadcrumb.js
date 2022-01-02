import React from 'react';
import PropTypes from 'prop-types';

const AirdropBreadcrumb = ({ accountName, airdropName, onBack }) => {
  return (
    <button className="airdrop-breadcrumb" onClick={onBack}>
      <i
        className="fas fa-chevron-left airdrop-breadcrumb__chevron"
        data-testid="airdrop__back"
      />
      <span>{accountName}</span>
      &nbsp;/&nbsp;
      <span className="airdrop-breadcrumb__airdrop">{airdropName}</span>
    </button>
  );
};

AirdropBreadcrumb.propTypes = {
  accountName: PropTypes.string.isRequired,
  airdropName: PropTypes.string.isRequired,
  onBack: PropTypes.func.isRequired,
};

export default AirdropBreadcrumb;
