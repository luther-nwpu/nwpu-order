import * as Koa from 'koa'
import * as xmlParse from 'koa-xml-body'
import { createServer } from 'http'
import * as KoaBody from 'koa-bodyparser'
import * as KoaCors from '@koa/cors'
import * as debug from 'debug'
import { PORT, IS_PROD, DEBUG_NAMESPACE } from '@config'
import { jwtMiddleware, errorCatcher } from '@middlewares'
import WebSocket from '@websocket'
import { userRouter, testRouter, seatRouter } from '@routes'

const app = new Koa()

jwtMiddleware.forEach((value) => {
    app.use(value)
})

app
    .use(KoaCors())
    .use(xmlParse({ xmlOptions: { explicitArray: false } }))
    .use(KoaBody())
    .use(errorCatcher)
    .use(userRouter.routes())
    .use(userRouter.allowedMethods())
    .use(testRouter.routes())
    .use(testRouter.allowedMethods())
    .use(seatRouter.routes())
    .use(seatRouter.allowedMethods())
const server = createServer(app.callback())

WebSocket({ server })

server.listen(
    PORT,
    () => {
        const debugInfo = `✅ App starting at http://127.0.0.1:${PORT}/`

        IS_PROD
            ? console.log(debugInfo)
            : debug(DEBUG_NAMESPACE.FRAMEWORK)(debugInfo)
    }
)
