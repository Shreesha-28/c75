import * as firebase from 'firebase'
require('@firebase/firestore')

var firebaseConfig = {
    apiKey: "AIzaSyA11jTJ-NF3LEd04dtezg8-wUzSLHE-ri0",
    authDomain: "wireleibrary-9edea.firebaseapp.com",
    databaseURL: "https://wireleibrary-9edea.firebaseio.com",
    projectId: "wireleibrary-9edea",
    storageBucket: "wireleibrary-9edea.appspot.com",
    messagingSenderId: "478831193280",
    appId: "1:478831193280:web:3f5f47a33d0c327f895125",
    measurementId: "G-L4N0Z8R350"
  };
  // Initialize Firebase
  firebase.initializeApp(firebaseConfig);

  export default firebase.firestore()