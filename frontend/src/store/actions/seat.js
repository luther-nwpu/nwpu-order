import { StoreStaticSeat } from '../types/seat'
import { createAction } from 'redux-actions'

export const storeStaticSeat = createAction(StoreStaticSeat, (staticSeat) => {
  return staticSeat
})
