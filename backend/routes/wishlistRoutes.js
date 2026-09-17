const express = require("express");
const { getWishlist, addToWishlist, removeFromWishlist } = require("../controllers/wishlistController");
const protect = require("../middleware/authMiddleware");

const router = express.Router();

// Every route here is behind `protect` — a wishlist is always the logged-in
// user's own (req.user.id), never addressable by another user's ID.
router.use(protect);

router.get("/", getWishlist);
router.post("/:productId", addToWishlist);
router.delete("/:productId", removeFromWishlist);

module.exports = router;
