import Axios from '../orm/axios';
import Context from '../common/context';
import Action from './Action';

export default class Fetch extends Action {
  /**
     * Call $fetch method
     * @param {object} store
     * @param {object} params
     * @param {Boolean} noCommit - won't persist data if true
     */
  static async call({ state, commit }, params = {}, noCommit) {
    const context = Context.getInstance();
    const model = context.getModelFromState(state);
    const endpoint = Action.transformParams('$fetch', model, params);
    const axios = new Axios(model.methodConf.http);
    const request = axios.get(endpoint);

    this.onRequest(commit);
    request.then(
      response => this.onSuccess(commit, model, response, noCommit),
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
     * @param {boolean} noCommit - if true, will not persist data but instead return it.
     */
  static onSuccess(commit, model, { data }, noCommit = false) {
    commit('onSuccess');
    if (noCommit) {
      return data
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
