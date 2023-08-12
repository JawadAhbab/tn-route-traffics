import { NotAcceptableException } from '@nestjs/common'
import { Traffic, TrafficProps } from './Traffic/Traffic'
import { RouteTrafficsOpts, TrafficOpts } from './TrafficOpts/TrafficOpts'
import { TrafficStatus } from './TrafficStatus/TrafficStatus'
import sha from 'crypto-js/sha256'

export class RouteTraffics extends TrafficOpts {
  public traffics: Traffic[] = []
  public status!: TrafficStatus

  public begin(opts: RouteTrafficsOpts) {
    this.opts = opts
    this.status = new TrafficStatus(this)
  }

  private checkExcludes(props: TrafficProps) {
    return this.excludes.includes(props.req.path)
  }
  private checkAccept(props: TrafficProps) {
    if (this.traffics.length < this.maxQueue) return
    this.status.onReject(props.req, props.res)
    throw new NotAcceptableException()
  }
  private checkBypass(props: TrafficProps) {
    if (this.bypass.includes(props.req.path)) return true
    const bypasstraffic = props.req.headers['bypasstraffic']
    if (!bypasstraffic) return false
    const [expstr, hash] = bypasstraffic.toString().split('.')
    if (+expstr < new Date().getTime()) return false
    const bypass = hash === sha(expstr + this.bypassSecret).toString()
    if (bypass) this.status.onBypass()
    return bypass
  }

  public pushTraffic(props: TrafficProps) {
    if (this.checkExcludes(props)) return props.next()
    this.checkAccept(props)
    const bypass = this.checkBypass(props)
    const traffic = new Traffic(this, props)
    if (bypass) traffic.bypass()
    this.traffics.push(traffic)
    this.check()
  }

  public check() {
    this.traffics = this.traffics.filter(t => !t.closed)
    const busycount = this.traffics.filter(t => t.started && !t.unlocked).length
    const allowed = Math.max(this.concurrency - busycount, 0)
    if (!allowed) return
    this.traffics
      .filter(t => !t.started)
      .splice(0, allowed)
      .forEach(t => t.start())
  }
}

export const $routeTraffics = new RouteTraffics()
