const express = require("express");
const router = express.Router();

const controller = require("../controllers/antrian.controller");
const rateLimit = require("../middlewares/rateLimit");

router.post("/",rateLimit, controller.create);
router.get("/", controller.getAll);
router.get("/:tgl", controller.getByTanggal);

module.exports = router;