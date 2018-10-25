import * as redis from 'redis'
import { REDIS } from '@config'
import { EventEmitter } from 'events'

const instance = redis.createClient({
    host: REDIS.HOST,
    port: REDIS.PORT
})

class Subscriber {

    public instance: redis.RedisClient

    private eventEmitter = new EventEmitter()

    constructor () {
        this.instance = redis.createClient({
            host: REDIS.HOST,
            port: REDIS.PORT
        })

        this.instance.on('message', this.onMessage)
    }

    onMessage = (channel: string, message: string) => {
        this.eventEmitter.emit(channel, message)
    }

    on (channel: string, cb: (message: string) => void) {
        console.log(`[redis] add listener to channel:`, channel)
        this.eventEmitter.addListener(channel, cb)
        this.instance.subscribe(channel)
    }

    off (channel: string, cb: (message: string) => void) {
        this.eventEmitter.removeListener(channel, cb)
        this.instance.unsubscribe(channel)
    }
}

export default instance

export const subscriber = new Subscriber()

export const publisher = (channel: string, message: string) => {
    redis.createClient({
        host: REDIS.HOST,
        port: REDIS.PORT
    }).publish(channel, message)
}
