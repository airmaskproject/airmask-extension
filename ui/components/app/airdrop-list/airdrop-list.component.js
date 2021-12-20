import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useI18nContext } from '../../../hooks/useI18nContext';
import ListAirdrop from '../../ui/list-airdrop/list-airdrop.component';
// import Button from '../../ui/button';

// const PAGE_INCREMENT = 10;

export default function AirdropList({ data }) {
  // const [limit, setLimit] = useState(PAGE_INCREMENT);
  const [dataset, setDataset] = useState(data);
  const t = useI18nContext();

  // const viewMore = useCallback(
  //   () => setLimit((prev) => prev + PAGE_INCREMENT),
  //   [],
  // );

  useEffect(() => {
    console.log(data, 'data');
    setDataset(data);
  }, [data]);

  console.log(data);

  return (
    <div className="transaction-list">
      <div className="transaction-list__transactions">
        {data.length > 0 && (
          <div className="transaction-list__pending-transactions">
            {dataset.map((datasetUnit, index) => (
              <ListAirdrop transactionGroup={datasetUnit} key={index} />
            ))}
          </div>
        )}

        {/* <div className="transaction-list__completed-transactions">
          {data > 0 ? (
            <div className="transaction-list__header">{t('history')}</div>
          ) : null}
          {completedTransactions.length > 0 ? (
            completedTransactions
              .slice(0, limit)
              .map((transactionGroup, index) => (
                <ListItem
                  transactionGroup={transactionGroup}
                  key={`${transactionGroup.nonce}:${limit + index - 10}`}
                />
              ))
          ) : (
            <div className="transaction-list__empty">
              <div className="transaction-list__empty-text">
                {t('noTransactions')}
              </div>
            </div>
          )}
          {completedTransactions.length > limit && (
            <Button
              className="transaction-list__view-more"
              type="secondary"
              onClick={viewMore}
            >
              {t('viewMore')}
            </Button>
          )}
        </div> */}
      </div>
    </div>
  );
}

AirdropList.propTypes = {
  data: PropTypes.array,
};
