import path from 'path';

import pug from 'pug';
import nodemailer from 'nodemailer';

import { google } from 'googleapis';
import { htmlToText } from 'html-to-text';

const client_id = process.env.CLIENT_ID;
const client_secret = process.env.CLIENT_SECRET;
const redirect_uri = process.env.REDIRECT_URI;
const refresh_token = process.env.REFRESH_TOKEN;

const __dirname = path.resolve();

const oAuth2Client = new google.auth.OAuth2(
  client_id,
  client_secret,
  redirect_uri,
);
oAuth2Client.setCredentials({ refresh_token });

class Email {
  constructor(from, to) {
    this.from = from || `Natours reviews <${process.env.EMAIL_ADDRESS}>`;
    this.to = to;
  }

  async newTransporter() {
    if (process.env.NODE_ENV === 'production') {
      const accessToken = await oAuth2Client.getAccessToken();

      return nodemailer.createTransport({
        service: 'gmail',
        auth: {
          type: 'OAuth2',
          user: process.env.EMAIL_ADDRESS,
          clientId: client_id,
          clientSecret: client_secret,
          refreshToken: refresh_token,
          accessToken,
        },
      });
    }

    return nodemailer.createTransport({
      host: 'sandbox.smtp.mailtrap.io',
      port: 587,
      secure: false, // use SSL
      auth: {
        user: '96a08a70697a5f',
        pass: 'e36ed86250f328',
      },
    });
  }

  async sendEmail(subject, template, data) {
    const rederedTemplate = pug.renderFile(
      path.join(__dirname, 'views', 'email', template),
      data,
    );
    const rederedTemplateText = htmlToText(rederedTemplate);

    const mailOptions = {
      from: this.from,
      to: this.to,
      subject,
      html: rederedTemplate,
      text: rederedTemplateText,
    };

    const transporter = await this.newTransporter();
    await transporter.sendMail(mailOptions);
  }

  async sendWelcomeEmail(data) {
    await this.sendEmail('Welcome to Natours', 'welcome.pug', data);
  }

  async sendResetPasswordEmail(data) {
    await this.sendEmail('Reset password', 'resetPassword.pug', data);
  }
}

export default Email;
