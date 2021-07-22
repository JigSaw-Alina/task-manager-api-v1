const express = require("express");

const userController = require("../controller/user.controller");

const router = express.Router();

router.route("/").get(userController.getAllUser);

// USER ROUTE
router
  .route("/:userid")
  .delete(userController.deleteUser)
  .get(userController.getUser)
  .patch(userController.updateUser);

module.exports = router;
