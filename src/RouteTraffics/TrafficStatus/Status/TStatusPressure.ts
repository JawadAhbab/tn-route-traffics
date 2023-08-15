import ms from 'ms'
import { RouteTraffics } from '../../RouteTraffics'
export interface TSPressureRecord {
  timestamp: number
  waitTime: number
  queueing: {
    regular: number
    bypass: number
    total: number
  }
}

export class TStatusPressure {
  private rt: RouteTraffics
  private records: TSPressureRecord[] = []
  constructor(rt: RouteTraffics) {
    this.rt = rt
    setInterval(() => this.record(), ms('1s'))
  }

  private record() {
    const oldest = this.rt.traffics.find(t => !t.started)
    const timestamp = new Date().getTime()
    const waitTime = oldest ? timestamp - oldest.queuems : 0
    const regular = this.rt.traffics.length
    const bypass = this.rt.bypassTraffics.length
    const total = regular + bypass
    this.records.unshift({ timestamp, waitTime, queueing: { regular, bypass, total } })
    this.records.splice(300)
  }

  public getStatus() {
    return this.records
  }
}
