import { LabShell } from '../lab/ui/LabShell'
import { LabErrorBoundary } from '../lab/ui/LabErrorBoundary'
import { labSimRegistry } from '../lab/sims/registry'

export function LabPage() {
  return (
    <LabErrorBoundary>
      <LabShell sims={[...labSimRegistry] as unknown as Array<import('../lab/engine/types').SimulationModel<unknown, unknown>>} />
    </LabErrorBoundary>
  )
}

