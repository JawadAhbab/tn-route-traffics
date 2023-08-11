import { capitalize } from 'tn-capitalize'
import { spaceCase } from 'tn-case'
import ung from 'unique-names-generator'
const stime = new Date().getTime()
const dic: string[] = []
const dicadd = (a: string[]) => a.map(e => dic.push(...e.split(/[ -]/g).filter(i => i.length > 2)))
dicadd([ung.countries, ung.animals, ung.adjectives, ung.colors, ung.languages].flat())

export const uniqueName = (podname: string) => {
  const name = ung.uniqueNamesGenerator({ dictionaries: [dic, dic], seed: podname })
  return capitalize(spaceCase(name))
}

export class TStatusCommons {
  public getStatus() {
    const podname = process.env.HOSTNAME || 'unknown'
    return {
      name: uniqueName(podname),
      podname,
      age: new Date().getTime() - stime,
    }
  }
}
