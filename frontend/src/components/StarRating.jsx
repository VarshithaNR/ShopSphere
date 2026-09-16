// Renders a rating as filled/empty stars. Read-only display — not an input.
function StarRating({ rating = 0, count, size = "normal" }) {
    const rounded = Math.round(rating * 2) / 2; // nearest half-star
    const full = Math.floor(rounded);
    const half = rounded - full === 0.5;
    const empty = 5 - full - (half ? 1 : 0);

    const stars = "★".repeat(full) + (half ? "⯨" : "") + "☆".repeat(Math.max(0, empty));

    return (
        <span
            className={`stars${rating === 0 ? " stars--muted" : ""}`}
            style={size === "small" ? { fontSize: "12px" } : undefined}
            aria-label={`Rated ${rating.toFixed(1)} out of 5${count !== undefined ? ` from ${count} review${count === 1 ? "" : "s"}` : ""}`}
        >
            {stars}
            {count !== undefined && (
                <span className="text-muted text-sm" style={{ marginLeft: 6 }}>
                    {rating > 0 ? rating.toFixed(1) : "No ratings"}{count > 0 ? ` (${count})` : ""}
                </span>
            )}
        </span>
    );
}

export default StarRating;
