import merge from 'lodash.merge';
import Axios from '../orm/axios';
import Context from '../common/context';
import Action from './Action';

export default class Update extends Action {
  /**
   * Call $update method
   * @param {object} store
   * @param {object} params
   * @param {function} callback
   */
  static async call({ state, commit }, params = {}) {
    if (!params.data || typeof params !== 'object') {
      throw new TypeError('You must include a data object in the params to send a POST request', params);
    }
    const context = Context.getInstance();
    const model = context.getModelFromState(state);
    const endpoint = Action.transformParams('$update', model, params);
    const axios = new Axios(model.methodConf.http);
    const request = axios.put(endpoint, params.data);

    this.onRequest(model, params);

    let onSuccessCallback;
    if (params.onSuccess && params.onSuccess !== undefined) {
      onSuccessCallback = params.onSuccess;
    }
    request
      .then(data => this.onSuccess(model, params, data, onSuccessCallback))
      .catch(error => this.onError(model, params, error));

    return request;
  }

  /**
   * On Request Method
   * @param {object} model
   * @param {object} params
   */
  static onRequest(model, params) {
    try {
      model.update({
        where: params.params.id,
        data: {
          $isUpdating: true,
          $updateErrors: [],
        },
      });
    } catch (e) {
      console.log('Couldn\t commit onRequest update. !Ignoring')
    }
  }

  /**
     * On Successful Request Method
     * @param {object} model
     * @param {object} params
     * @param {object} data
     * @param {function} callback(context, resolve, reject)
     */
  static onSuccess(model, params, data, callback) {
    if (callback !== undefined) {
      console.log('HasCallback')
      return callback({ model, params, data });
    }
    model.update({
      where: params.params.id || data.id,
      data: merge({}, data, {
        $isUpdating: false,
        $updateErrors: [],
      }),
    });
  }

  /**
   * On Failed Request Method
   * @param {object} model
   * @param {object} params
   * @param {object} error
   */
  static onError(model, params, error) {
    model.update({
      where: params.params.id,
      data: {
        $isUpdating: false,
        $updateErrors: error,
      },
    });
  }
}
