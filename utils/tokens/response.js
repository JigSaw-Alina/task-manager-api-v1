const { createToken, verifyToken, createCSURF } = require("./token");
const { sendEmail } = require("../comms/email");

// CREATE HTTP ONLY COOKIE AND SEND RESPONSE
exports.sendAuthResponseCookie = (user, statusCode, res, req) => {
  const token = createToken(user._id);
  const userToken = verifyToken(token);
  const csrf_token = createCSURF(user, userToken);

  const MILLISECONDS_IN_MONTH = 30 * 24 * 60 * 60 * 1000;

  const cookieOptions = {
    httpOnly: true,
    expires: new Date(Date.now() + MILLISECONDS_IN_MONTH),
    secure: req.secure || req.headers["x-forwarded-proto"] === "https",
    sameSite: "none",
  };

  res.cookie("auth", token, cookieOptions);
  res.cookie("c_auth", csrf_token, cookieOptions);

  user.password = undefined;

  res.status(statusCode).json({
    status: "success",
    csrf_token: csrf_token,
    csurf: req.csrfToken,
    token,
    env: {
      user,
    },
  });
};

exports.emailConfig = async (email, status, fName, lName) => {
  const { welcomeEmailTemplate, cancellationEmailTemplate } =
    this.emailTemplate(fName, lName);

  let subjectWelcome = "Thanks for Joining in!";
  let subjectCancellation = "Sorry to see you go!";

  const mailOptions = {
    to: email,
    subject: status === "Active" ? subjectWelcome : subjectCancellation,
    html:
      status === "Active" ? welcomeEmailTemplate : cancellationEmailTemplate,
  };

  await sendEmail(mailOptions);
};

exports.emailTemplate = (fName, lName) => {
  const welcomeEmailTemplate = `<h1>Welcome to the app, ${fName} ${lName}. Let me know how you get along with the app.`;

  const cancellationEmailTemplate = `Goodbye ${fName} ${lName}. I hope to see you back sometime soon.`;

  return { welcomeEmailTemplate, cancellationEmailTemplate };
};
