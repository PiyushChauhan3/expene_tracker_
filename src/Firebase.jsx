// // firebaseConfig.js
// import { initializeApp } from 'firebase/app';
// import { getAuth } from 'firebase/auth';

// Import the functions you need from the SDKs you need
// import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// const firebaseConfig = {
//   apiKey: "AIzaSyB-HtQgfrBjmwxsf4e_NqnwinEOmVoo9SI",
//   authDomain: "exma-df5f1.firebaseapp.com",
//   projectId: "exma-df5f1",
//   storageBucket: "exma-df5f1.firebasestorage.app",
//   messagingSenderId: "607080434876",
//   appId: "1:607080434876:web:38d1d2d8bb5e50e1ba14b9"
// };

// Initialize Firebase
// const app = initializeApp(firebaseConfig);

// const firebaseConfig = {
//   apiKey: "AIzaSyCKXyB0y5iC2zFXzuZOS-lesSw4iK_3T3A",
//   authDomain: "personal-expense-982c4.firebaseapp.com",
//   projectId: "personal-expense-982c4",
//   storageBucket: "personal-expense-982c4.appspot.com",
//   messagingSenderId: "929912810991",
//   appId: "1:929912810991:web:1390ab3745b903888eda1a",
//   measurementId: "G-4N1ETLRJJP"
// };

// // Initialize Firebase
// const app = initializeApp(firebaseConfig);
// const auth = getAuth(app);

// export { auth };

// import { initializeApp } from 'firebase/app';
// import { getAuth } from 'firebase/auth';
// import { getFirestore } from 'firebase/firestore';
// import { getStorage } from 'firebase/storage'; // Import Firebase Storage


// const firebaseConfig = {
//   apiKey: "AIzaSyCKXyB0y5iC2zFXzuZOS-lesSw4iK_3T3A",
//   authDomain: "personal-expense-982c4.firebaseapp.com",
//   projectId: "personal-expense-982c4",
//   storageBucket: "personal-expense-982c4.appspot.com",
//   messagingSenderId: "929912810991",
//   appId: "1:929912810991:web:1390ab3745b903888eda1a",
//   measurementId: "G-4N1ETLRJJP"
// };


// // // Your web app's Firebase configuration
// // // For Firebase JS SDK v7.20.0 and later, measurementId is optional
// // const firebaseConfig = {
// //   apiKey: "AIzaSyB_ek-GXA6uwtfp_5CTYY0zh0s5P9sqPrY",
// //   authDomain: "vivek-a84a0.firebaseapp.com",
// //   projectId: "vivek-a84a0",
// //   storageBucket: "vivek-a84a0.firebasestorage.app",
// //   messagingSenderId: "567329145089",
// //   appId: "1:567329145089:web:6d4e76747f2d470d1c5b00",
// //   measurementId: "G-130K8QZBRJ"
// // };



// // Initialize Firebase
// const app = initializeApp(firebaseConfig);



// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage'; // Import Firebase Storage
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDXpCkGOiOueIC3jaeRXFQy0ySOSO20rfg",
  authDomain: "expense-tracker-df20d.firebaseapp.com",
  projectId: "expense-tracker-df20d",
  storageBucket: "expense-tracker-df20d.firebasestorage.app",
  messagingSenderId: "696430129697",
  appId: "1:696430129697:web:c47c982c2a7b34caa6e960"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app); // Initialize Firestore
const storage = getStorage(app); // Initialize Storage
export { auth, db , storage };