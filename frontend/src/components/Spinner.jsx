function Spinner({ label = "Loading...", small = false, fullPage = false }) {
    const content = (
        <span className="row" style={{ gap: 10, justifyContent: "center" }}>
            <span className={`spinner${small ? " spinner--sm" : ""}`} aria-hidden="true" />
            <span className="visually-hidden">{label}</span>
            {!small && <span className="text-muted">{label}</span>}
        </span>
    );

    if (fullPage) {
        return <div className="state-block" role="status">{content}</div>;
    }

    return content;
}

export default Spinner;
