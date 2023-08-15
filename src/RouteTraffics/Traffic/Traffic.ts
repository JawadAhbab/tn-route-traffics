import { Request, Response } from 'express'
import { Func } from 'tn-typescript'
import { getMs } from '../../accessories/getMs'
import { RouteTraffics } from '../RouteTraffics'
export type TrafficProps = { req: Request; res: Response; next: Func }
type Opts = { bypass: boolean }

export class Traffic {
  private rt: RouteTraffics
  public queuems = new Date().getTime()
  public startms!: number
  public closems!: number
  public req: Request
  public res: Response
  public bypass: boolean
  private next: Func
  constructor(rt: RouteTraffics, tprops: TrafficProps, opts: Opts) {
    this.rt = rt
    this.bypass = opts.bypass
    this.req = tprops.req
    this.res = tprops.res
    this.next = tprops.next
    this.rt.status.onQueue()
    this.res.once('close', () => this.close())
  }

  public started = false
  public closed = false
  public unlocked = false
  private timeouts: NodeJS.Timeout[] = []

  public start() {
    if (this.started) return
    this.startms = new Date().getTime()
    this.started = true
    this.next()
    this.rt.status.onStart(this)
    const unlockTimeout = this.bypass ? this.rt.bypassUnlockTimeout : this.rt.unlockTimeout
    this.timeouts.push(setTimeout(() => this.unlock(), getMs(unlockTimeout)))
    this.timeouts.push(setTimeout(() => this.close(), getMs(this.rt.forceCloseTimeout)))
  }

  private unlock() {
    this.unlocked = true
    this.rt.check()
  }

  private close() {
    if (this.closed) return
    this.closems = new Date().getTime()
    this.closed = true
    this.rt.status.onClose(this)
    this.rt.check()
    this.timeouts.forEach(timeout => clearTimeout(timeout))
  }
}
