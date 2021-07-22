const mongoose = require("mongoose");

const TaskSchema = new mongoose.Schema(
  {
    description: {
      type: String,
      required: [true, "Please provide description"],
      trim: true,
    },

    completed: {
      type: Boolean,
      default: false,
    },
    _createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      required: [true, "Please provide _id"],
      ref: "User",
    },

    status: {
      type: String,
      enum: ["Active", "Deleted"],
      default: "Active",
    },
  },
  {
    timestamp: true,
  }
);

module.exports = mongoose.model("Task", TaskSchema);
