import { Request, Response } from 'express'
import { RouteTraffics } from '../RouteTraffics'
import { TStatusCommons } from './Status/TStatusCommons'
import { TStatusDelay } from './Status/TStatusDelay'
import { TStatusLogs } from './Status/TStatusLogs'
import { TStatusPressure } from './Status/TStatusPressure'
import { TStatusTraffics } from './Status/TStatusTraffics'

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
  public onQueue() {}
  public onStart(queuems: number, startms: number) {
    this.delay.push(queuems, startms)
  }
  public onClose(req: Request, res: Response, queuems: number, startms: number, closems: number) {
    this.traffics.pushServed(req, res, startms, closems)
    this.logs.pushVisit(req, res, queuems, startms, closems)
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
