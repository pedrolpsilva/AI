import * as admin from "firebase-admin";

const sendNotification = async (fcm: string, title: string, body: string, type: string) => {
  await admin.messaging().send({
    token: fcm,
    data: {
      type: type
    },
    notification: {
      title: title,
      body: body
    },
    android: {
      priority: 'high',
      notification: {
        channelId: 'alerta',
        sound: 'default',
        defaultSound: true,
        defaultVibrateTimings: true,
        defaultLightSettings: true,
        color: '#125A8E',
        localOnly: false,
        priority: 'max',
        visibility: 'public',
        notificationCount: 5,
      }
    }, 
    apns: {
      payload: {
        aps: {
          sound: {
            name: 'default',
            critical: true,
            volume: 1
          },
        }
      }
    }
  })
  // .then((res) => console.log('NOTIFICOU', res))
  // .catch((err) => {
  //   console.log('ERRO AO NOTIFICAR', err)
  // })
}

export default sendNotification