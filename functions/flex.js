const quickReplyWelcomeMessage = (displayName) => (
  {
  "type": "text",
  "text": "สวัสดี " + displayName + " ยินดีต้อนรับเข้าสู่ LINE Chatbot IOT \n\n วันนี้เราจะมาเริ่มดู รายงานจาก Sensor ของเรากัน \n\n พิมมพืคำว่า 'report' สิ ",
  "quickReply": {
    "items": [{
      "type": "action",
      "imageUrl": "https://cdn-icons-png.flaticon.com/512/1579/1579859.png",
      "action": {
        "type": "message",
        "label": "report",
        "text": "report"
      }
    }]
  }
})


const reportSensor = (Temperature,Humidity) => ({
  "type": "flex",
  "altText": "Flex Message",
  "contents": {
    "type": "bubble",
    "size": "giga",
    "body": {
      "type": "box",
      "layout": "vertical",
      "contents": [
        {
          "type": "box",
          "layout": "vertical",
          "contents": [
            {
              "type": "text",
              "text": "Temperature : °C",
              "color": "#ffffff",
              "weight": "bold",
              "size": "lg"
            },
            {
              "type": "box",
              "layout": "horizontal",
              "contents": [
                {
                  "type": "text",
                  "text": "xxx",
                  "contents": [
                    {
                      "type": "span",
                      "text": Temperature,
                      "size": "50px",
                      "color": "#ffffff",
                      "weight": "bold"
                    }
                  ],
                  "align": "center",
                  "gravity": "center"
                },
                {
                  "type": "image",
                  "url": "https://cdn-icons-png.flaticon.com/512/1579/1579859.png"
                }
              ]
            }
          ],
          "paddingStart": "12%",
          "paddingTop": "4%",
          "paddingBottom": "8%",
          "paddingEnd": "8%"
        },
        {
          "type": "box",
          "layout": "horizontal",
          "contents": [
            {
              "type": "box",
              "layout": "vertical",
              "contents": [],
              "height": "10px",
              "cornerRadius": "sm",
              "background": {
                "type": "linearGradient",
                "angle": "0deg",
                "startColor": "#002e83",
                "endColor": "#0053ea",
                "centerColor": "#0053ea",
                "centerPosition": "32%"
              },
              "width": "100%"
            }
          ],
          "margin": "xxl"
        },
        {
          "type": "box",
          "layout": "vertical",
          "contents": [
            {
              "type": "text",
              "text": "Humidity : %RH",
              "color": "#ffffff",
              "weight": "bold",
              "size": "lg"
            },
            {
              "type": "box",
              "layout": "horizontal",
              "contents": [
                {
                  "type": "text",
                  "contents": [
                    {
                      "type": "span",
                      "text": Humidity,
                      "size": "50px",
                      "color": "#ffffff",
                      "weight": "bold"
                    }
                  ],
                  "align": "center",
                  "gravity": "center"
                },
                {
                  "type": "image",
                  "url": "https://cdn-icons-png.flaticon.com/512/8522/8522675.png"
                }
              ]
            }
          ],
          "paddingStart": "12%",
          "paddingTop": "4%",
          "paddingBottom": "8%",
          "paddingEnd": "8%"
        }
      ],
      "paddingBottom": "8%",
      "paddingEnd": "none",
      "paddingStart": "none",
      "paddingTop": "8%"
    },
    "styles": {
      "header": {
        "backgroundColor": "#1b1b1b"
      },
      "hero": {
        "backgroundColor": "#1b1b1b"
      },
      "body": {
        "backgroundColor": "#1b1b1b"
      }
    }
  }
});



module.exports = {
  quickReplyWelcomeMessage,
  reportSensor
};