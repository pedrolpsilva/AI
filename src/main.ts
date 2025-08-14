import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { ValidationPipe } from '@nestjs/common'
import * as fs from 'fs'
import * as admin  from "firebase-admin"
import processDefaultNotifications from './helper/processDefaultNotifications'
import brokenAnchor from './helper/brokenAnchor'
import * as crypto from 'crypto'
import moduloOperacao from './helper/moduloOperacao'

// (global as any).crypto = crypto
async function bootstrap() {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: "total-trac",
      clientEmail: 'firebase-adminsdk-d7kkb@total-trac.iam.gserviceaccount.com',
      privateKey: "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQCJc4TQ4Bz1BWi2\nOo0uAqNO39MiBWF0ZmgMVKSBpFjixJP+uINR2d367bFzDfzUS3bMdo6w3w1DG2RH\nE1IJMdINl9DAmgSMXCOh9Ecl9lycbyoE8wQZMoZfV9QgFQrTSRRhifXHx0/igk3p\n3cWmB81lGTChbfSdexzk+FbFdnDs2lb76CS4gw50mtzbqSoRRbA61HT3ialnvv3X\ns4V6+plF41d3SDYAZgn7S8yqZtDWd/bTpnC3AdVfKoFlJ2047JOCfAyp9hj6dZVL\nwS/rPE5aosaxV+ZD2d+CNBdCrUWGzgPx0OaIpVR5+Vuq8tVOM7l805lb5DlTSgit\nB8KBKR9VAgMBAAECggEANU5kRX+NK2dQH1Ag3aWvQREj+E8+5t4qXxHahN7AjB2x\nybk0UKOeZ8kUJytXENw9c/lMyIKQyaRPZRM0nxU/wf7NOkzhE7BOL2qlxy6+5vpj\nwOyge8cw/rv4rAKNIrj2Wweelr6RGCbx4Y+dLhFbkmhNCGY01nhfEdvQBx+yluBb\nEq3iH2MCzNEBCXkoRqwfzZx5oY6TromKOB8AuIfHSM+dS3is0dWJc+0Abqq7+w/3\nhw7YJuAnBhpidNPUP1KmzgVLV0EkXaA4B/dzUWjwJ/iLq7CpHToZsNoRp49E4klw\nB81vD2d2ZSxOHboqM69Q2gVaM8pyXlv3jibF1KOFNwKBgQC/DfnYKdwHmMisBFXZ\nGai7CaAVMgCSXdYhGk/6qpRXKLlA2kRQFBpL4h0H83m3ru1syT/674A3tkoi+97k\nkqS+L+LyNgXoom0CoxxO1wHLWmX34sRUoaq15z+YfEy3tXHgL5R5fxIEh86udZ6O\nhp09XOB8sYMOUJDqAXeyGnCP6wKBgQC4LNoxIL+SI4WfmGCWw6WI1Uhs58tDDZVv\nzBtr/3JaD0afLnAbGV7SSyLemnsIv7etRygyWUnJY/0S7uDKFkobuwkh+zpo3xNb\nzwoaGBazCUFRmiRslYa/Av+MpJ2te/bvo0JlJHaDSuu/ZLIntVtiyOihLdCw2M8w\nWH55ILh9vwKBgDdIwAdA9Z5tI4RDLORJfH3C50O62FeCN7gUeRg7y/j8m76cajAR\n4RocL/JhDdONFr7n7U+bhiqY4RMGdxUFKg6upKkZ4NPUTF76+/IEXUyOt/rm75Dd\nxxwj8k8ZiMmQA4evvPL7RidxdOket+beJRngikUKyLWXspdEHXK4G+JJAoGAT4WG\nPFogfS/7PRqk8dPOAJPerq8ys2QFFv1xBaOJM1uPKaH6Y6kDqRcqGiVnZDKrUxT7\nRSoKUvtqRSeBRaB0JR8P5W09HhTbnfN6MCQggPNJEbvVaFDzmjvoLUjSkBqLV5MN\nUvB4f131BnGq/rwuliubTiSjDAjBBOXgzdoT7q8CgYEAu6xLLo25/mNNb8Ysc8x0\nh1tTaKRHTjzYpwUd9g1dnXF+wXtJooadYAabdyQVEl3uV71ZdlgtNkrIB0TDL+vJ\n4Txkn9OcJ8kfa/MNrzlBKyR6wAhYJjSaB9qf1w3DBkauJziGO9TigH8MXLzfU3QW\n3gaRghcmBTlPxUCSgkhvMPc=\n-----END PRIVATE KEY-----\n",
  }),
    projectId: 'total-trac',
    databaseURL: 'https://total-trac-default-rtdb.firebaseio.com',
    storageBucket: 'total-trac.appspot.com',
  });

  // const httpsOptions = {
  //   key: fs.readFileSync('/etc/letsencrypt/live/totaltracapp.com.br/privkey.pem'),
  //   cert: fs.readFileSync('/etc/letsencrypt/live/totaltracapp.com.br/fullchain.pem'),
  // }

  const app = await NestFactory.create(AppModule, {
    // httpsOptions
  })
  
  app.enableCors({
    origin: 'https://totaltracapp.com.br:8890',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  })

  app.useGlobalPipes(
    new ValidationPipe({ transform: true, forbidNonWhitelisted: true }),
  )
  await app.listen(8890) 

  const intervalNotification = setInterval(() => {
    // processDefaultNotifications(app)
    // brokenAnchor(app)
    // moduloOperacao(app)
  }, 1000 * 60)
  return () => clearInterval(intervalNotification)
}

bootstrap();