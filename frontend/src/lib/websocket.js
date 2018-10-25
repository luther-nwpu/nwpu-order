import EventEmitter from 'wolfy87-eventemitter'
import { get } from '@/lib/http'
import { serverHost } from '@/config'

/**
 * websocket 实例
 */
let instance = null

class WebSocket {
    /**
     * 连接实例
     * 保证小程序只有一个信道连接
     */
  connection = null

    // 是否连接
  isConnected = false

    // 重试
  heartBeat = 0

    // 定时器
  timer = null

    // event 对象
  ee = new EventEmitter()

  constructor () {
    this.connect()
  }

  on (event, cb) {
    this.ee.addListener(event, cb)
  }

  off (event, cb) {
    this.ee.removeListener(event, cb)
  }

  send (data) {
    if (!this.isConnected) {
      throw new Error('[WebSocket] Socket not connected yet')
    }

    this.connection.send({ data: data })
  }

  async connect () {
    const tunnelUrl = await this._getTunnelUrl()

    this.connection = wx.connectSocket({ url: tunnelUrl })

        // 监听信道
    this.connection.onOpen(() => {
      console.log(`成功连接信道：`, tunnelUrl)

      this.isConnected = true

      this.ee.emit('_open', this.connection)

            // 心跳包
      this.timer = setInterval(() => {
        if (this.heartBeat > 5) {
          this.heartBeat = 0
          return this._reConnect()
        }

        this.connection.send({ data: 'ping' })
        this.heartBeat++
      }, 5000)
    })

    this.connection.onMessage(rawData => {
      if (rawData.data === 'pong') {
        this.heartBeat--
        return
      }

      let data

      try {
        data = JSON.parse(rawData.data)

        if (data.action) {
          this.ee.emit(data.action, data)
        }
      } catch (e) {
        data = rawData.data
      }

      this.ee.emit('_message', data)
    })

    this.connection.onClose(() => this._clean())

    this.connection.onError(e => {
      console.error(e)
      this.ee.emit('_error', this.connection)
      this._clean()
    })
  }

  async _clean () {
        // 触发关闭函数
    this.ee.emit('_close', this.connection)

        // 清理标志位
    this.isConnected = false
    this.connection = null
    this.heartBeat = 0

        // 清理监听器
    this.ee.removeAllListeners()
    clearInterval(this.timer)
  }

  async _reConnect () {
    console.log('信道发生错误，重连中...')
    this.connection.close()
    this.connect()
  }

  async _getTunnelUrl () {
    const res = await get('/users/tunnel')
    const data = res.data
    const statusCode = res.statusCode

    if (statusCode !== 200) {
      throw new Error(JSON.stringify(data))
    }

    return `wss://${serverHost}/${data.tunnelId}`
  }
}

export default function () {
  if (!instance) {
    instance = new WebSocket()
  }

  return instance
}
