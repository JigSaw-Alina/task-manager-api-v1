const _ = require("lodash");

const catchAsync = require("../utils/errors/catchAsync");
const AppError = require("../utils/errors/AppErrors");
const QueryFeatures = require("../utils/queryFeatures");
const Task = require("../models/task.model");

exports.createTask = catchAsync(async (req, res, next) => {
  const newTask = await Task.create({ ...req.body, _createdBy: req.user._id });

  res.status(201).json({
    status: "success",
    env: {
      newTask,
    },
  });

  return next(AppError("Task already exists", 404));
});

exports.getAllTask = catchAsync(async (req, res, next) => {
  const initialQuery = {
    _createdBy: req.user._id,
    status: { $ne: "Deleted" },
  };
  const queryFeature = new QueryFeatures(Task.find(initialQuery), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate()
    .populate();

  const task = await queryFeature.query;

  res.status(201).json({
    status: "success",
    env: {
      task,
    },
  });
});

exports.getTask = catchAsync(async (req, res, next) => {
  const { taskid } = req.params;
  let initialQuery = {
    _id: { $eq: taskid },
    _createdBy: req.user._id,
  };

  const queryFeature = new QueryFeatures(Task.find(initialQuery), req.query)
    .limitFields()
    .populate();

  const task = await queryFeature.query;

  if (!task) return next(AppError("User not found", 400));

  res.status(201).json({
    status: "success",
    env: {
      task,
    },
  });
});

exports.updateTask = catchAsync(async (req, res, next) => {
  const { taskid } = req.params;
  pickField = ["description", "completed"];

  const filteredData = _.pick(req.body, pickField);

  const task = await Task.findOne({ _id: taskid, _createdBy: req.user._id });

  if (!task) return next(new AppError("Task not found", 404));

  const updateTask = await Task.findByIdAndUpdate(task._id, filteredData, {
    runValidator: true,
    new: true,
  });

  res.status(200).json({
    status: "success",
    env: {
      user: updateTask,
    },
  });
});

exports.deleteTask = catchAsync(async (req, res, next) => {
  const { taskid } = req.params;
  let initialQuery = {
    _id: taskid,
    _createdBy: req.user._id,
  };

  const task = await Task.findOneAndUpdate(initialQuery, { status: "Deleted" });

  if (!task) return next(new AppError("Task  not found", 404));

  res.status(204).json({
    status: "success",
    message: "Delete Successfully",
  });
});
