import { IWxInfo } from '@types'
import http from 'axios'
import { sha1 } from '@libs/util'
import { createDecipheriv } from 'crypto'

export async function decryptWxSignature (
    appid: string,
    appsecret: string,
    code: string,
    rawData: string,
    signature: string,
    encryptedData: string,
    iv: string
): Promise<IWxInfo> {
    const { data: res = {} } = await fetchSessionAndOpenId(code, appid, appsecret)
    const { openid, session_key: sessionKey } = res
    if (!checkSignature(rawData, sessionKey, signature)) {
        throw new Error('Check signature failed.')
    }

    const decryptedRawData = aesDecrypt(sessionKey, iv, encryptedData)

    return JSON.parse(decryptedRawData)
}

export function checkSignature (rawData: string, sessionKey: string, signature: string) {
    return sha1(rawData + sessionKey) === signature
}

// 使用 js code 换区 session key 和 openid
export function fetchSessionAndOpenId (code: string, appid: string, appsecret: string) {
    return http.get(`https://api.weixin.qq.com/sns/jscode2session?appid=${appid}&secret=${appsecret}&js_code=${code}&grant_type=authorization_code`)
}

// aes 解密
export function aesDecrypt (key, iv, crypted) {
    crypted = Buffer.from(crypted, 'base64')
    key = Buffer.from(key, 'base64')
    iv = Buffer.from(iv, 'base64')
    const decipher = createDecipheriv('aes-128-cbc', key, iv)
    let decoded = decipher.update(crypted, 'base64', 'utf8')
    decoded += decipher.final('utf8')
    return decoded
}
