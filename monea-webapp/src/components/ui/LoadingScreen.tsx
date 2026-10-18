import { cn } from '@/lib/utils'
import DotMatrixLoader from './DotMatrixLoader'

interface LoadingScreenProps {
  className?: string
}

export default function LoadingScreen({ className }: LoadingScreenProps) {
  return (
    <div
      aria-live="polite"
      className={cn('flex min-h-screen w-full items-center justify-center bg-background', className)}
      role="status"
    >
      <div className="flex flex-col items-center gap-4">
        <DotMatrixLoader aria-hidden="true" className="h-12 w-12" />
        <p className="text-sm text-muted-foreground">Loading...</p>
      </div>
    </div>
  )
}
