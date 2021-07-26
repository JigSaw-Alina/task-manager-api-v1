const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const Task = require("../models/task.model");

const UserSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: [true, "Please provide first name"],
      trim: true,
    },
    lastName: {
      type: String,
      required: [true, "Please provide last name"],
      trim: true,
    },
    middleName: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
      lowercase: true,
      unique: [true, "Email already exist"],
      required: [true, "Please provide your email"],
      unique: [true, "Email already exist"],
      validate: [validator.isEmail, "Please provide a valid email"],
    },
    age: {
      type: Number,
      trim: true,
    },
    password: {
      type: String,
      select: false,
      minlength: [8, "Minimum password length is 8 characters"],
      required: [true, "Please provide your password"],
    },
    passwordConfirm: {
      type: String,
      required: [true, "Please confirm your password"],
      validate: {
        validator: function (inputPassword) {
          return this.password === inputPassword;
        },
        message: "Password don't match",
      },
    },
    mobileNumber: {
      type: String,
      required: [true, "Please provide your mobileNumber"],
    },
    avatar: {
      type: Buffer
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

// hash
UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  this.password = await bcrypt.hash(this.password, 12);
  this.passwordConfirm = undefined;
  next();
});

UserSchema.methods.isPasswordCorrect = async (inputPassword, userPassword) => {
  return await bcrypt.compare(inputPassword, userPassword);
};

module.exports = mongoose.model("User", UserSchema);
