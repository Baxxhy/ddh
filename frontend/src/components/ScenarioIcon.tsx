import { BusFront, Hospital, ScanLine } from 'lucide-react'
export function ScenarioIcon({ id }: { id: string }) {
  const Icon = id === 'hospital' ? Hospital : id === 'bus' ? BusFront : ScanLine
  return <Icon size={30} aria-hidden="true" />
}
