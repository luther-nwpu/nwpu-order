/**
 * 请求统一封装
 */
import wepy from 'wepy'
import { serverHost } from '@/config'
import { getTokenWithOutUserInfo, getToken } from '@/lib/session'
import { tryCatch } from '@/lib/helper'

const supportMethods = new Set(['OPTIONS', 'GET', 'HEAD', 'POST', 'PUT', 'DELETE', 'TRACE', 'CONNECT'])

const request = async function (opts) {
  const url = opts.url.startsWith('https') ? opts.url : `https://${serverHost}${opts.url}`
  const token = getToken()

    // 默认 method
  opts.method = opts.method ? opts.method.toUpperCase() : 'GET'

    // 替换请求 url
  opts.url = url

    /**
     * 在 header 插入登录态
     * 只有明确将 opts.login 设置为 false 才不带登录态
     * 包括不设置 opts.login 都视为要登录
     */
  if (opts.login !== false) {
    opts.header = opts.header ? Object.assign({}, { Authorization: token }, opts.header) : { Authorization: token }
  }

  if (!supportMethods.has(opts.method)) {
    throw new Error('[Request] Not support method:', opts.method)
  }

  let [response, requestError] = await tryCatch(wepy.request(opts))

    /**
     * 这个错误是请求本身错误
     * 所有的返回码判断都在 response 进行
     */
  if (requestError) {
    throw requestError
  }

  const statusCode = response.statusCode

    /**
     * 这里做个 hack
     * 如果请求返回的是 401，也就是没有授权
     * 则为 token 过期，自动登录并重新请求
     */
  if (statusCode === 401 && opts.login !== false) {
        // 重新登录
    await getTokenWithOutUserInfo()

        // 重新获取 token，重新请求
    opts.header.Authorization = getToken()
    response = wepy.request(opts)
  }

  if (response.statusCode >= 400) {
    throw new HttpError(response)
  }

  return response
}

export class HttpError extends Error {
  constructor (response) {
    super()
    this.response = response
    this.statusCode = response.statusCode
    this.data = response.data
  }
}

// 增加 alias
export function get (uri, data = {}, opts = {}) {
  return request(Object.assign({}, {
    url: uri,
    data: data,
    method: 'GET'
  }, opts))
}

export function post (uri, data = {}, opts = {}) {
  return request(Object.assign({}, {
    url: uri,
    data: data,
    method: 'POST'
  }, opts))
}

export function put (uri, data = {}, opts = {}) {
  return request(Object.assign({}, {
    url: uri,
    data: data,
    method: 'PUT'
  }, opts))
}

export function del (uri, data = {}, opts = {}) {
  return request(Object.assign({}, {
    url: uri,
    data: data,
    method: 'DELETE'
  }, opts))
}

/**
 * 封装 wx.uploadFile 模块
 * 具体参数与官方 API 相同：
 * https://developers.weixin.qq.com/miniprogram/dev/api/network-file.html#wxuploadfileobject
 */
export function uploadFile (opts) {
  const url = opts.url.startsWith('https') ? opts.url : `https://${serverHost}${opts.url}`
  const token = getToken()

    // 替换请求 url
  opts.url = url

    /**
     * 在 header 插入登录态
     * 只有明确将 opts.login 设置为 false 才不带登录态
     * 包括不设置 opts.login 都视为要登录
     */
  if (opts.login !== false) {
    opts.header = opts.header ? Object.assign({}, { Authorization: token }, opts.header) : { Authorization: token }
  }

  delete opts.login

  return wepy.uploadFile(opts)
}

export default request
