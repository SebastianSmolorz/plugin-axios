import merge from 'lodash.merge'
import Axios from '../orm/axios'
import Context from '../common/context'
import Action from './Action'

export default class Update extends Action {
    /**
     * Call $update method
     * @param {object} store
     * @param {object} params
     * @param {boolean} save
     */
  static async call({ state, commit }, params = {}, callback = null) {
    if (!params.data || typeof params !== 'object') {
      throw new TypeError('You must include a data object in the params to send a POST request', params);
    }
    const context = Context.getInstance()
    const model = context.getModelFromState(state)
    const endpoint = Action.transformParams('$update', model, params)
    const axios = new Axios(model.methodConf.http)
    const request = axios.put(endpoint, params.data)

    this.onRequest(model, params);
    request
      .then(data => this.onSuccess(model, params, data, callback))
      .catch(error => this.onError(model, params, error));

    return request
  }

  /**
   * On Request Method
   * @param {object} model
   * @param {object} params
   */
  static onRequest(model, params) {
    model.update({
      where: params.params.id,
      data: {
        $isUpdating: true,
        $updateErrors: [],
      },
    });
  }

  /**
     * On Successful Request Method
     * @param {object} model
     * @param {object} params
     * @param {object} data
     * @param {function} callback(context, resolve, reject)
     */
  static onSuccess(model, params, data, callback) {
    if (callback !== null) {
      return new Promise((resolve, reject) => {
        callback({model, params, data}, resolve, reject);
      });
    } else {
      model.update({
        where: params.params.id || data.id,
        data: merge({}, data, {
          $isUpdating: false,
          $updateErrors: [],
        }),
      });
    }
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
