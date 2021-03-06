import {
  Platform,
} from 'react-native';

import firebase from 'react-native-firebase'
import moment from 'moment';
import axios from 'axios';
import ImageResizer from 'react-native-image-resizer';



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
    /*
    firebase.initializeApp({
      apiKey: "AIzaSyC2sedAgmiRTUMuCll4Jsfz-Su2vo3KqO4",
     authDomain: "kahve-fali-7323a.firebaseapp.com",
     databaseURL: "https://kahve-fali-7323a.firebaseio.com",
     storageBucket: "kahve-fali-7323a.appspot.com",
    });*/
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

     const uploadUri = Platform.OS === 'ios' ? uri.replace('file://','') : uri
     const ref= 'postsnew/'+moment().year()+'-'+moment().month()+'-'+moment().date()
     ImageResizer.createResizedImage(uri, 500, 500,'JPEG',80)
       .then(({uri}) => {
         let uploadBlob = null
         var imageName = "";
         var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

         for( var i=0; i < 13; i++ ){
            imageName += possible.charAt(Math.floor(Math.random() * possible.length));
         }
         var mime ='image/jpg'
         const imageRef = firebase.storage().ref(ref).child(imageName)
         imageRef.put(uri, { contentType: mime })

         .then(() => {

           return imageRef.getDownloadURL()
         })
         .then((url) => {
           resolve(url)

         })
         .catch((error) => {
           reject(error)
         })
       }).catch((err) => {
         console.log(err);
           reject(error)
       });

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
  deleteFalsever(falciNo){

    var deleteref2 =  firebase.database().ref('messages/'+this.getUid()+'/falsever/bilgiler/'+falciNo);
      deleteref2.remove()
      var deleteref =  firebase.database().ref('messages/'+this.getUid()+'/falsever/mesajlar/'+falciNo);
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
      callbackobj.sort(function(b, a){
          var keyA = new Date(a.createdAt),
              keyB = new Date(b.createdAt);
          // Compare the 2 dates
          if(keyA < keyB) return -1;
          if(keyA > keyB) return 1;
          return 0;
      })
      console.log(callbackobj)
      callback(callbackobj);
    };
    this.clearUnread()
    this.messagesRef.orderByKey().once('value',loadInitial);
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
        callbackobj.sort(function(b, a){
            var keyA = new Date(a.createdAt),
                keyB = new Date(b.createdAt);
            // Compare the 2 dates
            if(keyA < keyB) return -1;
            if(keyA > keyB) return 1;
            return 0;
        })
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

setCity = (city) => {

  fetch('https://eventfluxbot.herokuapp.com/appapi/setCity', {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      uid: this.uid,
      city:city,
    })
  })
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
      //console.log("datakey"+data.key);
      //console.log("lastloaded"+this.lastKeyLoaded)
      if(data.key==this.lastKeyLoaded||this.lastKeyLoaded==null){}
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
            //console.log(data)
            for (var key in data) {
              if(data[key]!==null){
                data[key].key = key;   // save key so you can access it from the array (will modify original data)
                output.push(data[key]);
              }
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

  sendMessageToFalsever = (message,falsever) => {

    var bilgilerref= firebase.database().ref('messages/'+this.uid+'/falsever/bilgiler/'+falsever.fireID);
    var mesajlarref= firebase.database().ref('messages/'+this.uid+'/falsever/mesajlar/'+falsever.fireID);
    var tomesajlarref= firebase.database().ref('messages/'+falsever.fireID+'/falsever/mesajlar/'+this.uid);
    var tobilgilerref= firebase.database().ref('messages/'+falsever.fireID+'/falsever/bilgiler/'+this.uid);
    var lastmessagetext=''

    if(message){
      if(message[0].text){
        for (let i = 0; i < message.length; i++) {


            bilgilerref.set({createdAt:firebase.database.ServerValue.TIMESTAMP,read:true,name:falsever.name,avatar:falsever.avatar,text:message[i].text})
            tobilgilerref.set({createdAt:firebase.database.ServerValue.TIMESTAMP,read:false,name:message[i].user.name,avatar:message[i].user.avatar,text:message[i].text})
            mesajlarref.push({
              type: "text",
              text: message[i].text,
              user: message[i].user,
              createdAt: firebase.database.ServerValue.TIMESTAMP,
            });
            tomesajlarref.push({
              type: "text",
              text: message[i].text,
              user: message[i].user,
              createdAt: firebase.database.ServerValue.TIMESTAMP,
            });


          fetch('https://eventfluxbot.herokuapp.com/webhook/falsevermessage', {
            method: 'POST',
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              toid: falsever.fireID,
              text:message[i].text,
              falsever:message[i].user,
              type:"text"
            })
          })

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
        }
        lastmessagetext="Fotoğraf"
      }

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

  getFalsevers = () => {
    return new Promise((resolve, reject) => {
          var response ={}
          var lastmessagesref = firebase.database().ref('messages/'+this.uid+'/falsever/bilgiler');
          lastmessagesref.on('value')
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

  addComment = (falid,comment,firstcomment) => {
    fetch('https://eventfluxbot.herokuapp.com/webhook/addComment', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        uid:this.getUid(),
        falid: falid,
        comment: comment,
        firstcomment:!firstcomment
      })
    })
  }

  voteFor = (vote,falid) => {
    fetch('https://eventfluxbot.herokuapp.com/appapi/voteFor', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        uid:this.getUid(),
        falid: falid,
        vote:vote
      })
    })
  }

  deleteComment = (falid,index) => {
    fetch('https://eventfluxbot.herokuapp.com/appapi/deleteComment', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        id:falid,
        index:index
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

  dislike = (falid,index) => {
    fetch('https://eventfluxbot.herokuapp.com/appapi/dislike', {
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

  deleteSosyal = (falid) => {
    fetch('https://eventfluxbot.herokuapp.com/appapi/deletePost', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        id: falid
      })
    })
  }


  resize = () => {
    ImageResizer.createResizedImage(this.state.image.uri, 800, 600, 'JPEG', 80)
    .then(({uri}) => {
      this.setState({
        resizedImageUri: uri,
      });
    }).catch((err) => {
      console.log(err);
      return Alert.alert('Unable to resize the photo',
        'Check the console for full the error message');
    });
  }

  uploadProfilePic = (uri) => {

    return new Promise((resolve, reject) => {
      uri = Platform.OS === 'ios' ? uri.replace('file://', '') : uri
      const imageRef = firebase.storage().ref('profilepics').child(this.getUid())
      var mime ='image/jpg'
      imageRef.put(uri, { contentType: mime })
      .then(() => {

        return imageRef.getDownloadURL()
      })
      .then((url) => {
        resolve(url)
        firebase.auth().currentUser.updateProfile({
          photoURL:url
        })
        fetch('https://eventfluxbot.herokuapp.com/appapi/setProfilePic', {
          method: 'POST',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            url: url,
            uid:this.getUid()
          })
        })


      })
      .catch((error) => {
        reject(error)
      })

   })

  }

  setProfilePic = (url) => {
    fetch('https://eventfluxbot.herokuapp.com/appapi/setProfilePic', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url: url,
        uid:this.getUid()
      })
    })
  }

  uploadImages = (images) => {
    let urls = [];
    return new Promise((resolve, reject) => {
      if(images[0].includes("firebasestorage")){
        resolve(images)
      }
      else {
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
      }


   })

  }

  postSosyal = (question,images,anonim,poll1,poll2,type) => {
    fetch('https://eventfluxbot.herokuapp.com/appapi/postSosyalNew', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        question: question,
        photos: images,
        anonim: !anonim,
        uid:this.getUid(),
        poll1:poll1,
        poll2:poll2,
        type:type
      })
    })

  }
  setBio = (bio) =>{

    fetch('https://eventfluxbot.herokuapp.com/appapi/setBio', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        bio:bio,
        uid:this.getUid()
      })
    })
  }
  changeDmStatus = (status) => {
    fetch('https://eventfluxbot.herokuapp.com/appapi/changeDm', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        uid: this.getUid(),
        status:status
      })
    })
  }

  startChat = (falsever,credit) => {
    fetch('https://eventfluxbot.herokuapp.com/appapi/startChat', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        uid: this.getUid(),
        falsever:falsever.fireID,
        credit:credit
      })
    })
  }

  createTicket = () => {
    fetch('https://eventfluxbot.herokuapp.com/webhook/createTicket', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        uid: this.getUid(),
      })
    })
  }

  getGunluk = (falId) => {
    return new Promise((resolve, reject) => {
      axios.post('https://eventfluxbot.herokuapp.com/appapi/getGunluk', {
        falId: falId,
      })
      .then( (response) => {
        var responseJson=response.data
        resolve(responseJson)
      })
      .catch(function (error) {

      });
    })
  }

  getSosyal = (falId) => {
    return new Promise((resolve, reject) => {
      axios.post('https://eventfluxbot.herokuapp.com/appapi/getSosyal', {
        falId: falId,
      })
      .then( (response) => {
        var responseJson=response.data
        resolve(responseJson)
      })
      .catch(function (error) {

      });
    })
  }

  getSocials = () => {
    return new Promise((resolve, reject) => {
      axios.post('https://eventfluxbot.herokuapp.com/appapi/getSosyals3', {
        uid: this.getUid(),
      })
      .then((response) => {
        resolve(response.data)
      })
      .catch(function (error) {
        reject(error)
      });
    })
  }

  getCommenteds = () => {
    return new Promise((resolve, reject) => {
      axios.post('https://eventfluxbot.herokuapp.com/appapi/getCommenteds', {
        uid: this.getUid(),
      })
      .then((response) => {
        resolve(response.data)
      })
      .catch(function (error) {
        reject(error)
      });
    })
  }

  getAllFals = () => {
    return new Promise((resolve, reject) => {
      axios.post('https://eventfluxbot.herokuapp.com/appapi/getAllFals', {
        uid: this.uid,
      })
      .then( (response) => {

        var responseJson=response.data

        resolve(responseJson)


      })
      .catch(function (error) {
        reject(error)
      });
    })
  }

  superle = (falId) => {
    fetch('https://eventfluxbot.herokuapp.com/appapi/superle', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        falId: falId,
      })
    })
  }

  blockUser = (falseverId) => {
    var deleteref2 =  firebase.database().ref('messages/'+this.getUid()+'/falsever/bilgiler/'+falseverId);
      deleteref2.remove()
      var deleteref =  firebase.database().ref('messages/'+this.getUid()+'/falsever/mesajlar/'+falseverId);
        deleteref.remove()
        var deleteref3 =  firebase.database().ref('messages/'+falseverId+'/falsever/bilgiler/'+this.getUid());
          deleteref3.remove()
          var deleteref4 =  firebase.database().ref('messages/'+falseverId+'/falsever/mesajlar/'+this.getUid());
            deleteref4.remove()
    fetch('https://eventfluxbot.herokuapp.com/appapi/blockUser', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        falseverId: falseverId,
        fireID:this.getUid()
      })
    })
  }

  setGunlukRead = (falId) => {
    return new Promise((resolve, reject) => {
      fetch('https://eventfluxbot.herokuapp.com/appapi/setGunlukRead', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          falId: falId,

        })
      })
      .then( (response) => {

        resolve(response)


      })
      .catch(function (error) {
        reject(error)
      });
    })
  }

  setSosyalRead = (falId) => {
    return new Promise((resolve, reject) => {
      fetch('https://eventfluxbot.herokuapp.com/appapi/setSosyalRead', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          falId: falId,

        })
      })
      .then( (response) => {

        resolve(response)


      })
      .catch(function (error) {
        reject(error)
      });
    })
  }

}

export default new Backend();
