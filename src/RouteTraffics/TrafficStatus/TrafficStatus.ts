import { Request, Response } from 'express'
import { RouteTraffics } from '../RouteTraffics'
import { TStatusCommons } from './Status/TStatusCommons'
import { TStatusDelay } from './Status/TStatusDelay'
import { TStatusLogs } from './Status/TStatusLogs'
import { TStatusPressure } from './Status/TStatusPressure'
import { TStatusRoutes } from './Status/TStatusRoutes'
import { TStausTraffics } from './Status/TStausTraffics'

export class TrafficStatus {
  private logs: TStatusLogs
  private delay = new TStatusDelay()
  private traffic = new TStausTraffics()
  private commons = new TStatusCommons()
  public pressure: TStatusPressure
  public routes = new TStatusRoutes()
  constructor(rt: RouteTraffics) {
    this.pressure = new TStatusPressure(rt)
    this.logs = new TStatusLogs(rt)
  }

  public onReject(req: Request, res: Response) {
    this.traffic.reject()
    this.logs.pushRejectVisit(req, res)
  }
  public onQueue() {
    this.traffic.accept()
  }
  public onStart(queuems: number, startms: number) {
    this.delay.push(queuems, startms)
  }
  public onClose(req: Request, res: Response, queuems: number, startms: number, closems: number) {
    this.routes.push(req, res, startms, closems)
    this.logs.pushVisit(req, res, queuems, startms, closems)
  }

  public getStatus() {
    return {
      ...this.commons.getStatus(),
      pressure: this.pressure.getStatus(),
      traffics: this.traffic.getStatus(),
      delay: this.delay.getStatus(),
      routes: this.routes.getStatus(),
    }
  }
}
