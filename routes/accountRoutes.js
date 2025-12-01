const express = require("express");
const accountController = require("../controller/accountController");
const router = express.Router();

router.post("/register", accountController.register);
router.post("/login", accountController.login);
router.post("/logout", accountController.logout);

module.exports = router;
