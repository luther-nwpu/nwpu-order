import { combineReducers } from 'redux'
import counter from './counter'
import seat from './seat'

export default combineReducers({
  counter,
  seat
})
