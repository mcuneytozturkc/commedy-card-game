import { initializeApp } from 'firebase/app'
import { getDatabase } from 'firebase/database'

// Logo Bilmece çok oyunculu mod için Firebase Realtime Database
const firebaseConfig = {
  apiKey: 'AIzaSyA9M8Worx1TJAEnBimNYzMIYNRlj5WDZwg',
  authDomain: 'commedy-card-game.firebaseapp.com',
  databaseURL: 'https://commedy-card-game-default-rtdb.europe-west1.firebasedatabase.app',
  projectId: 'commedy-card-game',
}

const app = initializeApp(firebaseConfig)
export const db = getDatabase(app)
