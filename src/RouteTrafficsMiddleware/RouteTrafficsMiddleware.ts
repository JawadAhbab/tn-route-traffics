import { Request, Response } from 'express'
import { Func } from 'tn-typescript'
import { $routeTraffics } from '../RouteTraffics/RouteTraffics'
import { RouteTrafficsOpts } from '../RouteTraffics/TrafficOpts/TrafficOpts'

export const routeTrafficsMiddleware = (opts: RouteTrafficsOpts = {}) => {
  $routeTraffics.begin(opts)
  return (req: Request, res: Response, next: Func) => {
    $routeTraffics.pushTraffic({ req, res, next })
  }
}
