const router = require("express").Router();
const { createRsvp, getRsvps } = require("../controllers/rsvpController");

router.post("/", createRsvp);
router.get("/", getRsvps);

module.exports = router;
