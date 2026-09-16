// Escapes regex special characters so user search input can never be
// interpreted as a regex pattern (prevents ReDoS / unexpected matches).
const escapeRegex = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

module.exports = escapeRegex;
