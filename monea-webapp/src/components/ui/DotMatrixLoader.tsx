import { cn } from '@/lib/utils'

interface DotMatrixLoaderProps {
  className?: string
}

export default function DotMatrixLoader({
  className,
}: DotMatrixLoaderProps) {
  return (
    <svg
      aria-hidden="true"
      className={cn('dot-matrix-loader text-primary', className)}
      fill="currentColor"
      viewBox="0 0 18 18"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="3" cy="3" r="1.25" />
      <circle cx="7" cy="3" r="1.25" />
      <circle cx="11" cy="3" r="1.25" />
      <circle cx="15" cy="3" r="1.25" />
      <circle cx="3" cy="7" r="1.25" />
      <circle cx="7" cy="7" r="1.25" />
      <circle cx="11" cy="7" r="1.25" />
      <circle cx="15" cy="7" r="1.25" />
      <circle cx="3" cy="11" r="1.25" />
      <circle cx="7" cy="11" r="1.25" />
      <circle cx="11" cy="11" r="1.25" />
      <circle cx="15" cy="11" r="1.25" />
      <circle cx="3" cy="15" r="1.25" />
      <circle cx="7" cy="15" r="1.25" />
      <circle cx="11" cy="15" r="1.25" />
      <circle cx="15" cy="15" r="1.25" />
    </svg>
  )
}
