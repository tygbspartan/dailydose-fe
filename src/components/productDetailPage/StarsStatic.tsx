// Server-safe star rating (inline SVG, no client hooks / icon library) so it
// renders into the initial HTML for review sections.
export default function StarsStatic({
  rating,
  size = 20,
}: {
  rating: number;
  size?: number;
}) {
  const rounded = Math.round(rating * 2) / 2; // nearest half
  return (
    <span
      className="inline-flex items-center gap-0.5"
      role="img"
      aria-label={`Rated ${rating} out of 5`}
    >
      {[1, 2, 3, 4, 5].map((i) => {
        const fill =
          rounded >= i ? "full" : rounded >= i - 0.5 ? "half" : "empty";
        return (
          <svg
            key={i}
            width={size}
            height={size}
            viewBox="0 0 24 24"
            aria-hidden="true"
            className="shrink-0"
          >
            {fill === "half" && (
              <defs>
                <linearGradient id={`half-${i}`}>
                  <stop offset="50%" stopColor="#E8C03E" />
                  <stop offset="50%" stopColor="#E5E5E5" />
                </linearGradient>
              </defs>
            )}
            <path
              d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
              fill={
                fill === "full"
                  ? "#E8C03E"
                  : fill === "half"
                  ? `url(#half-${i})`
                  : "#E5E5E5"
              }
            />
          </svg>
        );
      })}
    </span>
  );
}
