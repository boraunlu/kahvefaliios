import {
  Platform,
} from 'react-native';

import RNFetchBlob from 'react-native-fetch-blob'
import firebase from 'firebase'
import moment from 'moment';

const fs = RNFetchBlob.fs
const Blob = RNFetchBlob.polyfill.Blob

window.XMLHttpRequest = RNFetchBlob.polyfill.XMLHttpRequest
window.Blob = Blob

class Backend {
  uid = '';
  messagesRef = null;
  lastKeyLoaded=null;
  userAvatar=null;
  // initialize Firebase Backend


  constructor() {
    firebase.initializeApp({
      apiKey: "AIzaSyC2sedAgmiRTUMuCll4Jsfz-Su2vo3KqO4",
     authDomain: "kahve-fali-7323a.firebaseapp.com",
     databaseURL: "https://kahve-fali-7323a.firebaseio.com",
     storageBucket: "kahve-fali-7323a.appspot.com",
    });
    firebase.auth().onAuthStateChanged((user) => {
      if (user) {
        this.setUid(user.uid);
        this.messagesRef = firebase.database().ref('messages/'+user.uid);
        this.setAvatar(user.photoURL)
      } else {

      }
    });
  }
  setUid(value) {
    this.uid = value;
  }
  setAvatar(value) {
    this.userAvatar = value;
  }
  getUid() {
    return this.uid;
  }
  getAvatar() {
    return this.userAvatar;
  }
  logOut(){
    firebase.auth().signOut();

  }
  uploadImage(uri){
    return new Promise((resolve, reject) => {
     const uploadUri = Platform.OS === 'ios' ? uri.replace('file://', '') : uri
       let uploadBlob = null
       var imageName = "";
       var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

       for( var i=0; i < 5; i++ ){
          imageName += possible.charAt(Math.floor(Math.random() * possible.length));
       }
       var mime ='image/jpg'
       const imageRef = firebase.storage().ref('posts').child(imageName)
       fs.readFile(uploadUri, 'base64')
       .then((data) => {
         return Blob.build(data, { type: `${mime};BASE64` })
       })
       .then((blob) => {
         uploadBlob = blob
         return imageRef.put(blob, { contentType: mime })
       })
       .then(() => {
         uploadBlob.close()
         return imageRef.getDownloadURL()
       })
       .then((url) => {
         resolve(url)

       })
       .catch((error) => {
         reject(error)
       })
   })

  }
  sendQuickPayload(payload){

    fetch('https://eventfluxbot.herokuapp.com/webhook/appmessage', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        uid: this.uid,
        quickPayload: payload,
        type:"quick"
      })
    })

  }
  sendPayload(payload){

    fetch('https://eventfluxbot.herokuapp.com/webhook/appmessage', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        uid: this.uid,
        payload: payload,
        type:"payload"
      })
    })

  }

  saveNewUser(token){
    this.messagesRef = firebase.database().ref('messages/'+this.getUid());
    this.messagesRef.push({
      token: token,

    });

  }
  refreshLastLoaded(){
    this.lastKeyLoaded=null;
  }

  //var uploadImage = (uri, imageName, mime) => {}

  loadInitialMessages = (callback) => {


    const loadInitial = (data) => {
      const messages = data.val();
      var callbackobj = [];
      if(messages!==null){
        var counter = 0;
        var uzunluk = Object.keys(messages).length
        Object.keys(messages).forEach((key) => {
            //console.log("keyler "+key)
            counter=counter+1;
            if(counter==uzunluk){console.log("thekey "+key); this.lastKeyLoaded=key}
            var message=messages[key];

            if(message.type!=="typing"){
              message._id=key;
              var simdi = moment()
              var createdAt = moment(message.createdAt)
              if(createdAt.dayOfYear()==simdi.dayOfYear()){
                  callbackobj.unshift(message)
              }
            }
        });
      }
      else{
        this.lastKeyLoaded="asdf"
      }

      callback(callbackobj);

    };
    this.messagesRef.limitToLast(50).once('value',loadInitial);
  }
newfortune = () => {this.lastKeyLoaded="asdf"}
  // retrieve the messages from the Backend
  loadMessages = (callback) => {

    //this.messagesRef.off();
    const onReceive = (data) => {
      const message = data.val();
      var callbackobj = {};
      console.log("datakey"+data.key);
      console.log("lastloaded"+this.lastKeyLoaded)
      if(data.key==this.lastKeyLoaded||this.lastKeyLoaded==null){console.log("aksi")}
      else{
        if(message.type=="text"){
          callbackobj=
          {
            type:message.type,
            _id: data.key,
            text: message.text,
            createdAt: new Date(message.createdAt),
            user: {
              _id: message.user._id,
              name: message.user.name,
              avatar: message.user.avatar,
            }
          }
        }
        else if (message.type=="quick") {
          callbackobj=
          {
            type:message.type,
            _id: data.key,
            text: message.text,
            createdAt: new Date(message.createdAt),
            quick_reply:message.quick_reply,
            user: {
              _id: message.user._id,
              name: message.user.name,
              avatar: message.user.avatar,
            }
          }
        }
        else if (message.type=="image") {
          callbackobj=
          {
            type:message.type,
            _id: data.key,
            image: message.image,
            createdAt: new Date(message.createdAt),
            user: {
              _id: message.user._id,
              name: message.user.name,
            }
          }
        }
        else if (message.type=="button") {
          callbackobj=
          {
            type:message.type,
            _id: data.key,
            text: message.text,
            attachment: message.type,
            buttons: message.buttons,
            createdAt: new Date(message.createdAt),
            user: {
              _id: message.user._id,
              name: message.user.name,
              avatar: message.user.avatar,
            }
          }
        }
        else if (message.type=="generic") {
          callbackobj=
          {
              type:message.type,
            _id: data.key,
            attachment: message.type,
            elements: message.elements,
            createdAt: new Date(message.createdAt),
            user: {
              _id: message.user._id,
              name: message.user.name,
              avatar: message.user.avatar,
            }
          }
        }
        else if (message.type=="typing") {
          callbackobj=
          {
            type:message.type,
            _id: data.key,
            createdAt: new Date(message.createdAt),
            user: {
              _id: message.user._id,
              name: message.user.name,
            }
          }
        }

        callback(callbackobj);


      //console.log(message)

    };
  }
    this.messagesRef.limitToLast(1).on('child_added', onReceive);
    //this.messagesRef.limitToLast(20).once('value',loadInitial);
  }

  getCredits(){

  }
  // send the message to the Backend

  addMessage = (message) => {
    this.messagesRef.push({
      type: "text",
      text: message,
      user:  {
        _id: this.getUid(),
        name: 'user',
        // avatar: 'https://facebook.github.io/react/img/logo_og.png',
      },
      avatar: this.userAvatar,
      createdAt: firebase.database.ServerValue.TIMESTAMP,
    });
  }

  sendMessage = (message) => {


    if(message[0].text){
      for (let i = 0; i < message.length; i++) {

          this.messagesRef.push({
            type: "text",
            text: message[i].text,
            user: message[i].user,
            avatar: this.userAvatar,
            createdAt: firebase.database.ServerValue.TIMESTAMP,
          });


        fetch('https://eventfluxbot.herokuapp.com/webhook/appmessage', {
          method: 'POST',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            uid: this.uid,
            text: message[i].text,
            type:"text"
          })
        })
        .then(function(response){});
      }
      //console.log(message);
    }
    else if (message[0].image) {

        if(message.length>1){
          var imagepusharray=[];
          for (let i = 0; i < message.length; i++) {
            this.messagesRef.push({
              type: "image",
              image: message[i].image,
              user: message[i].user,
              avatar: this.userAvatar,
              createdAt: firebase.database.ServerValue.TIMESTAMP,
            });
            this.uploadImage(message[i].image).then((imagerl)=>{
              imagepusharray.push(imagerl);
              if(i==message.length-1){
                //alert(imagepusharray)
                fetch('https://eventfluxbot.herokuapp.com/webhook/appmessage', {
                  method: 'POST',
                  headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({
                    uid: this.uid,
                    image: imagepusharray,
                    type:"images"
                  })
                })
              }
            })
          }
        }
        else{

          this.messagesRef.push({
            type: "image",
            image: message[0].image,
            user: message[0].user,
            avatar: this.userAvatar,
            createdAt: firebase.database.ServerValue.TIMESTAMP,
          });
          this.uploadImage(message[0].image).then((imagerl) =>{
            fetch('https://eventfluxbot.herokuapp.com/webhook/appmessage', {
              method: 'POST',
              headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                uid: this.uid,
                image: imagerl,
                type:"image"
              })
            })
          })
          //console.log(imagerl)
        }

      }
  }
  // close the connection to the Backend
  closeChat() {
    if (this.messagesRef) {
      this.messagesRef.off();
    }
  }
}

export default new Backend();
