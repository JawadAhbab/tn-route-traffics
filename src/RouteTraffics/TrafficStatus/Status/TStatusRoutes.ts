import { Request, Response } from 'express'
import { AnyObject, ObjectOf } from 'tn-typescript'

class Route {
  public route: string
  public count = 0
  public cputime = 0
  private maxtime = 0
  private statuscodes: ObjectOf<number> = {}
  constructor(route: string) {
    this.route = route
  }

  public push(took: number, statuscode: number) {
    this.count += 1
    this.cputime += took
    this.maxtime = Math.max(this.maxtime, took)
    if (!this.statuscodes[statuscode]) this.statuscodes[statuscode] = 0
    this.statuscodes[statuscode] += 1
  }

  public get average() {
    return Math.round(this.cputime / this.count)
  }

  public getStatus() {
    return {
      count: this.count,
      average: this.average,
      maxtime: this.maxtime,
      cputime: this.cputime,
      statuscodes: this.statuscodes,
    }
  }
}

class Unknowns {
  private maxurls = 100
  private urls: ObjectOf<number> = {}
  private unlisted = 0
  public push(url: string) {
    if (Object.keys(this.urls).length > this.maxurls) return ++this.unlisted
    if (!this.urls[url]) this.urls[url] = 0
    ++this.urls[url]
  }

  public getStatus() {
    const status = { ...this.urls }
    if (this.unlisted) status.unlisted = this.unlisted
    return status
  }
}

export class TStatusRoutes {
  private routes: ObjectOf<Route> = {}
  private unknowns = new Unknowns()

  public push(req: Request, res: Response, startms: number, closems: number) {
    const routename = this.getRoute(req)
    if (!routename) return this.unknowns.push(req.originalUrl)
    const route = this.routes[routename]
    if (!route) this.routes[routename] = new Route(routename)
    this.routes[routename].push(closems - startms, res.statusCode)
  }

  public getRoute(req: Request): string | null {
    const graphql = req.baseUrl.startsWith('/graphql')
    return (graphql ? req.body?.operationName : req.route?.path) || null
  }

  public getStatus() {
    const rs = Object.entries(this.routes).map(([_, route]) => route)
    const counts = rs.reduce((a, b) => a + b.count, 0)
    const cputime = rs.reduce((a, b) => a + b.cputime, 0)
    const average = cputime / counts
    const unknowns = this.unknowns.getStatus()
    const routes: AnyObject = {}
    rs.forEach(route => (routes[route.route] = route.getStatus()))
    return { counts, average, cputime, routes, unknowns }
  }
}
