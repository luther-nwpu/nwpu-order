/**
 * 用户登录态相关模块
 * 用于处理登录态和存储登录态
 */
import wepy from 'wepy'
import { tryCatch } from '@/lib/helper'
import { serverHost } from '@/config'

// storage key
export const _SESSION_KEY_ = 'session_token'
export const _USERINFO_KEY_ = 'userinfo_token'

/**
 * 登录函数
 */
export async function login (rawData, signature, encryptedData, iv) {
  const [loginResult, loginError] = await tryCatch(wepy.login())

  if (loginError) {
    throw loginError
  }

  const code = loginResult.code
  const [response, requestError] = await tryCatch(wepy.request({
    url: `https://${serverHost}/users`,
    header: { 'content-type': 'application/json' },
    method: 'POST',
    data: { code, rawData, signature, encryptedData, iv }
  }))
  if (requestError) {
    throw requestError
  }

  if (response.statusCode > 400) {
    const e = new Error()
    e.response = response
    throw e
  }
  const data = response.data

    // save token and userinfo
  setToken(data.token)
  setUserInfo(data.userInfo)

  return data
}

/**
 * 仅适用 code 获取 token
 * 用于更新登录态
 */
export async function getTokenWithOutUserInfo () {
  const [loginResult, loginError] = await tryCatch(wepy.login())

  if (loginError) {
    throw loginError
  }

  const code = loginResult.code
  const [response, requestError] = await tryCatch(wepy.request({
    url: `https://${serverHost}/users/session`,
    method: 'POST',
    data: { code }
  }))

  if (requestError) {
    throw requestError
  }

  const data = response.data

    // save token and userinfo
  setToken(data.token)
  setUserInfo(data.userInfo)

  return data
}

/**
 * 获取登录态
 */
export function getToken () {
  return wx.getStorageSync(_SESSION_KEY_)
}

/**
 * 设置登录态token
 */
export function setToken (token) {
  return wx.setStorageSync(_SESSION_KEY_, token)
}

/**
 * 获取用户信息
 */
export function getUserInfo () {
  const raw = wx.getStorageSync(_USERINFO_KEY_)
  return raw ? JSON.parse(raw) : null
}

/**
 * 存储用户信息
 */
export function setUserInfo (userinfo) {
  return wx.setStorageSync(_USERINFO_KEY_, JSON.stringify(userinfo))
}
