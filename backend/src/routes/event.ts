import * as koaRouter from 'koa-router'
import * as uuid from 'uuid'
import { sign } from 'jsonwebtoken'
import { WX_APPID, WX_APPSECRET, JWT_SECRET, WS_HOST } from '@config'
import { decryptWxSignature, fetchSessionAndOpenId } from '@libs/decryptWxSignature'
import { User, Test } from '@models'
import redis from '@libs/redis'
import { db } from '@libs/db'
import { promisify } from 'util'

const router = new koaRouter()

router.prefix('/test')

router.get('/', async (ctx, next) => {
    const test = {
        test_id: uuid(),
        content: '我喜欢你姚菊'
    }
    await new Test(test).save()
    return ctx.body = '我喜欢你猪'
})

router.get('/users', async (ctx, next) => {
    const test = await new Test().fetchAll()
    return ctx.body = test
})

export default router
