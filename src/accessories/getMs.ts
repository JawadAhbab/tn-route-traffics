import ms from 'ms'
import { isNumber } from 'tn-validate'

export const getMs = (time: string | number) => {
  return isNumber(time) ? time : ms(time)
}
