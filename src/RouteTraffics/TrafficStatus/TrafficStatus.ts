import { Request, Response } from 'express'
import { RouteTraffics } from '../RouteTraffics'
import { TStatusCommons } from './Status/TStatusCommons'
import { TStatusDelay } from './Status/TStatusDelay'
import { TStatusLogs } from './Status/TStatusLogs'
import { TStatusQueue } from './Status/TStatusQueue'
import { TStatusRoutes } from './Status/TStatusRoutes'
import { TStausTraffics } from './Status/TStausTraffics'

export class TrafficStatus {
  private logs: TStatusLogs
  private delay = new TStatusDelay()
  private traffic = new TStausTraffics()
  private queue: TStatusQueue
  private commons = new TStatusCommons()
  public routes = new TStatusRoutes()
  constructor(rt: RouteTraffics) {
    this.queue = new TStatusQueue(rt)
    this.logs = new TStatusLogs(rt)
  }

  public onReject(req: Request, res: Response) {
    this.traffic.reject()
    this.logs.pushReject(req, res)
  }
  public onQueue() {
    this.traffic.accept()
  }
  public onStart(queuems: number, startms: number) {
    this.delay.push(queuems, startms)
  }
  public onClose(req: Request, res: Response, queuems: number, startms: number, closems: number) {
    this.routes.push(req, res, startms, closems)
    this.logs.push(req, res, queuems, startms, closems)
  }

  public getStatus() {
    return {
      ...this.commons.getStatus(),
      queue: this.queue.getStatus(),
      traffics: this.traffic.getStatus(),
      delay: this.delay.getStatus(),
      routes: this.routes.getStatus(),
    }
  }
}
