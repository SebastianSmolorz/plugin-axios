import Axios from '../orm/axios';
import Context from '../common/context';
import Action from './Action';

export default class Fetch extends Action {
  /**
     * Call $fetch method
     * @param {object} store
     * @param {object} params
     * @param {function} callback - called after successful response. This
     * function will be called instead of the default model.insertOrUpdate
     */
  static async call({ state, commit }, params = {}, callback = null) {
    const context = Context.getInstance();
    const model = context.getModelFromState(state);
    const endpoint = Action.transformParams('$fetch', model, params);
    const axios = new Axios(model.methodConf.http);
    const request = axios.get(endpoint);

    this.onRequest(commit);
    request.then(
      data => this.onSuccess(commit, model, data, callback),
    ).catch(
      error => this.onError(commit, error),
    );

    return request;
  }

  /**
   * On Request Method
   * @param {object} commit
   */
  static onRequest(commit) {
    commit('onRequest');
  }

  /**
     * On Successful Request Method
     * @param {object} commit
     * @param {object} model
     * @param {object} data
     * @param {function} callback
     */
  static onSuccess(commit, model, callback = null, { data }) {
    commit('onSuccess');
    if (callback !== null) {
      return new Promise((resolve, reject) => {
        callback(resolve, reject);
      });
    } else {
      model.insertOrUpdate({
        data,
      });
    }
  }

  /**
   * On Failed Request Method
   * @param {object} commit
   * @param {object} error
   */
  static onError(commit, error) {
    commit('onError', error);
  }
}
