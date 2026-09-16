const mongoose = require("mongoose");

// Returns true if `id` is a syntactically valid MongoDB ObjectId.
// Used to turn "CastError: Cast to ObjectId failed" (an ugly 500) into a clean 400.
const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

module.exports = isValidObjectId;
