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

initializeApp({
    credential: cert(serviceAccount)
});

const db = getFirestore();
const userDb = db.collection("user")

exports.Webhook = functions.region("asia-northeast1").https.onRequest(async (req, res) => {
    if (req.method === "POST") {

        if (!util.verifySignature(req.headers["x-line-signature"], req.body)) {
            return res.status(401).send("Unauthorized");
        }
        const events = req.body.events

        for (const event of events) {
            if (event === undefined) {
                return res.end();
            }

            if (event.type === "follow") {
                let profile = await insertUpdateUser(event.source.userId)
                await util.reply(event.replyToken, [flex.quickReplyWelcomeMessage(profile.data.displayName)]);
            }
            if (event.type === "unfollow") {
                deleteGroup(event.source.userId);
            }

            if (event.type === "message") {

                if (event.message.type === "text") {

                    let textMessage = event.message.text

                    if (textMessage === "report") {
                        // GET API Report Sensor
                        await util.reply(event.replyToken, [flex.reportSensor('25.1', '68'), flex.quickReplyReport()]);
                    }

                    if (textMessage === "setting-notify on") {
                        settingNotifyUpdateUser(event.replyToken, event.source.userId, 'on')
                    }
                    if (textMessage === "setting-notify off") {
                        settingNotifyUpdateUser(event.replyToken, event.source.userId, 'off')
                    }
                    // await util.reply(event.replyToken, [flex.quickReplyWelcomeMessage(profile.data.displayName)]);


                }



            }

            if (event.type === "postback") {
                if (event.postback.data === "setting-notify-on") {
                    settingNotifyUpdateUser(event.replyToken, event.source.userId, 'on')
                }
                if (event.postback.data === "setting-notify-off") {
                    settingNotifyUpdateUser(event.replyToken, event.source.userId, 'off')
                }
            }

        }

    }
    return res.send(req.method);
});

exports.Cronjob = functions.region("asia-northeast1").https.onRequest(async (req, res) => {
    if (req.method === "GET") {
        let userId = process.env.LINE_USER_ID
        const profile = await gettingProfile(userId)
        if (profile.notify === "on") {
            await util.push(userId, [flex.reportSensor('25.1', '68'), flex.quickReplyReport()]);
        }
    }
    return res.send(req.method);
});


// Insert and Update Member by userId
const insertUpdateUser = async (userId) => {

    const profile = await util.getProfile(userId)

    let userDocument = userDb.where("userId", "==", userId)
    let userCount = await userDocument.count().get()
    if (userCount.data().count === 0) {
        await userDb.add({
            userId: profile.data.userId,
            displayName: profile.data.displayName,
            pictureUrl: profile.data.pictureUrl,
            notify: 'on',
            createAt: Date.now()
        })

    } else {
        await userDocument.get().then(function (querySnapshot) {
            querySnapshot.forEach(function (doc) {
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

// delete user
const deleteGroup = async (userId) => {
    let userDocument = userDb.where("userId", "==", userId)
    await userDocument.get().then(function (querySnapshot) {
        querySnapshot.forEach(function (doc) {
            doc.ref.delete();
        });
    });
    return
}


// Geeting Profile Member by userId
const gettingProfile = async (userId) => {
    let profile = {}
    let userDocument = userDb.where("userId", "==", userId)
    await userDocument.get().then(function (querySnapshot) {
        querySnapshot.forEach(function (doc) {
            profile = doc.data()
        });
    });
    return profile
}

//  Setting Notify by userId
const settingNotifyUpdateUser = async (replyToken, userId, status) => {


    let userDocument = userDb.where("userId", "==", userId)

    await userDocument.get().then(function (querySnapshot) {
        querySnapshot.forEach(function (doc) {
            userDb.doc(doc.id).update({
                notify: status,
                updateAt: Date.now()
            })
        });
    });

    switch (status) {
        case 'on':
            await util.reply(replyToken, [flex.switchOn(), flex.quickReplyReport()]);
            break
        case 'off':
            await util.reply(replyToken, [flex.switchOff(), flex.quickReplyReport()]);
            break

    }

    return

}