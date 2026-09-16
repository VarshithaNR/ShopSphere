// One component for the "empty search results" / "failed to load" / generic
// empty-state patterns that repeat across every list page.
function StateMessage({ icon = "📦", title, message, action }) {
    return (
        <div className="state-block card" role="status">
            <div className="state-block__icon" aria-hidden="true">{icon}</div>
            {title && <h3 style={{ marginBottom: 4 }}>{title}</h3>}
            {message && <p className="text-muted">{message}</p>}
            {action}
        </div>
    );
}

export default StateMessage;
