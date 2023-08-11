import { RouteTraffics } from '../../RouteTraffics'

export class TStatusPressure {
  private rt: RouteTraffics
  constructor(rt: RouteTraffics) {
    this.rt = rt
  }

  public getStatus() {
    const oldest = this.rt.traffics.find(t => !t.started)
    return {
      queueing: this.rt.traffics.length,
      waitTime: oldest ? new Date().getTime() - oldest.queuems : 0,
    }
  }
}
