function QuantitySelector({ quantity, max, onChange, size = "normal" }) {
    const decrease = () => onChange(Math.max(1, quantity - 1));
    const increase = () => onChange(Math.min(max, quantity + 1));

    return (
        <div className="row" style={{ gap: 8 }} role="group" aria-label="Quantity">
            <button
                type="button"
                className={`btn btn--outline${size === "small" ? " btn--sm" : ""}`}
                onClick={decrease}
                disabled={quantity <= 1}
                aria-label="Decrease quantity"
            >
                −
            </button>
            <span style={{ minWidth: 24, textAlign: "center", fontWeight: 600 }} aria-live="polite">
                {quantity}
            </span>
            <button
                type="button"
                className={`btn btn--outline${size === "small" ? " btn--sm" : ""}`}
                onClick={increase}
                disabled={quantity >= max}
                aria-label="Increase quantity"
            >
                +
            </button>
        </div>
    );
}

export default QuantitySelector;
