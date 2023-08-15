import { NotAcceptableException } from '@nestjs/common'
import sha from 'crypto-js/sha256'
import { Traffic, TrafficProps } from './Traffic/Traffic'
import { RouteTrafficsOpts, TrafficOpts } from './TrafficOpts/TrafficOpts'
import { TrafficStatus } from './TrafficStatus/TrafficStatus'

export class RouteTraffics extends TrafficOpts {
  public traffics: Traffic[] = []
  public bypassTraffics: Traffic[] = []
  public status!: TrafficStatus

  public begin(opts: RouteTrafficsOpts) {
    this.opts = opts
    this.status = new TrafficStatus(this)
  }

  private checkExcludes(props: TrafficProps) {
    return this.excludes.includes(props.req.path)
  }
  private checkAccept(props: TrafficProps) {
    const totaltraffics = this.traffics.length + this.bypassTraffics.length
    if (totaltraffics < this.maxQueue) return
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
    const traffic = new Traffic(this, props, { bypass })
    if (bypass) this.bypassTraffics.push(traffic)
    else this.traffics.push(traffic)
    this.check()
  }

  public check() {
    this.traffics = this.traffics.filter(t => !t.closed)
    this.bypassTraffics = this.bypassTraffics.filter(t => !t.closed)
    const exec = (traffics: Traffic[]) => {
      const busycount = traffics.filter(t => t.started && !t.unlocked).length
      const allowed = Math.max(this.concurrency - busycount, 0)
      if (!allowed) return
      traffics
        .filter(t => !t.started)
        .splice(0, allowed)
        .forEach(t => t.start())
    }
    exec(this.traffics)
    exec(this.bypassTraffics)
  }
}

export const $routeTraffics = new RouteTraffics()
