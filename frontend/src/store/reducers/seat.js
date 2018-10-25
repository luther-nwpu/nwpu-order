import { handleActions } from 'redux-actions'
import { StoreStaticSeat } from '../types/seat'

export default handleActions({
  [StoreStaticSeat] (state, action) {
    return {
      ...state,
      staticSeats: action.payload
    }
  }
}, {
  staticSeats: []
})
