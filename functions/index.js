const util = require('./util');
const flex = require('./flex');
const {
    initializeApp,
    cert
} = require('firebase-admin/app');
const {
    getFirestore
} = require('firebase-admin/firestore');
const functions = require("firebase-functions");
const serviceAccount = require('./config.json');
const { log } = require('firebase-functions/logger');

initializeApp({
    credential: cert(serviceAccount)
});

const db = getFirestore();
const userDb = db.collection("user")
const massageDb = db.collection("message")

exports.Webhook = functions.region("asia-northeast1").https.onRequest(async (req, res) => {
    if (req.method === "POST") {

        if (!util.verifySignature(req.headers["x-line-signature"], req.body)) {
            return res.status(401).send("Unauthorized");
        }
        const events = req.body.events
        let profile = await insertUpdateUser(req.body.events[0].source.userId)

        for (const event of events) {
            if (event === undefined) {
                return res.end();
            }
            if (event.type === "message") {


                if (event.message.type === "text") {

                    let textMessage = event.message.text

                    if (textMessage === "สวัสดี") {
                        await util.reply(event.replyToken, [flex.quickReplyWelcomeMessage(profile.data.displayName)]);
                    }
                    if (textMessage === "report") {
                        insertEventMessage(event.source.userId, event)
                        await util.reply(event.replyToken, [flex.reportSensor('25.1','68')]);
                    }

                }



            }

        }

    }
    return res.send(req.method);
});


// Insert Member by userId
const insertEventMessage = async (userId, events) => {
        await massageDb.add({
            userId: userId,
            events: events,
            createAt: Date.now()
        })
}
// Insert Member by userId
const insertUpdateUser = async (userId) => {

    const profile = await util.getProfile(userId)

    let userDocument = userDb.where("userId", "==", userId)
    let userCount = await userDocument.count().get()
    if (userCount.data().count === 0) {
        await userDb.add({
            userId: profile.data.userId,
            displayName: profile.data.displayName,
            pictureUrl: profile.data.pictureUrl,
            createAt: Date.now()
        })

    } else {
        await userDocument.get().then(function (querySnapshot) {
            querySnapshot.forEach(function (doc) {
                console.log("docid", doc.id);
                userDb.doc(doc.id).update({
                    userId: profile.data.userId,
                    displayName: profile.data.displayName,
                    pictureUrl: profile.data.pictureUrl,
                    updateAt: Date.now()
                })
            });
        });
    }
    return profile

}