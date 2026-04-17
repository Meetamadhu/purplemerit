export default function Skeleton({ variant = 'text', rows = 3 }) {
  if (variant === 'table') {
    return (
      <div className="skeleton-table" aria-hidden="true">
        {Array.from({ length: rows }).map((_, index) => (
          <div key={index} className="skeleton-table-row">
            <span className="skeleton-block skeleton-block-lg" />
            <span className="skeleton-block skeleton-block-lg" />
            <span className="skeleton-block skeleton-block-sm" />
            <span className="skeleton-block skeleton-block-sm" />
            <span className="skeleton-block skeleton-block-sm" />
          </div>
        ))}
      </div>
    );
  }

  if (variant === 'detail') {
    return (
      <div className="skeleton-stack" aria-hidden="true">
        <span className="skeleton-block skeleton-heading" />
        <span className="skeleton-block skeleton-block-lg" />
        <span className="skeleton-block skeleton-block-sm" />
        <span className="skeleton-block skeleton-block-lg" />
      </div>
    );
  }

  return (
    <div className="skeleton-stack" aria-hidden="true">
      {Array.from({ length: rows }).map((_, index) => (
        <span key={index} className="skeleton-block skeleton-block-lg" />
      ))}
    </div>
  );
}