import { Request, Response } from 'express'
import UAParser from 'ua-parser-js'
import { getMs } from '../../../accessories/getMs'
import { uniqueID } from '../../../accessories/uniqueID'
import { RouteTraffics } from '../../RouteTraffics'
export type TrafficsDumpData = { pressures: TrafficsDumpPressure[]; visits: TrafficsDumpVisit[] }
export interface TrafficsDumpPressure {
  timestamp: number
  queueing: number
  waitTime: number
}
export type TrafficsDumpVisit<Extras extends {} = {}> = Extras & {
  reqid: string
  timestamp: number
  status: 'REJECTED' | 'ACCEPTED'
  graphql: boolean
  route: string | null
  url: string
  userip: string
  delay: number
  took: number
  statuscode: number
  agent: {
    browser: UAParser.IBrowser
    engine: UAParser.IEngine
    os: UAParser.IOS
    device: UAParser.IDevice
    cpu: UAParser.ICPU
  }
}

export class TStatusLogs {
  private rt: RouteTraffics
  private data: TrafficsDumpData = { pressures: [], visits: [] }
  constructor(rt: RouteTraffics) {
    this.rt = rt
    setInterval(() => this.pushPressure(), 1000)
    setInterval(() => this.dump(), getMs(rt.logDumpInterval))
  }

  private dump() {
    const dump = JSON.stringify(this.data)
    this.data = { pressures: [], visits: [] }
    this.rt.logDump(dump)
  }

  private pushPressure() {
    this.data.pressures.push({
      timestamp: new Date().getTime(),
      ...this.rt.status.pressure.getStatus(),
    })
  }

  private graphql(req: Request) {
    return req.originalUrl.startsWith('/graphql')
  }
  private commons(req: Request, res: Response) {
    const extras = this.rt.logDumpExtras(req, res)
    const ua = new UAParser(req.headers['user-agent'])
    const route = this.rt.status.routes.getRoute(req)
    return {
      reqid: uniqueID(),
      timestamp: new Date().getTime(),
      graphql: this.graphql(req),
      url: req.originalUrl,
      route,
      userip: req.ip,
      statuscode: res.statusCode,
      ...extras,
      agent: {
        browser: ua.getBrowser(),
        engine: ua.getEngine(),
        os: ua.getOS(),
        device: ua.getDevice(),
        cpu: ua.getCPU(),
      },
    }
  }
  public pushRejectVisit(req: Request, res: Response) {
    const commons = this.commons(req, res)
    this.data.visits.push({ ...commons, status: 'REJECTED', delay: 0, took: 0 })
  }
  public pushVisit(req: Request, res: Response, queuems: number, startms: number, closems: number) {
    const commons = this.commons(req, res)
    const delay = startms - queuems
    const took = closems - startms
    this.data.visits.push({ ...commons, status: 'ACCEPTED', delay, took })
  }
}
