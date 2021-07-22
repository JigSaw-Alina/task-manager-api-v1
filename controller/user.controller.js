const _ = require("lodash");

const catchAsync = require("../utils/errors/catchAsync");
const AppError = require("../utils/errors/AppErrors");
const User = require("../models/user.model");
const Task = require("../models/task.model");
const QueryFeatures = require("../utils/queryFeatures");

exports.getAllUser = catchAsync(async (req, res, next) => {
  let initialQuery;

  const queryFeature = new QueryFeatures(User.find(initialQuery), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate()
    .populate();

  const user = await queryFeature.query;
  res.status(201).json({
    status: "success",
    env: {
      user,
    },
  });
});

exports.getUser = catchAsync(async (req, res, next) => {
  const { userid } = req.params;
  let initialQuery = {
    _id: { $eq: userid },
  };

  const queryFeature = new QueryFeatures(User.find(initialQuery), req.query)
    .limitFields()
    .populate();

  const user = await queryFeature.query;

  if (!user) return next(AppError("User not found", 400));

  res.status(201).json({
    status: "success",
    env: {
      user,
    },
  });
});

exports.updateUser = catchAsync(async (req, res, next) => {
  const { userid } = req.params;
  pickField = ["firstName", "lastName", "email", "password", "mobileNumber"];

  const filteredData = _.pick(req.body, pickField);

  const user = await User.findById(userid);

  if (!user) return next(new AppError("User not found", 404));

  const updatedUser = await User.findByIdAndUpdate(user._id, filteredData, {
    runValidators: true,
    new: true,
  });

  res.status(200).json({
    status: "success",
    env: {
      user: updatedUser,
    },
  });
});

exports.deleteUser = catchAsync(async (req, res, next) => {
  const { userid } = req.params;

  const user = await User.findOneAndUpdate(userid, { status: "Deleted" });

  if (!user) return next(new AppError("User not found", 404));

  // Delete user tasks when user is removed
  await Task.deleteMany({ _createdBy: user._id });
  next();

  res.status(204).json({
    status: "success",
    message: "Delete Successfully",
  });
});
