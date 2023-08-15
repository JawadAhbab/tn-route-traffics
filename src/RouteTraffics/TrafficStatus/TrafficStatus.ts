import { Request, Response } from 'express'
import { RouteTraffics } from '../RouteTraffics'
import { TStatusCommons } from './Status/TStatusCommons'
import { TStatusDelay } from './Status/TStatusDelay'
import { TStatusLogs } from './Status/TStatusLogs'
import { TStatusPressure } from './Status/TStatusPressure'
import { TStatusTraffics } from './Status/TStatusTraffics'
import { Traffic } from '../Traffic/Traffic'

export class TrafficStatus {
  private logs: TStatusLogs
  private delay = new TStatusDelay()
  private commons = new TStatusCommons()
  public pressure: TStatusPressure
  public traffics = new TStatusTraffics()
  constructor(rt: RouteTraffics) {
    this.pressure = new TStatusPressure(rt)
    this.logs = new TStatusLogs(rt)
  }

  public onReject(req: Request, res: Response) {
    this.traffics.pushLoss()
    this.logs.pushRejectVisit(req, res)
  }
  public onBypass() {
    this.traffics.pushBypass()
  }
  public onQueue() {}
  public onStart(traffic: Traffic) {
    this.delay.push(traffic)
  }
  public onClose(traffic: Traffic) {
    this.traffics.pushServed(traffic)
    this.logs.pushVisit(traffic)
  }

  public getStatus() {
    return {
      ...this.commons.getStatus(),
      delay: this.delay.getStatus(),
      traffics: this.traffics.getStatus(),
      pressure: this.pressure.getStatus(),
    }
  }
}
