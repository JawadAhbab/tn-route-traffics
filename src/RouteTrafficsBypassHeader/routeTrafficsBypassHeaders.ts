import sha from 'crypto-js/sha256'
import ms from 'ms'

export const routeTrafficsBypassHeaders = (secret: string) => {
  const exp = new Date().getTime() + ms('10m')
  const hash = sha(exp + secret).toString()
  return { bypasstraffic: hash }
}
