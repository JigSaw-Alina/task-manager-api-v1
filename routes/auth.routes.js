const express = require("express");

const authController = require("../controller/auth.controller");


const router = express.Router();

router.post("/signup", authController.signupAppUser);
router.post("/login", authController.login);

router.use(authController.authenticate);

router.post("/logout", authController.logout);
router.patch("/update", authController.updatePassword);

router
  .route("/me")
  .get(authController.getMe)
  .delete(authController.deleteMe)  
  .patch(authController.updateMe)

router
  .route("/me/avatar")
  .post(authController.upload.single('upload'), authController.uploadAvatar)
  .delete(authController.deleteAvatar)


// router.get("/me/:id/avatar", authController.getAvatar)





  

module.exports = router;
