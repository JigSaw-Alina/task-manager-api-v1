const express = require("express");

const taskController = require("../controller/task.controller");
const authController = require("../controller/auth.controller");

const router = express.Router();

router.use(authController.authenticate);

router
  .route("/")
  .post(taskController.createTask)
  .get(taskController.getAllTask);

router
  .route("/:taskid")
  .get(taskController.getTask)
  .delete(taskController.deleteTask)
  .patch(taskController.updateTask);

module.exports = router;
