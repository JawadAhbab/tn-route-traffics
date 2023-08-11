import { NotAcceptableException } from '@nestjs/common'
import { Traffic, TrafficProps } from './Traffic/Traffic'
import { RouteTrafficsOpts, TrafficOpts } from './TrafficOpts/TrafficOpts'
import { TrafficStatus } from './TrafficStatus/TrafficStatus'

export class RouteTraffics extends TrafficOpts {
  public traffics: Traffic[] = []
  public status!: TrafficStatus

  public begin(opts: RouteTrafficsOpts) {
    this.opts = opts
    this.status = new TrafficStatus(this)
  }

  private checkAccept(props: TrafficProps) {
    if (this.traffics.length < this.maxQueue) return
    this.status.onReject(props.req, props.res)
    throw new NotAcceptableException()
  }

  public pushTraffic(props: TrafficProps) {
    if (this.excludes.includes(props.req.path)) return props.next()
    this.checkAccept(props)
    this.traffics.push(new Traffic(this, props))
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

export const $routeTraffic = new RouteTraffics()
