const nodeMailer = require('nodemailer');
const { google } = require("googleapis");
const OAuth2 = google.auth.OAuth2;
const myOAuth2Client = new OAuth2(
    "237150710881-4rlhl0119b7e0onf28anlvh3g5egtofs.apps.googleusercontent.com",
    "tO3vbYhXxSDUwgPuLij-4J_r",
    "https://developers.google.com/oauthplayground"
);
myOAuth2Client.setCredentials({
    refresh_token: "1//04QttreWiRox-CgYIARAAGAQSNwF-L9Ir5vWy6qnAydJAA3eo6d89Fe6ezeEHsqf-RzNuY49QN_2WGwdqoKFZ7wMp5bNJwZQRlYI"
});
const myAccessToken = myOAuth2Client.getAccessToken()

const transport = nodeMailer.createTransport({
    service: "gmail",
    auth: {
        type: "OAuth2",
        user: "meu1751@gmail.com", //your gmail account you used to set the project up in google cloud console"
        clientId: "237150710881-4rlhl0119b7e0onf28anlvh3g5egtofs.apps.googleusercontent.com",
        clientSecret: "tO3vbYhXxSDUwgPuLij-4J_r",
        refreshToken: "1//04QttreWiRox-CgYIARAAGAQSNwF-L9Ir5vWy6qnAydJAA3eo6d89Fe6ezeEHsqf-RzNuY49QN_2WGwdqoKFZ7wMp5bNJwZQRlYI",
        accessToken: myAccessToken //access token variable we defined earlier
    }
});

exports.sendMail = (recipientMail, mailObj) => {
    const mailOptions = {
        from: 'meu1751@gmail.com', // sender
        to: recipientMail, // receiver
        subject: mailObj.subject, // Subject
        html: `<p>${mailObj.body}</p>`// html body
    }
    transport.sendMail(mailOptions, function (err, result) {
        if (err) {
            console.log('mailer', err);
        } else {
            transport.close();
        }
    })
}


// ref: https://medium.com/@alexb72/how-to-send-emails-using-a-nodemailer-gmail-and-oauth2-fe19d66451f9