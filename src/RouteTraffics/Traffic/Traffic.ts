import { Request, Response } from 'express'
import ms from 'ms'
import { Func } from 'tn-typescript'
import { RouteTraffics } from '../RouteTraffics'
export type TrafficProps = { req: Request; res: Response; next: Func }

export class Traffic {
  private rt: RouteTraffics
  public queuems = new Date().getTime()
  public startms!: number
  public closems!: number
  private req: Request
  private res: Response
  private next: Func
  constructor(rt: RouteTraffics, { req, res, next }: TrafficProps) {
    this.rt = rt
    this.req = req
    this.res = res
    this.next = next
    this.rt.status.onQueue()
    this.res.once('close', () => this.close())
  }

  public started = false
  public closed = false
  public unlocked = false
  private timeouts: NodeJS.Timeout[] = []

  public start() {
    this.startms = new Date().getTime()
    this.started = true
    this.next()
    this.rt.status.onStart(this.queuems, this.startms)
    this.timeouts.push(setTimeout(() => this.unlock(), this.rt.unlockTime))
    this.timeouts.push(setTimeout(() => this.close(), ms('10m')))
  }

  private unlock() {
    this.unlocked = true
    this.rt.check()
  }

  private close() {
    if (this.closed) return
    this.closems = new Date().getTime()
    this.closed = true
    this.rt.status.onClose(this.req, this.res, this.queuems, this.startms, this.closems)
    this.rt.check()
    this.timeouts.forEach(timeout => clearTimeout(timeout))
  }
}
