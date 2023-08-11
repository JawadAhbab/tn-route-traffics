import { RouteTraffics } from '../../RouteTraffics'

export class TStatusQueue {
  private rt: RouteTraffics
  constructor(rt: RouteTraffics) {
    this.rt = rt
  }

  public getStatus() {
    const waitings = this.rt.traffics.filter(t => !t.started)
    return {
      running: this.rt.traffics.length - waitings.length,
      waiting: waitings.length,
      waitTime: waitings.length ? new Date().getTime() - waitings[0].queuems : 0,
    }
  }
}
