const express = require("express");
const accountController = require("../controller/accountController");
const router = express.Router();

router.post("/register", accountController.register);
router.post("/login", accountController.login);
router.post("/logout", accountController.logout);
router.get('/:id', accountController.getAccountById);
// PATCH /api/accounts/:id
// Cập nhật thông tin tài khoản
router.patch('/:id', accountController.updateAccount);
router.get('/', accountController.getAllAccountInfor);

module.exports = router;
