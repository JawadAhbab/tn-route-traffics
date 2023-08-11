import { uniqueGetter } from 'tn-uniqid'

export const uniqueID = uniqueGetter({
  chars: ['A-Z', '0-9'],
  length: 15,
})
