import { uniqname } from 'tn-uniqname'
const stime = new Date().getTime()

export class TStatusCommons {
  public getStatus() {
    const podname = process.env.HOSTNAME || 'unknown'
    return {
      name: uniqname(2, podname),
      podname,
      age: new Date().getTime() - stime,
    }
  }
}
