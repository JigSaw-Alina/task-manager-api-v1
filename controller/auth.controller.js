const _ = require("lodash");

const catchAsync = require("../utils/errors/catchAsync");
const AppError = require("../utils/errors/AppErrors");
const User = require("../models/user.model");
const Task = require("../models/task.model");
const { verifyToken, createCSURF } = require("../utils/tokens/token");
const { searchUser } = require("../utils/users/user");
const {
  sendAuthResponseCookie,
  emailConfig,
} = require("../utils/tokens/response");

exports.signupAppUser = catchAsync(async (req, res, next) => {
  const newUser = await User.create(req.body);

  const { email, status, firstName, lastName } = newUser;

  await emailConfig(email, status, firstName, lastName);
  next();

  res.status(200).json({
    status: "success",
    env: {
      user: newUser,
    },
  });
  return next(new AppError("User already exists", 400));
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  console.log(email, password);

  if (!email || !password)
    return next(new AppError("Please provide email and password", 400));

  const user = await User.findOne({ email, status: { $eq: "Active" } }).select(
    "+password"
  );

  if (!user || !(await user.isPasswordCorrect(password, user.password)))
    return next(new AppError("Incorrect email or password", 401));

  sendAuthResponseCookie(user, 200, res, req);
});

exports.logout = catchAsync(async (req, res, next) => {
  const cookieOptions = {
    httpOnly: true,
    secure: req.secure || req.headers["x-forwarded-proto"] === "https",
    expires: new Date(Date.now() + 1000),
    sameSite: "none",
  };

  res.cookie("auth", "", cookieOptions);
  res.cookie("c_auth", "", cookieOptions);
  res.cookie("_csrf", "", cookieOptions);

  res.status(200).json({
    status: "success",
  });
});

exports.updatePassword = catchAsync(async (req, res, next) => {
  const { currentPassword, newPassword, confirmPassword } = req.body;

  if (!currentPassword)
    return next(new AppError("Provide your current password", 400));
  if (!newPassword) return next(new AppError("Provide your new password", 400));
  if (!confirmPassword)
    return next(new AppError("Provide your confirm password", 400));

  let { user } = await searchUser({ _id: req.user._id });

  if (!user || !(await user.isPasswordCorrect(currentPassword, user.password)))
    return next(new AppError("Incorrect current password", 400));

  user.password = newPassword;
  user.passwordConfirm = confirmPassword;
  await user.save();

  sendAuthResponseCookie(user, 200, res, req);
});

exports.getMe = catchAsync(async (req, res, next) => {
  const user = req.user;
  user.password = undefined;

  res.status(200).json({
    status: "success",
    env: {
      user,
    },
  });
});

exports.deleteMe = catchAsync(async (req, res, next) => {
  const { _id, email, firstName, lastName } = req.user;

  const user = await User.findOneAndUpdate(
    { _id },
    { status: "Deleted" },
    { new: true }
  );

  if (!user) return next(new AppError("User not found", 404));

  // Delete user tasks when user is removed
  await Task.deleteMany({ _createdBy: user._id });
  await emailConfig(email, user.status, firstName, lastName);
  next();

  res.status(204).json({
    status: "success",
    message: "Delete Successfully",
  });
});

exports.updateMe = catchAsync(async (req, res, next) => {
  pickField = ["firstName", "lastName", "email", "password", "mobileNumber"];

  const filteredData = _.pick(req.body, pickField);

  const UpdateMe = await User.findByIdAndUpdate(req.user._id, filteredData, {
    runValidators: true,
    new: true,
  });

  res.status(200).json({
    status: "success",
    env: {
      user: UpdateMe,
    },
  });
});

exports.authenticate = catchAsync(async (req, res, next) => {
  const { authorization, c_auth } = req.headers;
  const allowedStatus = ["Active"];

  let token;
  let csurf_token;

  if (authorization && authorization.startsWith("Bearer"))
    token = authorization.split(" ")[1];
  if (c_auth) csurf_token = c_auth;
  if (req.cookies.auth) token = req.cookies.auth;
  if (req.cookies.c_auth) csurf_token = req.cookies.c_auth;

  if (!token) return next(new AppError("Please log in to continue", 401));
  if (!csurf_token) return next(new AppError("Please log in to continue", 401));

  const userToken = verifyToken(token);

  const { user } = await searchUser({ _id: userToken.id });

  if (!user) return next(new AppError("User no longer exist", 404));

  console.log(user);

  const hashedToken = createCSURF(user, userToken);

  if (csurf_token !== hashedToken)
    return next(new AppError("Please log in to continue", 401));

  if (!allowedStatus.includes(user.status))
    return next(
      new AppError("You do not have permission to perform this action", 403)
    );

  req.user = user;
  next();
});
