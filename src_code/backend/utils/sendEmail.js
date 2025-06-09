const nodemailer = require('nodemailer');
const {OAuth2Client}=require('google-auth-library')
const GOOGLE_MAILER_CLIENT_ID = '1015015226249-sfuoi6ejbpii4pbdkd6k5ft21sh2j48i.apps.googleusercontent.com'
const GOOGLE_MAILER_CLIENT_SECRET = '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'
const GOOGLE_MAILER_REFRESH_TOKEN = '1//04RHPZ6VWkVDhCgYIARAAGAQSNwF-L9IrQfbytQBBNTJHxj7NAseGATnvsXSCM4xTh-2BUODSMkWJmveI7n8OUr4zljC5T0FM1yc'
const ADMIN_EMAIL_ADDRESS ='hieuthptchuyenbl@gmail.com'
const sendEmail = async options => {
    console.log("day là token")
    const myOAuth2Client = new OAuth2Client(
        GOOGLE_MAILER_CLIENT_ID,
        GOOGLE_MAILER_CLIENT_SECRET
      )
      myOAuth2Client.setCredentials({
        refresh_token: GOOGLE_MAILER_REFRESH_TOKEN
      })

      const myAccessTokenObject = await myOAuth2Client.getAccessToken()
      console.log("đây là access token",myAccessTokenObject)
      // Access Token sẽ nằm trong property 'token' trong Object mà chúng ta vừa get được ở trên
      const myAccessToken = myAccessTokenObject?.token
        const transport = nodemailer.createTransport({
          service: 'gmail',
          auth: {
            type: 'OAuth2',
            user: ADMIN_EMAIL_ADDRESS,
            clientId: GOOGLE_MAILER_CLIENT_ID,
            clientSecret: GOOGLE_MAILER_CLIENT_SECRET,
            refresh_token: GOOGLE_MAILER_REFRESH_TOKEN,
            accessToken: myAccessToken
          }
        })
      
        const mailOptions = {
            from: `phuctruong.310103@gmail.com`,
            to: options.email,
            subject: options.subject,
            text: options.message
        };
      
        transport.sendMail(mailOptions, (error, info) => {
          if (error) {
            console.error('Error sending email:', error);
          } else {
            console.log('Email sent:', info.response);
          }
        });
}

module.exports = sendEmail;