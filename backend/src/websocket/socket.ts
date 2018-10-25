import { Server, ServerOptions, VerifyClientCallbackAsync } from 'ws'
import { IncomingMessage } from 'http'
import { promisify } from 'util'
import { syncTryCatch } from '@libs/util'
import redis, { subscriber, publisher } from '@libs/redis'
import { User } from '@models'

type TunnelInfo = {
    tunnelId: string
    uid: string
}

export interface MessageType {
    action: string
    requestId: number
    payload: any
}

export default class WebSocket {

    wss: Server = null

    clients: WeakMap<Object, TunnelInfo> = new WeakMap()

    constructor (options: ServerOptions) {
        // default props set
        options.verifyClient = options.verifyClient || this.verifyClient
        options.clientTracking = true

        this.wss = new Server(options)

        this.wss.on('connection', this.connection)

        subscriber.on('broadcast', this.handleBroadcast)
    }

    public broadcast = (targets: string[], data: {
        action: string
        payload: any
    }) => {
        const message = {
            targets: [...new Set(targets)],
            payload: data
        }

        console.log('[Websocket] Broadcast task: %s', JSON.stringify(message))

        publisher('broadcast', JSON.stringify(message))
    }

    private handleBroadcast = (rawMessage: string) => {
        const [message, err] = syncTryCatch(JSON.parse(rawMessage))
        const ids = new Set(message.targets)

        for (const ws of this.wss.clients) {
            const socketInfo = this.clients.get(ws)

            if (ids.has(socketInfo.tunnelId) || ids.has(socketInfo.uid)) {
                console.log('[Websocket] Push message: %s to uid: %s', JSON.stringify(message.payload), socketInfo.uid)
                ws.send(this.wrapResponse(message.payload))
            }
        }
    }

    // handler connections
    private connection = (socket, request: IncomingMessage) => {
        const tunnelId = request['tunnelId']
        const uid = request['user'].user_id
        console.log('[WebSocket] User %s connected. Tunnel id:', uid, tunnelId)

        socket.on('message', this.handleMessage(socket, uid))
        socket.on('error', this.handleError(socket))

        this.clients.set(socket, { tunnelId, uid })
    }

    private handleMessage = (socket, uid: string) => {
        return rawMessage => {
            if (rawMessage === 'ping') {
                return this.handlePing(socket)
            }

            let message: MessageType

            try {
                message = JSON.parse(rawMessage)
            } catch (e) {
                return console.log(e)
            }

            // console.log('[Websocket] Recieve message:', rawMessage)
            // return MicroService[message.action](socket, message.payload, message.requestId, uid, this.wss)
        }
    }

    private handleError = socket => {
        return e => {
            console.log('[Websocket] Error occured:', e)
        }
    }

    private handlePing = socket => {
        socket.send('pong')
    }

    private wrapResponse = data => {
        return data instanceof Error ? this.wrapErrorResponse(data) : JSON.stringify(data)
    }

    private wrapErrorResponse = (error: Error) => {
        return JSON.stringify({
            action: 'error',
            message: error.message
        })
    }

    private verifyClient (info: { req: IncomingMessage }, callback: (res: boolean, code?: number, message?: string) => void) {
        // slice tunnel id from url
        const urlArr = info.req.url.split('/')
        const tunnelId = urlArr[urlArr.length - 1]

        promisify(redis.get).bind(redis)(`tunnel:${tunnelId}`).then(res => {
            if (res === null) {
                console.log('[Websocket] Invalid tunnel url connecting: ', tunnelId)
                throw new Error('Invalid tunnel url')
            }

            // query user info
            return new User().where({ user_id: res }).fetch()
        }).then(userinfo => {
            if (!userinfo) {
                console.log('[Websocket] Invalid user connecting.')
                throw new Error('Invalid user')
            }

            info.req['tunnelId'] = tunnelId
            info.req['user'] = userinfo.toJSON()

            redis.del(`tunnel:${tunnelId}`)

            callback(true)
        }).catch(e => callback(false, 401, e.message))
    }
}
