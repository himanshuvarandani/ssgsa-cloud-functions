import * as admin from 'firebase-admin'
import * as functions from 'firebase-functions'
import * as nodemailer from 'nodemailer'

admin.initializeApp()

const sendRevConfirmationMail = (email: string, name: string) => {
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
          Please avoid this email if already received.
          <br />
          ----------------------
          <br />
        </p>
        <p>
          Dear ${name},
          <br />
          Greetings!
          
          <br /><br />
          On behalf of the Sir Syed Global Scholar Award (SSGSA), we extend our
          sincere appreciation for your steadfast support of our mentorship and
          scholarship initiatives throughout recent years.

          <br /><br />
          We are reaching out to you today to extend an invitation to
          participate as a reviewer for the upcoming session of the SSGSA.
          Applications for this session are now open and are set to close on
          <b>March 11, 2024</b>. Our aim is to dispatch the applications for
          review by <b>March 18, 2024</b>. Your confirmation to serve as a
          reviewer for this session would be greatly valued.

          <br /><br />
          To confirm your willingness to participate, kindly click on the link
          provided below:

          <br /><br />
          <b>Reviewer Confirmation Link:
          https://www.ssgsa.us/reviewer/confirmation/${email}</b>
          
          <br /><br />
          As a reviewer, you will have approximately 15 days to assess
          approximately 10-12 applications at most. To facilitate your review
          process, the SSGSA Applications Team will furnish you with detailed
          instructions via a separate email upon receipt of your gracious
          approval.
          
          <br /><br />
          Should you have any inquiries or require further clarification
          regarding the review process, please do not hesitate to reach out to
          us at chair@ssgsa.us. We are here to assist you in any way possible.

          <br /><br />
          Thank you for considering our invitation. Your participation as a
          reviewer would be invaluable to us and to the applicants of the SSGSA.

          <br /><br />
          Warm regards,
          <br />
          Sachin Gupta & Sajad Shiekh
          <br />
          Co-Chairs, Sir Syed Global Scholar Award (SSGSA)
        </p>
      </body>
    </html>
  `

  let mailDetails = {
    from: 'devs.ssgsa@gmail.com',
    to: email,
    cc: 'chair@ssgsa.us',
    replyTo: 'chair@ssgsa.us',
    subject: '[SSGSA] Invitation to Serve as a Reviewer for the Sir Syed Global Scholar Award',
    html: template,
  };
  
  mailTransporter.sendMail(mailDetails, function(err, data) {
    if(err) {
      functions.logger.info(`Error Occurs, ${err}`, { structuredData: true })
    }
  });
}


const sendRevSetsMail = (email: string, name: string, password: string) => {
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
          ------------------------------------------------------------------
          <br />
          This is an auto-generated email from the SSGSA Application Portal.
          Please write to us at chair@ssgsa.us if you have questions.
          <br />
          ------------------------------------------------------------------
          <br />
        </p>
        <p>
          Dear ${name},

          <br /><br />
          Greetings!
          
          <br /><br />
          Thank you for agreeing to participate in reviewing the applications
          for the SSGSA Application Cycle 2024-25. We appreciate your
          commitment to this process.

          <br /><br />
          You have been allocated 10 to 15 applications for review. To assist
          you in this task, we have provided detailed instructions and a grading
          rubric. We kindly request that you review these materials before
          beginning your evaluations to ensure consistency in our assessments.

          <br /><br />
          Please find the link to the orientation slides containing the instructions and rubric:
          <br />
          https://docs.google.com/presentation/d/1fnvufdZQJi3O_nTSU-8dzjrT85r5DFbP/

          <br /><br />
          We have made minor revisions to the grading rubric to enhance grading
          consistency. You can download the updated rubric by logging in to the
          application portal. <b>Within the portal, there are specific columns
          designated for entering grades based on the rubric criteria.</b>

          <br /><br />
          Access the portal using the following credentials:
          <br />
          <b>Link:</b> https://www.ssgsa.us/reviewer
          
          <br /><br />
          <b>Username:</b> ${email}
          <br />
          <b>Password:</b> ${password}

          <br /><br />
          <b>The deadline for completing your reviews is April 01, 2024.</b>
          Should you have any questions or require assistance, please do not
          hesitate to contact us at chair@ssgsa.us.

          <br /><br />
          We kindly ask that you endeavor to complete your reviews before the
          deadline. In the event that you are unable to review the assigned
          applications, please notify us at least a week before the deadline.
          This advance notice allows us to arrange for alternative reviewers,
          ensuring the quality and timeliness of our decision-making process.
          
          <br /><br />
          Thank you once again for your valuable contribution to the SSGSA
          application review process.

          <br /><br />
          Best Regards,
          <br />
          Sachin Gupta & Sajad Shiekh
          <br />
          Co-chair SSGSA
        </p>
      </body>
    </html>
  `

  let mailDetails = {
    from: 'SSGSA Admin <devs.ssgsa@gmail.com>',
    to: email,
    cc: 'chair@ssgsa.us',
    replyTo: 'chair@ssgsa.us',
    subject: '[SSGSA] Credentials for Reviewing Applications',
    html: template,
  };
  
  return mailTransporter.sendMail(mailDetails);
}

export const sendReviewerConfirmationMail =
  functions.firestore.document("reviewer_invites/{email}").onWrite((change, context) => {
    if (change.after.exists) {
      const newData = change.after.data()
      if (change.before.exists) {
        const prevData = change.before.data()
        if (newData && prevData && newData.reminder !== prevData.reminder)
          sendRevConfirmationMail(context.params.email, newData.name)
      } else if (newData) sendRevConfirmationMail(context.params.email, newData.name)
    }
  })

export const sendReviewerSetsMail =
  functions.https.onRequest((request, response) => {
    const email = request.query.email
    const name = request.query.name
    const password = request.query.password

    if (!email || !password) {
      functions.logger.warn(
        `Email/Password not provided for ${email} (Name: ${name} )`,
        { structuredData: true }
      )
      response.status(400).send("Email & Password are required")
      return
    }

    functions.logger.info(
      `Sending sets mail to reviewer ${email} (Name: ${name} )`,
      { structuredData: true }
    )
    sendRevSetsMail(String(email), String(name), String(password))
      .then(() => response.status(200).send("Mail Sent to " + email))
      .catch(() => response.status(400).send("Error occured while sending mail to " + email))
  })
