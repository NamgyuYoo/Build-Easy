import Skeleton from 'react-loading-skeleton'
import 'react-loading-skeleton/dist/skeleton.css'

export function CardSkeleton() {
  return (
    <div className="rounded-lg border bg-card p-6">
      {/* Title/heading - prominent */}
      <Skeleton height={28} className="mb-4" />

      {/* Content lines - match typical card content */}
      <Skeleton count={2} className="mb-2" />
      <Skeleton count={1} className="mb-4" width="75%" />

      {/* Optional action button at bottom */}
      <Skeleton height={40} width={120} borderRadius={8} className="mt-4" />
    </div>
  )
}
