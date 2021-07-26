const mongoose = require("mongoose");

// catch unhandled sync code (GLOBAL)
process.on("uncaughtException", (err) => {
  console.log("UNCAUGHT EXECEPTION");
  console.log(err.name, err.message, err.stack);
  process.exit(1);
});

require("dotenv").config();
const app = require("./app");

// connect to DB
mongoose
  .connect(process.env.DATABASE, {
    useCreateIndex: true,
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
  })
  .then(() => console.log("Connected to DB"));

// start server
const server = app.listen(process.env.PORT, () =>
  console.log(`Server is running at port ${process.env.PORT}`)
);

//  catch unhandled async code (GLOBAL)
process.on("unhandledRejection", (err) => {
  console.log("UNHANDLED REJECTION!");
  console.log(err.name, err.message);
  // shutdown the server
  server.close(() => {
    // shutdown the application
    process.exit(1);
  });
});

// SIGTERM = signal that is used to cause a program to really stop running. (used to maintain application healthy state)
process.on("SIGTERM", () => {
  console.log("SIGTERM SIGNAL");

  server.close(() => {
    console.log("System is shutting down gracefully...");
  });
});
