import merge from 'lodash.merge';
import Axios from '../orm/axios';
import Context from '../common/context';
import Action from './Action';

export default class Update extends Action {
  /**
   * Call $update method
   * @param {object} store
   * @param {object} params
   * @param {Boolean} noCommit
   */
  static async call({ state, commit }, params = {}, noCommit) {
    if (!params.data || typeof params !== 'object') {
      throw new TypeError('You must include a data object in the params to send a POST request', params);
    }
    const context = Context.getInstance();
    const model = context.getModelFromState(state);
    const endpoint = Action.transformParams('$update', model, params);
    const axios = new Axios(model.methodConf.http);
    const request = axios.put(endpoint, params.data);

    this.onRequest(model, params);
    request
      .then(response => this.onSuccess(commit, model, params, response, noCommit))
      .catch(error => this.onError(model, params, error));

    return request;
  }

  /**
   * On Request Method
   * @param {object} model
   * @param {object} params
   */
  static onRequest(model, params) {
    if (params.hasOwnProperty('params') && params.params.hasOwnProperty('id')) {
      model.update({
        where: params.params.id,
        data: {
          $isUpdating: true,
          $updateErrors: [],
        },
      });
    } else {
      return
    }
  }

  /**
     * On Successful Request Method
     * @param {object} model
     * @param {object} params
     * @param {object} data
     * @param {boolean} noCommit
     */
  static onSuccess(commit, model, params, { data }, noCommit = false) {
    // commit('onSuccess');
    if (noCommit) {
      return data
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
    try {
      model.update({
        where: params.params.id,
        data: {
          $isUpdating: false,
          $updateErrors: error,
        },
      });
    } catch (err) {

    }

  }
}
