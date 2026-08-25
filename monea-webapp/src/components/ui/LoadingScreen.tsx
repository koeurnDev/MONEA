import { cn } from '@/lib/utils'

interface LoadingScreenProps {
  className?: string
}

export default function LoadingScreen({ className }: LoadingScreenProps) {
  return (
    <div className={cn('flex min-h-screen w-full items-center justify-center bg-background', className)}>
      <div className="flex flex-col items-center gap-4">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        <p className="text-sm text-muted-foreground">Loading...</p>
      </div>
    </div>
  )
}
