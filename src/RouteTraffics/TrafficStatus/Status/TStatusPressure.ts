import ms from 'ms'
import { RouteTraffics } from '../../RouteTraffics'
type Record = { timestamp: number; queueing: number; waitTime: number }

export class TStatusPressure {
  private rt: RouteTraffics
  private records: Record[] = []
  constructor(rt: RouteTraffics) {
    this.rt = rt
    setInterval(() => this.record(), ms('1s'))
  }

  private record() {
    const oldest = this.rt.traffics.find(t => !t.started)
    const timestamp = new Date().getTime()
    const queueing = this.rt.traffics.length + this.rt.bypassTraffics.length
    const waitTime = oldest ? timestamp - oldest.queuems : 0
    this.records.unshift({ timestamp, queueing, waitTime })
    this.records.splice(300)
  }

  public getStatus() {
    return this.records
  }
}
