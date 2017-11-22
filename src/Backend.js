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
  falci:null;
  userName:null;
  lastMessageref=null;
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
        if(user.photoURL){
          this.setAvatar(user.photoURL)
        }
        this.setName(user.displayName)
      } else {

      }
    });
  }
  setUid(value) {
    this.uid = value;
  }
  setFalci(value) {
    return new Promise((resolve, reject) => {
      this.falci = value;
      this.messagesRef=firebase.database().ref('messages/'+this.uid+'/'+value);
      this.lastMessageref= firebase.database().ref('messages/'+this.uid+'/lastMessage/'+value);
      resolve(value)
    })

  }
  setAvatar(value) {
    this.userAvatar = value;
  }
  setName(value) {
    this.userName = value;
  }
  getUid() {
    return this.uid;
  }
  getAvatar() {
    return this.userAvatar;
  }
  getName() {
    if(this.userName){
      return this.userName;
    }
    else{
      var user = firebase.auth().currentUser;
      return user.displayName
    }

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

       for( var i=0; i < 13; i++ ){
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
  clearUnread(){
      var unreadref =  firebase.database().ref('messages/'+this.getUid()+'/lastMessage/'+this.falci+'/');
      unreadref.update({read:true})
  }
  deleteData(){
    var deleteref = firebase.database().ref('messages/'+this.getUid());
    deleteref.remove()

  }
  deleteThread(falciNo){

    var deleteref2 =  firebase.database().ref('messages/'+this.getUid()+'/lastMessage/'+falciNo);
      deleteref2.remove()
      var deleteref = firebase.database().ref('messages/'+this.getUid()+'/'+falciNo);
      deleteref.remove()
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




  loadInitialMessages = (callback) => {


    const loadInitial = (data) => {
      const messages = data.val();
      var callbackobj = [];
      var simdi = moment()
      var saat = simdi.hour();
      if(messages!==null){
        var counter = 0;
        var uzunluk = Object.keys(messages).length
        Object.keys(messages).forEach((key) => {
            //console.log("keyler "+key)
            counter=counter+1;
            if(counter==uzunluk){
              this.lastKeyLoaded=key
            }
            var message=messages[key];

            if(message.type!=="typing"){
              message._id=key;
              callbackobj.unshift(message)
            }
        });
      }
      else{
        this.lastKeyLoaded="asdf"
      }

      callback(callbackobj);
    };
    this.clearUnread()
    this.messagesRef.limitToLast(50).once('value',loadInitial);
  }

  loadOldMessages = (falciNo) => {
    return new Promise((resolve, reject) => {
      var lastmessagesref = firebase.database().ref('messages/'+this.uid+'/'+falciNo);
      lastmessagesref.once('value')
      .then(function(dataSnapshot) {
        const messages = dataSnapshot.val();
        var callbackobj = [];
        var counter = 0;
        var uzunluk = Object.keys(messages).length
        Object.keys(messages).forEach((key) => {
            //console.log("keyler "+key)
            counter=counter+1;
            if(counter==uzunluk){
               this.lastKeyLoaded=key

               //alert(key)
               if(falciNo=="bizden"){
                 var updates = {};
                 updates['/' + key+'/read'] = true;
                 lastmessagesref.update(updates)
               }
             }
            var message=messages[key];

            if(message.type!=="typing"){
              message._id=key;
              callbackobj.unshift(message)

            }
        });
        resolve(callbackobj)
      })
      .catch((error) => {
        reject(error)
      })

    })
   }

setSharedWeek = () => {
  fetch('https://eventfluxbot.herokuapp.com/appapi/setSharedWeek', {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      uid: this.uid,
      shared: true
    })
  })
}

setProfile = (name,age,iliski,meslek) => {

  fetch('https://eventfluxbot.herokuapp.com/appapi/setProfile', {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      uid: this.uid,
      name:name,
      age: age,
      iliski: iliski,
      meslek: meslek,
    })
  })
  //alert("age "+age+" iliski "+iliski+" meslek "+meslek)

}

appRated = () => {
  fetch('https://eventfluxbot.herokuapp.com/webhook/appRated', {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      uid: this.uid,
    })
  })

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
              avatar: message.user.avatar,
            }
          }
        }
        else if (message.type=="action") {
          callbackobj=
          {
            type:message.type,
            _id: data.key,
            action: message.action,
            createdAt: new Date(message.createdAt),
            user: {
              _id: message.user._id,
              name: message.user.name,
              avatar: message.user.avatar,
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
              avatar: message.user.avatar,
            }
          }
        }

        callback(callbackobj);
        this.clearUnread()

    };
  }
    this.messagesRef.limitToLast(1).on('child_added', onReceive);

  }

  lastMessageUpdate = (callback) => {

    const onUpdate = (data) => {
      callback(data.val())
    }
    firebase.database().ref('messages/'+this.uid+'/lastMessage').on('child_changed', onUpdate);

  }

  addCredits(credit,from){
    var messageBody ={}
    if(from){
      messageBody={
        uid: this.uid,
        credit: credit,
        from:from,
      }
    }
    else{
      messageBody={
        uid: this.uid,
        credit: credit,
      }
    }
    fetch('https://eventfluxbot.herokuapp.com/appapi/addCredits', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(messageBody)
    })
  }
  // send the message to the Backend
  getLastMessages = () => {
    return new Promise((resolve, reject) => {
      var lastseenref = firebase.database().ref('messages/'+this.uid+'/lastSeen');
      lastseenref.set({time:firebase.database.ServerValue.TIMESTAMP}).then(() => {
        lastseenref.once('value').then((timesnapshot) => {
          var currentTime = timesnapshot.val().time

          var lastmessagesref = firebase.database().ref('messages/'+this.uid+'/lastMessage');
          lastmessagesref.once('value')
          .then((dataSnapshot) => {
            var response ={}
            var aktif =null
            var output = [];
            var data = dataSnapshot.val()

            for (var key in data) {
                data[key].key = key;   // save key so you can access it from the array (will modify original data)
                output.push(data[key]);
            }
            if(output.length>0){
              output.sort(function(a,b) {
                  return(b.createdAt - a.createdAt);
              });

              if(moment(currentTime).diff(moment(output[0].createdAt),"hours")<3){
                if(output[0].text){
                  if(!output[0].text.includes('--- ')){
                    aktif=output[0]
                    output.shift()
                  }
                }
              }

            }
            response.output = output
            response.aktif =aktif
            resolve(response)
          })
          .catch((error) => {
            reject(error)
          })
        })
      })
   })

  }
  addMessage = (message) => {
    this.messagesRef.push({
      type: "text",
      text: message,
      user:  {
        _id: this.getUid(),
        name: this.userName,
        avatar: this.userAvatar,
      },

      createdAt: firebase.database.ServerValue.TIMESTAMP,
    });
  }

  sendMessage = (message) => {

    var lastmessagetext=''

    if(message){
      if(message[0].text){
        for (let i = 0; i < message.length; i++) {

            this.messagesRef.push({
              type: "text",
              text: message[i].text,
              user: message[i].user,
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
        lastmessagetext=message[0].text
      }
      else if (message[0].image) {

        if(message.length>1){
          var imagepusharray=[];
          for (let i = 0; i < message.length; i++) {
            this.messagesRef.push({
              type: "image",
              image: message[i].image,
              user: message[i].user,
              createdAt: firebase.database.ServerValue.TIMESTAMP,
            });

            /*
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
            .catch(error => {
              imagepusharray=['https://s3.eu-central-1.amazonaws.com/kahvefali/images/kahveler/0.jpg','https://s3.eu-central-1.amazonaws.com/kahvefali/images/kahveler/0.jpg','https://s3.eu-central-1.amazonaws.com/kahvefali/images/kahveler/0.jpg']
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
            })*/
          }
          imagepusharray=['https://s3.eu-central-1.amazonaws.com/kahvefali/images/kahveler/0.jpg','https://s3.eu-central-1.amazonaws.com/kahvefali/images/kahveler/0.jpg','https://s3.eu-central-1.amazonaws.com/kahvefali/images/kahveler/0.jpg']
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
        else{

          this.messagesRef.push({
            type: "image",
            image: message[0].image,
            user: message[0].user,
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
              image: 'https://s3.eu-central-1.amazonaws.com/kahvefali/images/kahveler/0.jpg',
              type:"image"
            })
          })
          /*
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
          .catch(error => {
            fetch('https://eventfluxbot.herokuapp.com/webhook/appmessage', {
              method: 'POST',
              headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                uid: this.uid,
                image: 'https://s3.eu-central-1.amazonaws.com/kahvefali/images/kahveler/0.jpg',
                type:"image"
              })
            })
          })*/
          //console.log(imagerl)
        }
        lastmessagetext="Fotoğraf"
      }
      this.lastMessageref.set({createdAt:firebase.database.ServerValue.TIMESTAMP,read:true,user:this.uid,text:lastmessagetext})
    }
  }
  getBizden = () => {
    return new Promise((resolve, reject) => {
          var response ={}
          var lastmessagesref = firebase.database().ref('messages/'+this.uid+'/bizden');
          lastmessagesref.once('value')
          .then((dataSnapshot) => {
            resolve(dataSnapshot.val())
          })
          .catch((error) => {
            reject(error)
          })

   })

  }
  // close the connection to the Backend
  closeChat() {
    if (this.messagesRef) {
      this.messagesRef.off();
    }
  }

  addComment = (falid,comment) => {
    fetch('https://eventfluxbot.herokuapp.com/webhook/addComment', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        falid: falid,
        comment: comment,
      })
    })
  }

  like = (falid,index) => {
    fetch('https://eventfluxbot.herokuapp.com/appapi/like', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        falid: falid,
        index: index,
        uid:this.getUid()
      })
    })
  }

  uploadImages = (images) => {
    let urls = [];
    return new Promise((resolve, reject) => {

      var imageslength=images.length;
      this.uploadImage(images[0])
      .then((url)=>{
        urls.push(url)
        if(imageslength>1){
          this.uploadImage(images[1])
          .then((url)=>{
            urls.push(url)
            if(imageslength>2){
              this.uploadImage(images[2])
              .then((url)=>{
                urls.push(url)
                //this.postSosyal(question,urls,anonim)
                resolve(urls)

              })
              .catch(error => {
                reject(error)
              })
            }else {
              //this.postSosyal(question,urls,anonim)
              resolve(urls)
            }
          })
          .catch(error => {
            reject(error)
          })
        }
        else {
            //this.postSosyal(question,urls,anonim)
            resolve(urls)
        }
      })
      .catch(error => {
        reject(error)
      })

   })

  }

  postSosyal = (question,images,anonim) => {
    fetch('https://eventfluxbot.herokuapp.com/appapi/postSosyal', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        question: question,
        photos: images,
        anonim: !anonim,
        uid:this.getUid()
      })
    })

  }
}

export default new Backend();
