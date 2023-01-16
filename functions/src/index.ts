import * as admin from 'firebase-admin'
import * as functions from 'firebase-functions'
import * as nodemailer from 'nodemailer'

admin.initializeApp()

const sendMail = (email: string, name: string) => {
  let mailTransporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL,
      pass: process.env.PASSWORD,
    }
  });

  let template = `
    <html>
      <body>
        <p>
          Dear ${name},
          <br />
          Greetings!
          
          <br /><br />
          Hope this email finds you well. I am Shujaut Bader, writing to you on
          behalf of the Sir Syed Global Scholar Award (SSGSA) Mentorship and
          Applications Team to thank you for your continued support of our
          mentorship and scholarship program over the last few years. With your
          help and support, the organization has been able to place ~120 AMU
          students globally in various universities and research institutes. As
          the program continues to grow, we are in need of your support now more
          than ever.
          <br />
          Please visit our website to know more about the recent developments
          and program highlights: http://ssgsa.us/index.php

          <br /><br />
          The applications for this session are open, and are due by March 15,
          2021. We are planning to send out the applications for review by
          Friday, March 26, 2021. <b>By replying to this email (preferably
          before March 15th), please confirm if you would be willing to serve
          as a reviewer for this session.</b> If you express interest in
          serving as our reviewer, we will follow-up with another email with
          login credentials to our reviewer's portal. You would have ~15 days
          to review approximately 15 applications at most.

          <br /><br />
          Please do not hesitate to coordinate with us, should you have any
          questions about the review process. You can either write to Chair at
          chair@ssgsa.us or at contact@ssgsa.us
          
          <br /><br />
          Thanks,
          <br />
          SSGSA Team
        </p>
      </body>
    </html>
  `

  let mailDetails = {
    from: 'devs.ssgsa@gmail.com',
    to: email,
    cc: 'devs.ssgsa@gmail.com',
    subject: 'Test Mail for Reviewer Confirmation',
    html: template,
  };
  
  mailTransporter.sendMail(mailDetails, function(err, data) {
    if(err) {
      functions.logger.info(`Error Occurs, ${err}`, { structuredData: true })
    }
  });
}

export const sendReviewerConfirmationMail =
  functions.firestore.document("reviewer_invites/{email}").onWrite((change, context) => {
    if (change.after.exists) {
      const newData = change.after.data()
      if (change.before.exists) {
        const prevData = change.before.data()
        if (newData && prevData && newData.reminder !== prevData.reminder)
          sendMail(context.params.email, newData.name)
      } else if (newData) sendMail(context.params.email, newData.name)
    }
  })
