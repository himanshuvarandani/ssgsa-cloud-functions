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
          On behalf of the Sir Syed Global Scholar Award (SSGSA), we sincerely
          appreciate your support to our program to empower aspiring students
          for higher education abroad.

          <br /><br />
          We are reaching out to invite you to serve as a reviewer for the
          upcoming SSGSA application cycle for the session 2025-26.
          Applications for this session are currently open and will close on
          <b>March 08, 2025</b>. We plan to distribute applications for review
          by <b>March 16, 2024</b>, and your participation in this process
          would be greatly valued.

          <br /><br />
          To confirm your willingness to serve as a reviewer, please click on
          the link below:

          <br /><br />
          <b>Reviewer Confirmation Link:
          https://www.ssgsa.us/reviewer/confirmation/${email}</b>
          
          <br /><br />
          Review Process:
          <br />
          <ul>
            <li>
              You will be assigned approximately 10-12 applications at most.
              It should not take more than 3 hours in total to review all the
              applications.
            </li>
            <li>
              You will have around 15 days to review the applications.
            </li>
            <li>
              The SSGSA Applications Team will provide you with detailed
              guidelines via a separate email once you confirm your
              participation.
            </li>
          </ul>

          <br />
          If you have any questions or need further clarification regarding the
          review process, please feel free to reach out to us at
          application.ssgsa@gmail.com or chair@ssgsa.us.
          
          <br /><br />
          Thank you for considering our invitation. Your support as a reviewer
          would be invaluable to both SSGSA and the students we serve.

          <br /><br />
          Warm regards,
          <br />
          Sachin Gupta & Sajad Shiekh
          <br />
          Co-Chairs SSGSA
        </p>
      </body>
    </html>
  `

  let mailDetails = {
    from: 'devs.ssgsa@gmail.com',
    to: email,
    cc: 'chair@ssgsa.us',
    replyTo: 'chair@ssgsa.us',
    subject: '[SSGSA] Invitation to Serve as a Reviewer for Application Cycle 2025-26',
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
          Thank you for participating in the application review process for the
          SSGSA Application Cycle 2025-26. We appreciate your commitment to
          this holistic application review process.

          <br /><br />
          You have been allocated 10 to 15 applications for review. To assist
          you in this task, we have provided detailed instructions and a grading
          rubric (<a href='https://shorturl.at/OlHp2'>link to material</a>). We
          kindly request that you review these materials before beginning your
          evaluations to ensure consistency in our assessments. We would request
          you to dedicate at least 10-15 mins for the review of each application
          for ensuring the high standard of the application review process.

          <br /><br />
          <b>Within the portal, there are specific columns designated for
          entering grades based on the rubric criteria.</b>

          <br /><br />
          Access the portal using the following credentials:
          <br />
          <b>Link:</b> https://www.ssgsa.us/reviewer
          
          <br /><br />
          <b>Username:</b> ${email}
          <br />
          <b>Password:</b> ${password}

          <br /><br />
          <b>The deadline for completing your reviews is Saturday March 29,
          2025.</b> Should you have any questions or require assistance, please
          do not hesitate to contact us at chair@ssgsa.us or
          application.ssgsa@gmail.com.

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
    subject: '[SSGSA] Invitation to Serve as a Reviewer for Application Cycle 2025-26',
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
