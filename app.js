const express = require("express");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");

const mongoSanitize = require("express-mongo-sanitize");

const authRouter = require("./routes/auth.routes");
const taskRouter = require("./routes/task.routes");
const userRouter = require("./routes/user.routes");

const AppError = require("./utils/errors/AppErrors");
const app = express();

app.use(morgan("combined"));
app.use(express.json({ limit: "50kb" }));
app.use(cookieParser());

app.use(mongoSanitize());

app.use("/api/v1/task", taskRouter);
app.use("/api/v1/user", userRouter);
app.use("/api/v1/auth", authRouter);

app.all("*", (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server`, 404));
});

module.exports = app;
