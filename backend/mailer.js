require('dotenv').config();
const nodemailer  = require('nodemailer');

let transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      type: 'OAuth2',
      user: process.env.MAIL_USERNAME,
      pass: process.env.MAIL_PASSWORD,
      clientId: process.env.OAUTH_CLIENTID,
      clientSecret: process.env.OAUTH_CLIENT_SECRET,
      refreshToken: process.env.OAUTH_REFRESH_TOKEN
    }
  });

exports.sendEmail = async (to, subject, html) => {
    try {
        transporter.sendMail({
            from: {
                name: 'Bloom',
                address: process.env.MAIL_USERNAME
            },
            to,
            subject,
            html,
        });
        console.log("Email sent successfully");
    }
    catch (error) {
        console.error("Error sending email:", error);
    }
};