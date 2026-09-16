function Pagination({ page, totalPages, onChange }) {
    if (totalPages <= 1) return null;

    return (
        <nav className="pagination" aria-label="Pagination">
            <button
                className="btn btn--outline btn--sm"
                onClick={() => onChange(page - 1)}
                disabled={page <= 1}
            >
                ← Prev
            </button>
            <span className="text-sm text-muted" aria-current="page">
                Page {page} of {totalPages}
            </span>
            <button
                className="btn btn--outline btn--sm"
                onClick={() => onChange(page + 1)}
                disabled={page >= totalPages}
            >
                Next →
            </button>
        </nav>
    );
}

export default Pagination;
