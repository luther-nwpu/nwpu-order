import { tryCatch } from '@libs/util'
import { Context } from 'koa'
import { HttpError } from 'http-errors'

export async function errorCatcher (ctx: Context, next: Function) {
    const [, err] = await tryCatch(next())

    if (err instanceof HttpError) {
        ctx.status = (err as HttpError).statusCode
        ctx.body = {
            message: err.message
        }

        return
    }

    if (err) {
        console.error(err)

        ctx.status = 500
        ctx.body = {
            message: err.message
        }
    }
}
