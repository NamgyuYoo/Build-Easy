import Skeleton from 'react-loading-skeleton'
import 'react-loading-skeleton/dist/skeleton.css'

export function ListSkeleton({ items = 5 }: { items?: number }) {
  return (
    <div className="space-y-4">
      {[...Array(items)].map((_, i) => (
        <div key={i} className="flex items-center gap-4 p-4 rounded-lg border bg-card">
          {/* Icon/avatar on left */}
          <Skeleton circle width={40} height={40} />

          {/* Content in middle */}
          <div className="flex-1 space-y-2">
            <Skeleton height={20} width="60%" />
            <Skeleton height={16} width="40%" />
          </div>

          {/* Action on right */}
          <Skeleton height={36} width={36} borderRadius={8} />
        </div>
      ))}
    </div>
  )
}
