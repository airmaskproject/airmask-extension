import log from 'loglevel';
import getFetchWithTimeout from '../../../shared/modules/fetch-with-timeout';
import { SECOND } from '../../../shared/constants/time';

const FETCH_GET_AIRDROPS =
  'http://localhost:4000/api/airdrop/getAirdropsNoFinish';

const fetchWithTimeout = getFetchWithTimeout(SECOND * 30);

export async function getNoFinishAirdrops() {
  let response = [];
  try {
    response = await fetchWithTimeout(FETCH_GET_AIRDROPS, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    });

    const parsedResponse = await response.json();

    if (response.ok) {
      return parsedResponse;
    }

    log.warn('Failed to recover airdrops ', parsedResponse);
  } catch (err) {
    log.warn('Failed to recover airdrops ', err);
  }
  return response;
}
