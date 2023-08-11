import { Request, Response } from 'express'
import ms from 'ms'
import UAParser from 'ua-parser-js'
import { getMs } from '../../../accessories/getMs'
import { uniqueID } from '../../../accessories/uniqueID'
import { RouteTraffics } from '../../RouteTraffics'
import { TrafficDumpPressure, TrafficDumpVisit } from '../../TrafficDump/TrafficDump'

export class TStatusLogs {
  private rt: RouteTraffics
  private visits: TrafficDumpVisit[] = []
  private pressures: TrafficDumpPressure[] = []
  constructor(rt: RouteTraffics) {
    this.rt = rt
    setInterval(() => this.pushPressure(), ms('1m'))
    setInterval(() => this.dump(), getMs(rt.logDumpInterval))
  }

  private dump() {
    if (!this.visits.length && !this.pressures.length) return
    const extras = this.rt.logDumpExtras.base()
    const dump = JSON.stringify({ ...extras, pressures: this.pressures, visits: this.visits })
    this.visits = []
    this.pressures = []
    this.rt.logDump(dump)
  }

  private pushPressure() {
    const records = this.rt.status.pressure.getStatus().slice(0, 60)
    if (records.every(record => !record.queueing)) return
    this.pressures.push({
      id: uniqueID(),
      timestamp: new Date().getTime(),
      ...this.rt.logDumpExtras.pressure(),
      queuePerSec: records.reduce((a, b) => a + b.queueing, 0) / records.length,
      aveWaitTime: records.reduce((a, b) => a + b.waitTime, 0) / records.length,
    })
  }

  private graphql(req: Request) {
    return req.originalUrl.startsWith('/graphql')
  }
  private visitCommons(req: Request, res: Response) {
    const extras = this.rt.logDumpExtras.visit(req, res)
    const ua = new UAParser(req.headers['user-agent'])
    const route = this.rt.status.traffics.getRoute(req)
    return {
      id: uniqueID(),
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
    this.visits.push({ ...commons, status: 'REJECTED', delay: 0, took: 0 })
  }
  public pushVisit(req: Request, res: Response, queuems: number, startms: number, closems: number) {
    const commons = this.visitCommons(req, res)
    const delay = startms - queuems
    const took = closems - startms
    this.visits.push({ ...commons, status: 'ACCEPTED', delay, took })
  }
}
