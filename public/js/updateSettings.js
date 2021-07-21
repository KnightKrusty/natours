/* eslint no-use-before-define: 0 */ // --> OFF
// update-Data

import axios from 'axios';
import { async } from 'regenerator-runtime';
import { showAlert } from './alert';

//  type either 'password or data
export const updateSettings = async (data, type) => {
  try {
    const url =
      type === 'password'
        ? '/api/v1/users/updateMyPassword'
        : '/api/v1/users/updateMe';

    const result = await axios({
      method: 'PATCH',
      url,
      data,
    });

    if (result.data.status === 'success') {
      showAlert(
        'success',
        `${type[0].toUpperCase() + type.substring(1)} updated`
      );
      location.reload(true);
    }
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
};
