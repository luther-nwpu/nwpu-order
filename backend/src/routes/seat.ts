import * as koaRouter from 'koa-router'
import * as uuid from 'uuid'
import { Seat } from '@models'
import redis from '@libs/redis'
import { db } from '@libs/db'
import { promisify } from 'util'

const router = new koaRouter()

router.prefix('/seat')

router.get('/', async (ctx, next) => {
    const allSeat = await new Seat().fetchAll()
    console.log('111111111111111111111111111111')
    const map = new Map()
    allSeat.forEach(value => {
        console.log(value)
        map.set(value.attributes.region.id, value)
    })
    return ctx.body = allSeat
})

router.post('/order', async (ctx, next) => {
    return ctx.body = 'sssssssssssssssssssssss'
})

export default router
