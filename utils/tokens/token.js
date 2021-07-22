const jwt = require("jsonwebtoken");
const crypto = require("crypto");

exports.createToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

exports.verifyToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET);
};

exports.createCSURF = (user, userToken) => {
  const csrf_token = `<${user._id}+${user.firstName}+${userToken.exp}+${userToken.iat}/>`;

  return crypto.createHash("sha256").update(csrf_token).digest("hex");
};
