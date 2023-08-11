import { Request, Response } from 'express'
import { AnyObject } from 'tn-typescript'
export interface RouteTrafficsOpts {
  concurrency?: number
  maxQueue?: number
  unlockTime?: number
  excludes?: string[]
  logDump?: (dump: string) => void
  logDumpInterval?: number | string
  logDumpExtras?: (req: Request, res: Response) => AnyObject
}

export class TrafficOpts {
  protected opts: RouteTrafficsOpts = {}

  public get concurrency() {
    return this.opts.concurrency || 6
  }
  public get maxQueue() {
    return this.opts.maxQueue || 10_000
  }
  public get unlockTime() {
    return this.opts.unlockTime || 600_000
  }
  public get excludes() {
    return this.opts.excludes || []
  }
  public get logDump() {
    return this.opts.logDump || (() => null)
  }
  public get logDumpInterval() {
    return this.opts.logDumpInterval || '1m'
  }
  public get logDumpExtras() {
    return this.opts.logDumpExtras || (() => {})
  }
}
