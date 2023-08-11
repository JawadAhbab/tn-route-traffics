import { Request, Response } from 'express'
import UAParser from 'ua-parser-js'
import { getMs } from '../../../accessories/getMs'
import { uniqueID } from '../../../accessories/uniqueID'
import { RouteTraffics } from '../../RouteTraffics'
import { TrafficDumpData } from '../../TrafficDump/TrafficDump'

export class TStatusLogs {
  private rt: RouteTraffics
  private data: TrafficDumpData = { pressures: [], visits: [] }
  constructor(rt: RouteTraffics) {
    this.rt = rt
    setInterval(() => this.pushPressure(), 1000)
    setInterval(() => this.dump(), getMs(rt.logDumpInterval))
  }

  private dump() {
    const extras = this.rt.logDumpExtras.base()
    const dump = JSON.stringify({ ...extras, ...this.data })
    this.data = { pressures: [], visits: [] }
    this.rt.logDump(dump)
  }

  private pushPressure() {
    const extras = this.rt.logDumpExtras.pressure()
    this.data.pressures.push({
      timestamp: new Date().getTime(),
      ...extras,
      ...this.rt.status.pressure.getStatus(),
    })
  }

  private graphql(req: Request) {
    return req.originalUrl.startsWith('/graphql')
  }
  private visitCommons(req: Request, res: Response) {
    const extras = this.rt.logDumpExtras.visit(req, res)
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
    const commons = this.visitCommons(req, res)
    this.data.visits.push({ ...commons, status: 'REJECTED', delay: 0, took: 0 })
  }
  public pushVisit(req: Request, res: Response, queuems: number, startms: number, closems: number) {
    const commons = this.visitCommons(req, res)
    const delay = startms - queuems
    const took = closems - startms
    this.data.visits.push({ ...commons, status: 'ACCEPTED', delay, took })
  }
}
