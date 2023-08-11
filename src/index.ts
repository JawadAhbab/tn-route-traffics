import { Request, Response } from 'express'
import { Func } from 'tn-typescript'
import { $routeTraffic } from './RouteTraffics/RouteTraffics'
import { RouteTrafficsOpts } from './RouteTraffics/TrafficOpts/TrafficOpts'

export const routeTrafficMiddleware = (opts: RouteTrafficsOpts = {}) => {
  $routeTraffic.begin(opts)
  return (req: Request, res: Response, next: Func) => {
    $routeTraffic.pushTraffic({ req, res, next })
  }
}
