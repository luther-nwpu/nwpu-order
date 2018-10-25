/**
 * 公众平台相关接口封装
 */
import axios from 'axios'
import { WX_APPID, WX_APPSECRET, WX_MP_APPID, WX_MP_APPSECRET } from '@config'
import { tryCatch } from '@libs/util'
import redis from '@libs/redis'
import { promisify } from 'util'

/**
 * 由于我们有多个账号
 * 这里提供多账号功能
 * weapp: 小程序
 * mp: 微信服务号
 */
const accounts = {
    weapp: {
        appid: WX_APPID,
        appsecret: WX_APPSECRET
    },
    mp: {
        appid: WX_MP_APPID,
        appsecret: WX_MP_APPSECRET
    }
}

/**
 * 刷新、重新获取 AccessToken
 */
export async function renewAccessToken (account: string = 'weapp'): Promise<ATPack> {
    const config = accounts[account]
    const res = await axios.get(`https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=${config.appid}&secret=${config.appsecret}`)

    if (res.data.errcode) {
        throw new Error(res.data.errmsg)
    }

    const pack = res.data
    pack.expires_in = pack.expires_in * 1000
    pack.create_at = Date.now()

    // 储存到 redis
    await promisify(redis.set).bind(redis)(`AT:${account}`, JSON.stringify(pack))

    return pack as ATPack
}

export async function getAccessToken (account: string = 'weapp'): Promise<ATPack> {
    const packRaw = await promisify(redis.get).bind(redis)(`AT:${account}`)

    if (!packRaw) {
        return renewAccessToken(account)
    }

    const pack = JSON.parse(packRaw)

    if (pack.create_at + pack.expires_in < Date.now()) {
        return renewAccessToken(account)
    }

    return pack as ATPack
}

export enum Templates {
    inform = 'p3B9IvvMT-QvBhVpyZqLAb0Qnp7s8CClx8ubWK8OygM'
}

export async function weappSendTemplateMessage (tempId: Templates, formId: string, to: string, data: any) {
    const atPack = await getAccessToken('weapp')
    const url = `https://api.weixin.qq.com/cgi-bin/message/wxopen/template/send?access_token=${atPack.access_token}`
    const reqPack = {
        touser: to,
        template_id: tempId,
        page: '/pages/task/index?from=inform',
        form_id: formId,
        data
    }

    const res = await axios.post(url, reqPack)

    if (res.data.errcode !== 0) {
        throw new Error(res.data.errmsg)
    }

    return res.data
}

export interface ATPack {
    access_token: string
    expires_in: string
    create_at: string
}
