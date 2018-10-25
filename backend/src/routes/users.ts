import * as koaRouter from 'koa-router'
import * as uuid from 'uuid'
import { sign } from 'jsonwebtoken'
import { WX_APPID, WX_APPSECRET, JWT_SECRET, WS_HOST } from '@config'
import { decryptWxSignature, fetchSessionAndOpenId } from '@libs/decryptWxSignature'
import { User } from '@models'
import redis from '@libs/redis'
import { db } from '@libs/db'
import { promisify } from 'util'

const router = new koaRouter()

router.prefix('/users')

router.get('/', async (ctx, next) => {
    return ctx.body = ctx.state.$user
})

router.post('/', async (ctx, next) => {
    const { code, rawData, signature, encryptedData, iv } = ctx.request.body
    const wxinfo = await decryptWxSignature(WX_APPID, WX_APPSECRET, code, rawData, signature, encryptedData, iv)
    let user = await new User().where({ wx_openid: wxinfo.openId }).fetch()

    if (user) {
        await new User().where({ user_id: user.get('user_id') }).save({ wx_info: JSON.stringify(wxinfo) }, { patch: true })
        user.set('wx_info', wxinfo)
    } else {
        user = await new User({
            user_id: uuid(),
            wx_openid: wxinfo.openId,
            wx_info: JSON.stringify(wxinfo)
        }).save()
        user.set('wx_info', wxinfo)
    }

    const token = sign(user.toJSON(), JWT_SECRET, {
        expiresIn: '6h'
    })

    return ctx.body = { token, userInfo: user.toJSON() }
})

router.get('/session', async (ctx, next) => {
    const code = ctx.state.code
    const { data: res = {} } = await fetchSessionAndOpenId(code, WX_APPID, WX_APPSECRET)
    const { openid } = res

    let user = await new User().where({ wx_openid: openid }).fetch()
    await new User().where({ user_id: user.get('user_id') }).save({ update_at: db.raw('CURRENT_TIMESTAMP') }, { patch: true })

    user.set('wx_info', JSON.parse(user.get('wx_info')))

    const token = sign(user.toJSON(), JWT_SECRET, {
        expiresIn: '6h'
    })
    return ctx.body = { token, userInfo: user.toJSON() }
})

export default router
