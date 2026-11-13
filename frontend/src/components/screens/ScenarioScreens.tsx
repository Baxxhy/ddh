import type { PracticeState } from '../../api/practice'
import { PracticeActions } from '../PracticeActions'
export { HospitalScreen } from './HospitalScreen'
export { BusScreen } from './BusScreen'
export function PaymentScreen({state}: {state:PracticeState}) { return <PracticeActions key={state.nodeId} state={state}/> }
