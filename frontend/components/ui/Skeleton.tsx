interface SkeletonProps {
  width?: string;
  height?: string;
  borderRadius?: string;
  className?: string;
}

export function Skeleton({ width = '100%', height = '14px', borderRadius = '4px', className = '' }: SkeletonProps) {
  return (
    <div
      className={`skeleton ${className}`}
      style={{ width, height, borderRadius }}
      aria-hidden="true"
    />
  );
}

export function SkeletonCard() {
  return (
    <div className="skeleton-card" aria-hidden="true">
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
        <Skeleton width="50%" height="18px" />
        <Skeleton width="20%" height="22px" borderRadius="999px" />
      </div>
      <Skeleton className="skeleton-text" width="70%" />
      <Skeleton className="skeleton-text" width="45%" />
    </div>
  );
}

export function SkeletonStatGrid() {
  return (
    <div className="stat-grid" aria-hidden="true">
      {[1,2,3,4].map(i => (
        <div key={i} className="stat-card" style={{ padding: '1rem 1.1rem' }}>
          <Skeleton width="36px" height="36px" borderRadius="10px" />
          <div style={{ marginTop: '0.75rem' }}>
            <Skeleton width="60%" height="24px" borderRadius="4px" />
            <div style={{ marginTop: '0.4rem' }}>
              <Skeleton width="80%" height="12px" borderRadius="4px" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function SkeletonList({ count = 4 }: { count?: number }) {
  return (
    <div aria-hidden="true">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}
