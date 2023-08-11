export type TrafficDumpData<
  Extras extends {} = {},
  PressureExtras extends {} = {},
  VisitExtras extends {} = {}
> = Extras & {
  pressures: TrafficDumpPressure<PressureExtras>[]
  visits: TrafficDumpVisit<VisitExtras>[]
}

export type TrafficDumpPressure<Extras extends {} = {}> = Extras & {
  id: string
  timestamp: number
  queuePerSec: number
  aveWaitTime: number
}

export type TrafficDumpVisit<Extras extends {} = {}> = Extras & {
  id: string
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
