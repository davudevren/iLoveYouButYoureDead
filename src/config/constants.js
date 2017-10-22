import firebase from 'firebase'

const config = {
  apiKey: "AIzaSyACo3An8SvoSRYS8Wm1mWEb3iU7xpSHwz4",
  authDomain: "lindo-17.firebaseapp.com",
  databaseURL: "https://lindo-17.firebaseio.com",
  projectId: "lindo-17",
  storageBucket: "lindo-17.appspot.com",
  messagingSenderId: "447361843355"
}

firebase.initializeApp(config)

const strings = {
  HOME: "Übersicht",
  TITLE: "Gryfensee Heimwuche",

}

export const ref = firebase.database().ref()
export const firebaseAuth = firebase.auth
export const messages = strings;
