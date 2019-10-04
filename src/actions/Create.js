import Axios from '../orm/axios'
import Context from '../common/context'
import Action from './Action'

export default class Create extends Action {
  /**
   * Call $create method
   * @param {object} store
   * @param {object} params
   */
  static async call({ state, commit }, params = {}, noCommit = false) {
    if (!params.data || typeof params !== 'object') {
      throw new TypeError('You must include a data object in the params to send a POST request', params)
    }

    const context = Context.getInstance()
    const model = context.getModelFromState(state)
    const endpoint = Action.transformParams('$create', model, params)
    const axios = new Axios(model.methodConf.http)
    const request = axios.post(endpoint, params.data)

    this.onRequest(commit)
    request.then(response => this.onSuccess(commit, model, response, noCommit)).catch(error => this.onError(commit, error))

    return request
  }

  /**
   * On Request Method
   * @param {object} commit
   */
  static onRequest(commit) {
    commit('onRequest')
  }

  /**
   * On Successful Request Method
   * @param {object} commit
   * @param {object} model
   * @param {object} data
   */
  static onSuccess(commit, model, { data }, noCommit) {
    commit('onSuccess')
    if (noCommit) { return }
    model.insertOrUpdate({
      data,
    })
  }

  /**
   * On Failed Request Method
   * @param {object} commit
   * @param {object} error
   */
  static onError(commit, error) {
    commit('onError', error)
  }
}
