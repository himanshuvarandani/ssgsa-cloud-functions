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
          Hope this email finds you well. I am Kashif Ahmad, writing to you on
          behalf of the Sir Syed Global Scholar Award (SSGSA) Applications Team
          to thank you for your continued support of our mentorship and
          scholarship program over the last few years. With your help and
          support, the organization has been able to place ~145+ AMU students
          globally in various universities and research institutes.  As the
          program continues to grow, we are in need of your support now more
          than ever. Please visit our website to know more about the recent
          developments and program highlights: http://ssgsa.us.

          <br /><br />
          The applications for this session are open, and are due by February
          14, 2023. We are planning to send out the applications for review by
          February 24, 2023. <b>Please confirm if you are willing to serve as a
          reviewer for this session by clicking on the link below.</b>

          <br /><br />
          <b>Link: https://www.ssgsa.us/reviewer/confirmation/${email}</b>
          
          <br /><br />
          You would have around 15 days to review approximately 15 applications
          at most. In order to assist you through the review process, SSGSA
          Applications Team will also be organizing a workshop on Feb 18, 2023.
          The attendance is optional in it, but highly encouraged. The details
          will be sent once we get your kind approval.
          
          <br /><br />
          Please do not hesitate to coordinate with us, should you have any
          questions about the review process. You can either write to me at
          kkashif@alumni.purdue.edu or the Chair at chair@ssgsa.us.

          <br /><br />
          Thanks,
          <br />
          Kashif Ahmad
          <br />
          On behalf of SSGSA Applications Team
        </p>
      </body>
    </html>
  `

  let mailDetails = {
    from: 'devs.ssgsa@gmail.com',
    to: email,
    cc: 'chair@ssgsa.us',
    replyTo: 'chair@ssgsa.us',
    subject: '[SSGSA] Request to Review Applications',
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
