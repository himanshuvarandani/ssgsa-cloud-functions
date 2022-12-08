import * as admin from 'firebase-admin'
import * as functions from 'firebase-functions'

admin.initializeApp()

export const helloWorld = functions.https.onRequest((request, response) => {
  functions.logger.info('Hello logs!', { structuredData: true })
  response.status(200).send(new Date().getTime().toString())
})

export const helloWorldNow = functions.https.onRequest((request, response) => {
  functions.logger.info('Hello logs!', { structuredData: true })
  response
    .status(200)
    .send(new Date().getTime().toString() + ' is the current time')
})
