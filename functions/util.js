"use strict"
const functions = require("firebase-functions");
const axios = require("axios");
const crypto = require("crypto");

const LINE_USER_ID = process.env.LINE_USER_ID
const LINE_MESSAGING_API =  process.env.LINE_MESSAGING_API;
const LINE_CHANNEL_SECRET = process.env.LINE_CHANNEL_SECRET;
const LINE_HEADER = {
  "Content-Type": "application/json",
  Authorization: `Bearer ${process.env.LINE_CHANNEL_ACCESS_TOKEN}`
};

const getProfile = (userId) => {
  return axios({
    method: 'get',
    headers: LINE_HEADER,
    url: `${LINE_MESSAGING_API}/profile/${userId}`
  });
};

const getProfileGroup = (groupId, userId) => {
  return axios({
    method: 'get',
    headers: LINE_HEADER,
    url: `${LINE_MESSAGING_API}/group/${groupId}/member/${userId}`
  });
};

const getProfileRoom = (roomId, userId) => {
  return axios({
    method: 'get',
    headers: LINE_HEADER,
    url: `${LINE_MESSAGING_API}/room/${roomId}/member/${userId}`
  });
};

const reply = (token, payload) => {
  return axios({
    method: "post",
    url: `${LINE_MESSAGING_API}/message/reply`,
    headers: LINE_HEADER,
    data: JSON.stringify({
      replyToken: token,
      messages: payload
    })
  });
};

const push = (targetId, payload) => {
  return axios({
    method: "post",
    url: `${LINE_MESSAGING_API}/message/push`,
    headers: LINE_HEADER,
    data: JSON.stringify({
      to: targetId,
      messages: payload
    })
  });
};

const multicast = (payload) => {
  return axios({
    method: "post",
    url: `${LINE_MESSAGING_API}/message/multicast`,
    headers: LINE_HEADER,
    data: JSON.stringify({
      to: [LINE_USER_ID],
      messages: payload
    })
  });
};

const broadcast = (payload) => {
  return axios({
    method: "post",
    url: `${LINE_MESSAGING_API}/message/broadcast`,
    headers: LINE_HEADER,
    data: JSON.stringify({
      messages: payload
    })
  });
};

const postToDialogflow = async (req) => {
  req.headers.host = "dialogflow.cloud.google.com";
  return axios({
    url: `https://dialogflow.cloud.google.com/v1/integrations/line/webhook/${process.env.DIALOGFLOW_ID}`,
    headers: req.headers,
    method: "post",
    data: req.body
  });
};

const verifySignature = (originalSignature, body) => {
  let text = JSON.stringify(body);
  text = text.replace(/([\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF])/g, (e) => {
    return "\\u" + e.charCodeAt(0).toString(16).toUpperCase() + "\\u" + e.charCodeAt(1).toString(16).toUpperCase();
  });
  const signature = crypto.createHmac("SHA256", LINE_CHANNEL_SECRET).update(text).digest("base64").toString();
  if (signature !== originalSignature) {
    functions.logger.error("Unauthorized");
    return false;
  }
  return true;
};

module.exports = { reply, push, multicast, broadcast, getProfile, getProfileGroup, getProfileRoom, postToDialogflow, verifySignature };