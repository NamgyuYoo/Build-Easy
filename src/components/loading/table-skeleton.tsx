import Skeleton from 'react-loading-skeleton'
import 'react-loading-skeleton/dist/skeleton.css'

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="w-full">
      {/* Header row */}
      <div className="flex gap-4 border-b pb-4 mb-4">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} height={20} width="25%" />
        ))}
      </div>

      {/* Data rows */}
      {[...Array(rows)].map((_, i) => (
        <div key={i} className="flex gap-4 py-3 border-b">
          <Skeleton height={20} width="20%" />
          <Skeleton height={20} width="30%" />
          <Skeleton height={20} width="25%" />
          <Skeleton height={20} width="15%" />
          {/* Action button in last column */}
          <Skeleton height={32} width={56} borderRadius={8} />
        </div>
      ))}
    </div>
  )
}
