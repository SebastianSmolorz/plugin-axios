import merge from 'lodash.merge'
import Context from '../common/context'
import { ModuleConfig, ModelConfig } from '../support/interfaces'

export default class Action {
  /**
   * Transform Module to include ModuleConfig
   * @param {object} model
   */
  static transformModule(module) {
    return merge({}, ModuleConfig, module)
  }

  /**
   * Transform Model to include ModelConfig
   * @param {object} model
   */
  static transformModel(model) {
    const context = Context.getInstance()
    ModelConfig.http = merge({}, ModelConfig.http, context.options.http)
    model.methodConf = merge({}, ModelConfig, model.methodConf)
    model.methodConf.http.url = model.methodConf.http.url === '/' ? `/${model.entity}` : model.methodConf.http.url

    /**
     * Add Model Interface to each model
     */
    model.getFields = () => {
      if (!model.cachedFields) {
        model.cachedFields = merge(
          {},
          {
            $id: model.attr(undefined),
            $isUpdating: model.boolean(false),
            $updateErrors: model.attr([]),
            $isDeleting: model.boolean(false),
            $deleteErrors: model.attr([]),
          },
          model.fields()
        )
      }

      return model.cachedFields
    }

    return model
  }

  /**
   * Transform Params and Return Endpoint
   * @param {string} type
   * @param {object} model
   * @param {object} config
   */
  static transformParams(type, model, config = {}) {
    let { endpoint } = config
    if (!endpoint) {
      endpoint = `${model.methodConf.http.url}${model.methodConf.methods[type].http.url}`
    }
    let params = (endpoint.match(/(\/?)(:)([A-z]*)/gm) || []).map(param => {
      return param.replace('/', '')
    })

    params.forEach(param => {
      let paramName = param.replace(':', '')
      const paramValue = paramName in config.params ? config.params[paramName] : ''
      endpoint = endpoint.replace(param, paramValue).replace('//', '/')
    })

    const context = Context.getInstance()
    let suffix = context.options.http.suffix
    if (suffix) endpoint += suffix
    if (config.query)
      endpoint += `?${Object.keys(config.query)
        .map(k => `${encodeURIComponent(k)}=${encodeURIComponent(config.query[k])}`)
        .join('&')}`
    return endpoint
  }
}
