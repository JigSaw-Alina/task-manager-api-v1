const sgMail = require("@sendgrid/mail");

exports.sendEmail = async ({ to, subject, html }) => {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);

  const mailOptions = {
    to,
    from: process.env.FROM_MAIL,
    subject,
    html,
  };

  await sgMail.send(mailOptions);
};
