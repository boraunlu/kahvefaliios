import React from 'react';
import {
  Platform,
  StyleSheet,
  Text,
  Button,
  Keyboard,
  TouchableHighlight,
  TouchableOpacity,
  Modal,
  View,
  Dimensions,
  Image,
  BackAndroid,
  ImageBackground,
  Animated,
  Easing,
  Switch,
  Alert,
  TextInput,
  AsyncStorage,
  ActivityIndicator
} from 'react-native';
import Sound from 'react-native-sound'
import PropTypes from 'prop-types';
import { ShareDialog, ShareButton } from 'react-native-fbsdk';
import { NavigationActions } from 'react-navigation'
import firebase from 'react-native-firebase'
import Icon from 'react-native-vector-icons/FontAwesome';
import {GiftedChat, Actions,Bubble,Send,Composer,InputToolbar,Avatar,Message} from 'react-native-gifted-chat';
import CustomActions from '../components/CustomActions';
import Toast from 'react-native-root-toast'
import Backend from '../Backend';
import ChatModal from '../components/ChatModal';
import Elements from '../components/Elements';
import { NativeModules } from 'react-native'
import PopupDialog, { DialogTitle } from 'react-native-popup-dialog';
import StarRating from 'react-native-star-rating';
import ProfilePicker from '../components/ProfilePicker';
import { observable } from 'mobx';
import { observer, inject } from 'mobx-react';
import Spinner from 'react-native-loading-spinner-overlay';
const { InAppUtils } = NativeModules
import * as Animatable from 'react-native-animatable';
require('../components/data/falcilar.js');

const Banner = firebase.admob.Banner;
const intersti = firebase.admob().interstitial('ca-app-pub-6158146193525843/3388147416');
const AdRequest = firebase.admob.AdRequest;
const request = new AdRequest();



const shareModel = {
         contentType: 'link',
          contentUrl: "https://facebook.com/kahvefalisohbeti",
  contentDescription: 'Kahve Falı Sohbeti!',
};
const shareLinkContent = {
  contentType: 'link',
  contentUrl: "https://facebook.com/kahvefalisohbeti",
  contentDescription: 'Hemen mesaj atın, sohbet ederek falınıza bakalım !',
};


var whoosh = new Sound('yourturn.mp3', Sound.MAIN_BUNDLE, (error) => {
  if (error) {
    //console.log('failed to load the sound', error);
    return;
  }
  // loaded successfully
});

function generateRandom(uzunluk, mevcut,gender,falType) {
  var num =0
  if(falType==1||falType==2){
   num =  Math.floor(Math.random()*(23-19+1)+19);
  }
  else {
    if(gender=='male'){
      num =  Math.floor(Math.random()*(18-9+1)+9);
    }
    else {
        num =  Math.floor(Math.random()*(13-0+1)+0);
    }
  }

    return (num === mevcut ) ? generateRandom(uzunluk, mevcut,gender,falType) : num;
}

class CustomMessage extends Message {
  renderAvatar() {
    return (
      <Avatar {...this.getInnerComponentProps()} />
    );
  }
}

@inject("userStore")
@inject("socialStore")
@observer
export default class Chat extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      messages: [],
      loadEarlier: true,
      typingText: null,
      isLoadingEarlier: false,
      modalVisible: false,
      modalElements:[],
      initialLoaded:false,
      loadingVisible:this.props.navigation.state.params.newFortune,
      quick_reply: null,
      falType:this.props.navigation.state.params.falType,
      buttons: null,
      falciNo:this.props.navigation.state.params.falciNo,
      shareLinkContent: shareLinkContent,
      keyboardHeight:300,
      inputVisible:true,
      starCount: 0,
      sikayet:"",
      falseSwitchIsOn:true,
      buttonOpacity: new Animated.Value(0),
      spinnerVisible: false,
      checkValidation:false,
      sosyalInput:'',
      falPhotos:[],
      keyboardDidShow:false,
      anonimSwitchIsOn:true,
    };


    this._isMounted = false;
    this.onSend = this.onSend.bind(this);
    this.onReceive = this.onReceive.bind(this);
    this.renderCustomActions = this.renderCustomActions.bind(this);
    this.renderBubble = this.renderBubble.bind(this);
    this.renderFooter = this.renderFooter.bind(this);
    this.renderSend = this.renderSend.bind(this);
    this.renderComposer = this.renderComposer.bind(this);
    this.renderInputToolbar = this.renderInputToolbar.bind(this);
    this.onLoadEarlier = this.onLoadEarlier.bind(this);
    this.shareLinkWithShareDialog = this.shareLinkWithShareDialog.bind(this);
    this.setnavigation = this.setnavigation.bind(this);

    this._isAlright = null;
  }

  intersti = firebase.admob().interstitial('ca-app-pub-6158146193525843/3388147416');
  AdRequest = firebase.admob.AdRequest;
  request = new this.AdRequest();

  static navigationOptions = ({ navigation }) => ({
    headerLeft:<Icon name="chevron-left" style={{marginLeft:10}} color={'#1194F7'} size={25} onPress={() => {navigation.state.params.setnavigation('Greeting')}} />  ,
    headerRight:<Button title={"Puan Ver"} onPress={() => {navigation.state.params.showpopup()}}/>,
    headerTitle:<View style={{flexDirection:'row',justifyContent:'center',alignItems:'center'}}><Image style={{height:30,width:30, borderRadius:15,marginRight:10}} source={{uri:falcilar[navigation.state.params.falciNo].url}}></Image><Text style={{fontWeight:'bold',fontSize:20}}>{falcilar[navigation.state.params.falciNo].name}</Text></View>,

  })


  showpopup = () => {
    this.popupDialog.show()
  }

  onStarRatingPress = (rating) => {
    this.setState({
      starCount: rating
    });
  }

  sendReview = () => {
    if(this.state.starCount==0){
      alert('Lütfen önce puan veriniz')
    }
    else{
      if(this.state.starCount<3){
        Alert.alert('Puanlama',"Yorumlarınız bizim için çok değerli. Puanlamanız için teşekkür ederiz.")
        fetch('https://eventfluxbot.herokuapp.com/sendMail', {
          method: 'POST',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            uid: Backend.getUid(),
            star:this.state.starCount,
            text:this.state.sikayet,
            falci:this.state.falciNo
          })
        })
        this.popupDialog.dismiss()
      }
      else{
        fetch('https://eventfluxbot.herokuapp.com/sendMail', {
          method: 'POST',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            uid: Backend.getUid(),
            star:this.state.starCount,
            text:this.state.sikayet,
            falci:this.state.falciNo
          })
        })
        Keyboard.dismiss()
        this.popupDialog.dismiss()
        this.popupDialog2.show()
      }
    }
  }

   setnavigation(route){

    if(route=="Greeting"){
      const resetAction = NavigationActions.reset({
         index: 0,
         actions: [
           NavigationActions.navigate({ routeName: 'Greeting',params:{crredit:this.props.userStore.userCredit}})
         ]
       })
       this.props.navigation.dispatch(resetAction)
    }
    else{
      BackAndroid.removeEventListener('hardwareBackPress', this.backhandler);
      const { navigate } = this.props.navigation;
      navigate(route)
    }

  }

  navigateto = (destination,falciNo,falType) => {

    const { navigate } = this.props.navigation;
    if(destination=="Chat"){
          var randomnumber = generateRandom(falcilar.length,this.props.userStore.user.currentFalci,this.props.userStore.user.gender,falType)
          Backend.setFalci(randomnumber).then(() => {
            const resetAction = NavigationActions.reset({
              index: 0,
              actions: [
                NavigationActions.navigate({ routeName: 'Chat',params:{newFortune:true,falciNo:randomnumber,falType:falType}})
              ]
            })
            this.props.navigation.dispatch(resetAction)
          })
          //navigate('Chat',{newFortune:false})

    }
    else{
      navigate(destination,{falciNo:falciNo})
    }
  }

  fadeButtons = () => {
    this.state.buttonOpacity.setValue(0)
    Animated.timing(
      this.state.buttonOpacity,
      {
        toValue: 1,
        duration: 3000,
      }
    ).start()
  }

  setModalVisibility(visible) {
    ////console.log(visible);
    this.setState(() => {
      return {
        modalVisible: visible,
      };
    });
  }

  pay = (credit2) => {
    this.setState({spinnerVisible:true})
    var credit = 0;
    switch (credit2) {
      case 0:
          credit = 100;
          break;
      case 1:
          credit = 100;
          break;
      case 2:
          credit = 150;
          break;
      case 3:
          credit = 50;
          break;
    }
    var products = [
       'com.grepsi.kahvefaliios.'+credit,
    ];
    InAppUtils.loadProducts(products, (error, products) => {
      if(error){this.setState({spinnerVisible:false})}
      else{
        var identifier = 'com.grepsi.kahvefaliios.'+credit
        InAppUtils.purchaseProduct(identifier, (error, response) => {
          this.setState({spinnerVisible:false})
           // NOTE for v3.0: User can cancel the payment which will be availble as error object here.
           if(error){
             if(credit2==25){
               Backend.sendPayload("nohizlibak")
             }
             else{
               Backend.sendPayload("paymentiptal")
             }
           }
           else{
             if(response && response.productIdentifier) {
                this.navigateto('Chat',0,credit2)
                Backend.addCredits(0,"chat"+credit2)
             }
           }
        });
      }
    });

  }

  payDevam = () => {
    this.setState({spinnerVisible:true})
    var products = [
       'com.grepsi.kahvefaliios.100',
    ];
    InAppUtils.loadProducts(products, (error, products) => {
      if(error){this.setState({spinnerVisible:false})}
      else{

        var identifier = 'com.grepsi.kahvefaliios.100'
        InAppUtils.purchaseProduct(identifier, (error, response) => {
          this.setState({spinnerVisible:false})
           // NOTE for v3.0: User can cancel the payment which will be availble as error object here.
           if(error){

           }
           else{
             if(response && response.productIdentifier) {
               this.popupSoru.dismiss();
               Backend.sendPayload('continuefal')
               Backend.addCredits(0,"chat100"+bahsis)
               //Alert.alert('Bahşiş',"Memnun kalmanıza çok sevindik. Bahşişiniz falcımıza iletiliyor.")
             }
           }
        });
      }
    });
  }

  payBahsis = (bahsis) => {
    this.setState({spinnerVisible:true})
    var products = [
       'com.grepsi.kahvefaliios.bahsis'+bahsis,
    ];
    InAppUtils.loadProducts(products, (error, products) => {
      if(error){this.setState({spinnerVisible:false})}
      else{

        var identifier = 'com.grepsi.kahvefaliios.bahsis'+bahsis
        InAppUtils.purchaseProduct(identifier, (error, response) => {
          this.setState({spinnerVisible:false})
           // NOTE for v3.0: User can cancel the payment which will be availble as error object here.
           if(error){

           }
           else{
             if(response && response.productIdentifier) {
               Backend.sendPayload('bahsis'+bahsis)
               Backend.addCredits(0,"bahsis"+bahsis)
               Alert.alert('Bahşiş',"Memnun kalmanıza çok sevindik. Bahşişiniz falcımıza iletiliyor.")
             }
           }
        });
      }
    });
  }

  paySosyal = (urls) => {
    this.setState({spinnerVisible:true})
    var products = [
       'com.grepsi.kahvefaliios.50',
    ];
    InAppUtils.loadProducts(products, (error, products) => {
      if(error){this.setState({spinnerVisible:false})}
      else{

        var identifier = 'com.grepsi.kahvefaliios.50'
        InAppUtils.purchaseProduct(identifier, (error, response) => {
          this.setState({spinnerVisible:false})
           // NOTE for v3.0: User can cancel the payment which will be availble as error object here.
           if(error){

           }
           else{
             if(response && response.productIdentifier) {
               Backend.postSosyal(this.state.sosyalInput,urls,this.state.anonimSwitchIsOn)
               this.popupSosyal.dismiss()
               Keyboard.dismiss()
               this.setState({modalVisible:false,inputVisible:false})
               setTimeout(()=>{Alert.alert("Teşekkürler","Falınız diğer falseverlerle paylaşıldı. Sosyal sayfanıza giderek falınıza gelen yorumlarını takip edebilirsiniz!")},150)
             }
           }
        });
      }
    });
  }

  startGunluk2 = () => {
    if(this.props.userStore.profileIsValid){
      var userData =this.props.userStore.user
      if(!userData.appGunlukUsed){
        this.navigateto('Chat',0,0)
      }else {
        if(this.props.userStore.userCredit<100){
          this.pay(0)
        }
        else{
          this.navigateto('Chat',0,0)
          Backend.addCredits(-100)
        }
      }
      Backend.setProfile(this.props.userStore.userName,this.props.userStore.age,this.props.userStore.iliskiStatus,this.props.userStore.meslekStatus)
    }
    else{
      this.setState({checkValidation:true})
    }
  }


  startAsk2 = () => {
    if(this.props.userStore.profileIsValid){
      if(this.props.userStore.userCredit<100){
                this.pay(1)
      }
      else{
        Backend.addCredits(-100)
        this.props.userStore.increment(-100)
        this.navigateto('Chat',0,1);
      }
      Backend.setProfile(this.props.userStore.userName,this.props.userStore.age,this.props.userStore.iliskiStatus,this.props.userStore.meslekStatus)
    }
    else{
      this.setState({checkValidation:true})
    }
  }



  startDetay2 = () => {
    if(this.props.userStore.profileIsValid){
        if(this.props.userStore.userCredit<150){
                  this.pay(2)
        }
        else{
          Backend.addCredits(-150)
          this.props.userStore.increment(-150)
          this.navigateto('Chat',0,2);
        }
        Backend.setProfile(this.props.userStore.userName,this.props.userStore.age,this.props.userStore.iliskiStatus,this.props.userStore.meslekStatus)
      }
    else {
      this.setState({checkValidation:true})
    }
  }

  startHand2 = () => {


    var userData =this.props.userStore.user

    if(this.props.userStore.profileIsValid){
      if(userData.handUsed){
        if(this.props.userStore.userCredit<50){
                  this.pay(3)
        }
        else{
          Backend.addCredits(-50)
          this.props.userStore.increment(-50)
          this.navigateto('Chat',0,3);
        }
      }
      else{
        this.navigateto('Chat',0,3);
      }

        Backend.setProfile(this.props.userStore.userName,this.props.userStore.age,this.props.userStore.iliskiStatus,this.props.userStore.meslekStatus)
      }
    else {
      this.setState({checkValidation:true})
    }

  }

  continueFal = () => {
    if(this.props.userStore.userCredit<100){
      this.payDevam()
    }
    else{
      this.popupSoru.dismiss();
      Backend.sendQuickPayload('continuefal')
      Backend.addCredits(-100)
      this.props.userStore.increment(-100)
    }
  }

  sendPayload(payload,image){

    if (payload.payload=='secdim') {

      this.setState({falPhotos:[image]})
      //this.props.socialStore.addPhoto(image)
      //this.props.socialStore.addPhoto(image)
      var randomNum =  Math.floor(Math.random()*(15-0+1)+0);
      var randomNum = randomNum*3;
      var photos=[]
      photos.push(image)
      photos.push('https://firebasestorage.googleapis.com/v0/b/kahve-fali-7323a.appspot.com/o/images%2Ffincanfotoyok%2F'+(randomNum+1)+'.jpg?alt=media')
      photos.push('https://firebasestorage.googleapis.com/v0/b/kahve-fali-7323a.appspot.com/o/images%2Ffincanfotoyok%2F'+(randomNum+2)+'.jpg?alt=media')

      AsyncStorage.setItem('falPhotos',JSON.stringify(photos));
    }

    if(payload=="appstart"){
      var epstart = this.state.falType+"appstart"+this.state.falciNo
      var bilgiref2= firebase.database().ref('messages/'+Backend.getUid()+'/lastMessage/'+this.state.falciNo);
      bilgiref2.set({createdAt:firebase.database.ServerValue.TIMESTAMP,text:"Yeni Mesaj"})
      Backend.sendPayload(epstart);
    }
    else if (payload.payload=='gunluk') {
      this.popupGunluk.show()
    }
    else if (payload.payload=='love') {
      this.popupAsk.show()
    }
    else if (payload.payload=='detay') {
      this.popupDetay.show()
    }
    else if (payload.payload=='hand') {
      this.popupHand.show()
    }
    else if (payload.payload=='sosyalfal') {
      firebase.analytics().logEvent("gunluktenSosyale")
      AsyncStorage.getItem('falPhotos').then((value) => {
        if(value){
          value=JSON.parse(value)
          this.props.navigation.navigate('FalPaylas',{type:1,photos:value})
        }
        else {
            this.props.navigation.navigate('FalPaylas',{type:1})
        }
      })
    }
    else{
      if(payload.type=="postback"){
        if(payload.payload=="sharepage"){
          this.setState({inputVisible:true})
          this.shareLinkWithShareDialog()
        }
        else if (payload.payload.includes("odeme")) {
          var credit= payload.payload.slice(5);
          this.pay(parseInt(credit))
          this.setState({inputVisible:true})
        }
        else if (payload.payload=="ben") {
          this.child.onActionsPress()
        }
        else{
            Backend.sendPayload(payload.payload);
        }

        if(payload.payload=="nohizlibak"||payload.payload=="hizlibak"||payload.payload=="vazgecti"){this.setState({inputVisible:true})}

      }
      else{
        this.shareLinkWithShareDialog()
      }
      Backend.addMessage(payload.title)
      this.setState((previousState) => {
        return {
          buttons:null
        };
      });
    }
  }

  shareLinkWithShareDialog() {
    var tmp = this;
    ShareDialog.canShow(this.state.shareLinkContent).then(
      function(canShow) {
        if (canShow) {
          Keyboard.dismiss()
          return ShareDialog.show(tmp.state.shareLinkContent);
        }
      }
    ).then(
      function(result) {
        if (result.isCancelled) {
          Backend.sendPayload("nohizlibak")
        } else {
          ////console.log('Share success with postId: ' + result.postId)
          ////console.log('paylaştı')
          Backend.sendPayload("appshared")
        }
      },
      function(error) {
      }
    );
  }

  sendQuickPayload(payload){
      if(payload.payload=="odeme"){

      }else{
        Backend.sendQuickPayload(payload.payload);
      }
      if(payload.payload=='continue'){
        this.setState({inputVisible:true})
      }
      Backend.addMessage(payload.title)
      this.setState((previousState) => {
        return {
          quick_reply:null
        };
      });
  }

  componentWillMount() {
    this._isMounted = true;
    Backend.refreshLastLoaded();
    this.setState(() => {
      return {
        messages: [],
      };
    });

    this.keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', this._keyboardDidShow);
    this.keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', this._keyboardDidHide);
  }

  componentWillUnmount() {
    this._isMounted = false;

    this.keyboardDidShowListener.remove();
    this.keyboardDidHideListener.remove();

  }

  _keyboardDidShow = (event) => {
    var height= event.endCoordinates.height
    this.setState({keyboardHeight: height,keyboardVisible:true});

  }

  _keyboardDidHide = () =>  {
   // alert('Keyboard Hidden');
   this.setState({keyboardVisible:false})
  }

  componentDidMount() {
    this.intersti.loadAd(this.request.build());
    this.intersti.on('onAdLoaded', () => {
      //this.intersti.show()
    });
    this.props.navigation.setParams({ showpopup: this.showpopup,setnavigation: this.setnavigation  })
      Backend.loadMessages((message) => {
        if(message!=={}){
          if(this._isMounted){
          if(message.type=="typing"){
            this.setState({typingText:"Yazıyor..."})
          }
          else{
            this.setState({typingText:null})
            if(message.type=="generic"){

                this.setState({modalElements:message.elements,modalVisible:true})
                  Keyboard.dismiss()
            }
            else if (message.type=="quick") {
              this.fadeButtons()
              this.setState((previousState) => {
                return {
                  messages: GiftedChat.append(previousState.messages, message),quick_reply:message.quick_reply
                };
              });
              if(message.quick_reply[0].payload=="ratefortune"){
                this.setState({inputVisible:false})
              }
            }
            else if (message.type=="button") {
              this.fadeButtons()
              if(message.buttons[0].payload=="hizlibak"||message.buttons[0].payload.includes("odeme")||message.buttons[0].payload=="ratefortune"){
                this.setState({inputVisible:false})
              }
              this.setState((previousState) => {
                return {
                  messages: GiftedChat.append(previousState.messages, message),
                  buttons:message.buttons,
                };
              });
            }
            else if (message.type=="image"||message.type=="text") {
              if(this.state.buttons!==null||this.state.quick_reply!==null){
                this.setState({quick_reply:null,quick_reply:null})
              }
              this.setState((previousState) => {
                return {
                  messages: GiftedChat.append(previousState.messages, message),
                };
              });
            }
            else if (message.type=="action") {

              if(message.action=="rate"){
                this.showpopup()
              }

            }
              whoosh.play();
          }

        }
        }

      });



      Backend.loadInitialMessages((messages) => {
        if(!this.props.navigation.state.params.newFortune){
          if(this._isMounted){
                this.setState((previousState) => {
                  return{
                    initialLoaded:true,
                    messages: GiftedChat.append(previousState.messages, messages),
                  }
                });
                if(messages.length>0){
                  var lastMessage=messages[0]

                  if(lastMessage.type=="quick"){
                    this.fadeButtons()
                    this.setState({quick_reply:lastMessage.quick_reply})
                    if(lastMessage.quick_reply[0].payload=="ratefortune"){
                      this.setState({inputVisible:false})
                    }
                  }
                  else if (lastMessage.type=="button") {
                    if(lastMessage.buttons[0].payload=="hizlibak"||lastMessage.buttons[0].payload.includes("odeme")||lastMessage.buttons[0].payload=="ratefortune"){
                      this.setState({inputVisible:false})
                    }
                    this.fadeButtons()
                      this.setState({quick_reply:lastMessage.buttons})
                  }
                  else if (lastMessage.type=="generic") {
                      this.setState({modalElements:lastMessage.elements,modalVisible:true})
                  }

            }
          }
          AsyncStorage.getItem('falPhotos').then((value) => {if(value){this.setState({falPhotos:JSON.parse(value)})}})
        }
        else{
          this.removeLoading()
          AsyncStorage.removeItem('falPhotos')
        }
      });

      //
      this.props.userStore.setAktifUnread(0)

  }

  changeValidation = () => {
    this.setState({checkValidation:false})
  }

  backhandler = () => {
    const resetAction = NavigationActions.reset({
       index: 0,
       actions: [
         NavigationActions.navigate({ routeName: 'Greeting'})
       ]
     })
     this.props.navigation.dispatch(resetAction)
       BackAndroid.removeEventListener('hardwareBackPress', this.backhandler);
     return true
  }

  removeLoading(){

      var randomTime =Math.floor(Math.random()*(18000-12000+1)+12000);
      setTimeout(() => {
        if(this._isMounted){
          this.setState({
            loadingVisible:false,
          });

          setTimeout(() => {
            var loaded = this.intersti.isLoaded()
            if(loaded){

                this.intersti.show()
            }
          },400);


          this.sendPayload("appstart")

          let toast = Toast.show(falcilar[this.state.falciNo].name+' sohbete bağlandı!', {
            duration: Toast.durations.SHORT,
            position: 70,
            shadow: true,
            animation: true,
            hideOnPress: true,
          });
          let toast2 = Toast.show('Aşağıya mesajınızı yazarak sohbet edebilirsiniz', {
            duration: Toast.durations.LONG,
            delay: 3000,
            position: 0,
            shadow: true,
            animation: true,
            hideOnPress: true,
          });
        }
      }, randomTime)

  }
  onLoadEarlier() {
    this.setState((previousState) => {
      return {
        isLoadingEarlier: true,
      };
    });

    setTimeout(() => {
      if (this._isMounted === true) {
        this.setState((previousState) => {
          return {
            messages: GiftedChat.prepend(previousState.messages, []),
            loadEarlier: false,
            isLoadingEarlier: false,
          };
        });
      }
    }, 1000); // simulating network
  }

  onSend(messages = []) {
    this.setState((previousState) => {
      return {
        messages: GiftedChat.append(previousState.messages, messages),
      };
    });

    // for demo purpose
    //this.answerDemo(messages);
  }

  answerDemo(messages) {
    if (messages.length > 0) {
      if ((messages[0].image || messages[0].location) || !this._isAlright) {
        this.setState((previousState) => {
          return {
            typingText: 'React Native is typing'
          };
        });
      }
    }

    setTimeout(() => {
      if (this._isMounted === true) {
        if (messages.length > 0) {
          if (messages[0].image) {
            this.onReceive('Nice picture!');
          } else if (messages[0].location) {
            this.onReceive('My favorite place');
          } else {
            if (!this._isAlright) {
              this._isAlright = true;
              this.onReceive('Alright');
            }
          }
        }
      }

      this.setState((previousState) => {
        return {
          typingText: null,
        };
      });
    }, 1000);
  }

  onReceive(text) {
    this.setState((previousState) => {
      return {
        messages: GiftedChat.append(previousState.messages, {
          _id: Math.round(Math.random() * 1000000),
          text: text,
          createdAt: new Date(),
          user: {
            _id: 2,
            name: 'React Native',
            avatar: 'https://facebook.github.io/react/img/logo_og.png',
          },
        }),
      };
    });
  }

  sendMessageToBack = (message) => {
    this.setState({buttons:null,quick_reply:null})
    Backend.sendMessage(message);
    if(message[0].image){
      var imajlar= this.state.falPhotos;
      for (let i = 0; i < message.length ; i++) {
        imajlar.push(message[i].image)
        this.props.socialStore.addPhoto(message[i].image)
      }
      if(imajlar.length>3){
        imajlar=imajlar.slice(3)
      }
    //  this.props.socialStore.setPhotos({falPhotos:imajlar})
      AsyncStorage.setItem('falPhotos',JSON.stringify(imajlar));
    }
    whoosh.play();
  }
  renderCustomActions(props) {

      return (
        <CustomActions
          {...props}
          ref={instance => { this.child = instance; }}
        />
      );

      /*
    const options = {
      'Action 1': (props) => {
        alert('option 1');
      },
      'Action 2': (props) => {
        alert('option 2');
      },
      'Cancel': () => {},
    };
    return (
      <Actions
        {...props}
        options={options}
      />
    );*/
  }

  renderBubble(props) {
    return (
      <Bubble
        {...props}
        wrapperStyle={{
          left: {
            backgroundColor: '#f0f0f0',
          }
        }}
      />
    );
  }

  renderSend(props) {
    return (
      <Send
        {...props}
        label={'Gönder'}
      />
    );
  }
  renderComposer(props) {
    if(this.state.inputVisible){
      return (
        <Composer
          {...props}
          placeholder={'Mesajınızı yazın...'}
        />
      );
    }
    else{
      return null
    }

  }
  renderInputToolbar(props) {
    if(this.state.inputVisible){
      return (
        <InputToolbar
          {...props}
        />
      );
    }
    else{
      return null
    }

  }

  renderFooter(props) {
    if(this.state.modalVisible){
      return(
        <View style={{height:250}}></View>
      )
    }
    if (this.state.typingText) {
      return (
        <View style={styles.footerContainer}>
          <Text style={styles.footerText1}>
            {this.state.typingText}
          </Text>
        </View>
      );
    }
    if(this.state.quick_reply){
      let bubblewidth = (Dimensions.get('window').width-25)/3
      if(this.state.quick_reply.length>2){bubblewidth = (Dimensions.get('window').width-25)/4}

      return (
        <View style={styles.quickContainer}>

          {this.state.quick_reply.map(function(reply, index) {
            return (
              <Animated.View key={index} style={{opacity:this.state.buttonOpacity}}>
              <TouchableHighlight
                onPress={() => {this.sendQuickPayload(reply)}}
              style={[styles.quickBubble,{maxWidth:bubblewidth}]}>
                  <Text style={styles.footerText}>{reply.title}</Text>
                </TouchableHighlight>
                </Animated.View>
            );
          }.bind(this))}

        </View>
      );


    }
    if(this.state.buttons){
      let bubblewidth = (Dimensions.get('window').width-25)/3
      if(this.state.buttons.length>2){bubblewidth = (Dimensions.get('window').width-25)/4}
      this.fadeButtons()
        return (
          <View style={styles.quickContainer}>

            {this.state.buttons.map(function(reply, index) {
                return (
                <Animated.View  key={index} style={{opacity:this.state.buttonOpacity}}>
                <TouchableHighlight
                  onPress={() => {this.sendPayload(reply)}}
                   style={[styles.quickBubble,{maxWidth:bubblewidth}]}>
                    <Text style={styles.footerText}>{reply.title}</Text>
                  </TouchableHighlight>
                  </Animated.View>
                );
            }.bind(this))}

          </View>
        );

    }

    return null;
  }

  render() {
    return (

        <ImageBackground source={require('../static/images/newImages/BG.png')}  style={styles.containerimage}>

          <Spinner visible={this.state.spinnerVisible} textStyle={{color: '#DDD'}} />
            <Banner
               unitId={'ca-app-pub-6158146193525843/6972275728'}
               request={request.build()}
               onAdFailedtoLoad={() => {

               }}
               onAdLoaded={() => {

                 }}
             />
          <GiftedChat
            messages={this.state.messages}

            onSend={(message) => {
              this.sendMessageToBack(message)
            }}
            loadEarlier={false}
            user={{
              _id: Backend.getUid(),
              name: Backend.getName(),
              avatar:Backend.getAvatar(),
            }}
            renderActions={this.renderCustomActions}
            renderBubble={this.renderBubble}

            renderFooter={this.renderFooter}
            renderSend={this.renderSend}
            renderComposer={this.renderComposer}
            renderInputToolbar={this.renderInputToolbar}
            renderMessage={props => <CustomMessage {...props} />}
            >

            </GiftedChat>

            <Modal
              animationType={"none"}
              transparent={false}
              visible={this.state.loadingVisible}
              onRequestClose={() => {}}
              >
              <ImageBackground source={require('../static/images/newImages/BG.png')} style={{ flex:1, width: null, height: null,justifyContent:'center' }}>
                 <View style={{ height: 100,backgroundColor:'white',justifyContent:'center' }}>
                  <Text style={{textAlign:'center'}}>
                    Uygun falcı aranıyor...
                    </Text>
                   <ActivityIndicator
                     animating={true}
                     style={[styles.centering, {height: 80}]}
                     size="large"
                   />
                 </View>
               </ImageBackground>
            </Modal>

            <Elements
              transparent={true}
              modalVisible={this.state.modalVisible}
              keyboardHeight={this.state.keyboardHeight}
              setModalVisibility={(visible) =>{
                        this.setModalVisibility(visible)
              }}
              elements={this.state.modalElements}
              sendPayload={(payload,image) => {
                if(payload.payload=='gunluk'||payload.payload=='love'||payload.payload=='detay'||payload.payload=='hand'||payload.payload=='sosyalfal'){
                  this.sendPayload(payload)
                }
                else{
                  this.sendPayload(payload,image)
                  this.setModalVisibility(false)
                }


              }}
            />
            <PopupDialog
             dialogTitle={<DialogTitle titleTextStyle={{fontWeight:'bold'}} title="Puan Ver" />}
             width={0.9}
             height={320}
             dialogStyle={{marginTop:-250}}
             ref={(popupDialog) => { this.popupDialog = popupDialog; }}>
            <View style={{margin:10,marginLeft:20,marginRight:20,flex:1}}>
             <StarRating
              disabled={false}
              maxStars={5}
              rating={this.state.starCount}
              selectedStar={(rating) => this.onStarRatingPress(rating)}
              starColor={'gold'}
              />

              <View style={{height:80,marginTop:10}}>
                <Text style={{fontStyle:'italic',color:'gray'}}>(Zorunlu Değil)</Text>
                <TextInput

                  multiline = {true}
                  underlineColorAndroid='rgba(0,0,0,0)'
                  style={{flex:1,padding:5,fontSize: 16,backgroundColor:'#ffffff', borderColor: 'gray', borderWidth: 1}}
                  onChangeText={(text) => this.setState({sikayet:text})}

                  placeholder={'Buraya falcımız ile ilgili yorumlarınızı yazabilirsiniz. Teşekkür ederiz!'}
                  editable = {true}
                />
              </View>
              <View style={{flexDirection:'row',justifyContent:'space-around',marginTop:10}}>
                <Text> Falcı değerlendirmemi görebilsin </Text>
                <Switch
                  onValueChange={(value) => this.setState({falseSwitchIsOn: value})}
                  value={this.state.falseSwitchIsOn} />
              </View>
              <View style={{marginTop:10}}>
                <Button title={"Gönder"}  onPress={() => {this.sendReview()}}/>
              </View>
            </View>
           </PopupDialog>
            <PopupDialog
              dialogTitle={<DialogTitle titleTextStyle={{fontWeight:'bold'}} title="Bahşiş" />}
              width={0.9}
              height={320}
              dialogStyle={{marginTop:-200}}
              ref={(popupDialog) => { this.popupDialog2 = popupDialog; }}>
             <View style={{margin:20,flex:1}}>
                <Image style={{alignSelf:'center',height:50,width:50, borderRadius:25,marginBottom:10}} source={{uri:falcilar[this.state.falciNo].url}}></Image>
                <Text style={{fontSize:16,color:'black'}}>{"Falını beğendiysen "+falcilar[this.state.falciNo].name+" falcımıza ufak bir bahşiş vermeye ne dersin?"}</Text>
                <View style={{flexDirection:'row',height:50,marginTop:15}}>

                  <TouchableHighlight style={{flexGrow:2,backgroundColor:'rgba(60,179,113, 0.8)',justifyContent:'center'}} onPress={() => {this.payBahsis(1)}}>
                    <Text style={{textAlign:'center',color:'white',fontWeight:'bold',fontSize:18}}>1.29 TL</Text>
                  </TouchableHighlight>
                  <TouchableHighlight style={{flexGrow:2,marginRight:10,marginLeft:10,backgroundColor:'rgba(114,0,218, 0.8)',justifyContent:'center'}} onPress={() => {this.payBahsis(2)}}>
                    <Text style={{textAlign:'center',color:'white',fontWeight:'bold',fontSize:18}}>3.49 TL</Text>
                  </TouchableHighlight>
                  <TouchableHighlight style={{flexGrow:2,backgroundColor:'rgba(249,50,12, 0.8)',justifyContent:'center'}} onPress={() => {this.popupDialog2.dismiss(); Alert.alert('Puanlama',"Yorumlarınız bizim için çok değerli. Puanlamanız için teşekkür ederiz.");}}>
                    <Text style={{textAlign:'center',color:'white',fontWeight:'bold',fontSize:18}}>İstemiyorum</Text>
                  </TouchableHighlight>
                </View>

             </View>
            </PopupDialog>
            <PopupDialog

              ref={(popupDialog2) => { this.popupGunluk = popupDialog2; }}
              dialogStyle={{marginTop:-150}}
              overlayOpacity={0.75}
              width={0.8}
              height={0.65}
            >
              <ImageBackground style={{flex:1,width: null,height: null}} source={require('../static/images/gunluk.jpg')}>
                <View style={{flex:1,alignSelf: 'stretch',backgroundColor:'rgba(60,179,113, 0.8)'}}>
                {this.props.userStore.user.appGunlukUsed ?
                    (<View style={{padding:5,flexDirection:'row',position:'absolute',top:0,right:0}}>
                    <Text style={[styles.label]}>
                      100
                    </Text>
                    <Image source={require('../static/images/coins.png')} style={styles.coin}/>
                  </View>) :
                    (<View style={{padding:5,flexDirection:'row',position:'absolute',top:5,right:5}}>
                    <Animatable.Text style={[styles.label2,{color:'#F8D38C'}]} animation="pulse" iterationCount={"infinite"} direction="alternate">ÜCRETSİZ</Animatable.Text>


                  </View>)
                  }
                  <Text style={styles.faltypeyazipopup}>
                    Günlük Fal
                  </Text>
                  <Text style={{position:'absolute',color:'transparent',backgroundColor:'transparent',fontSize:0}}>{this.props.userStore.userCredit}</Text>
                  <Text style={styles.faltypeyazikucukpopup}>
                    Falcılarımız ile canlı sohbet edin! Kahve fotoğraflarınızı gönderin, yorumlasınlar

                  </Text>

                  <View style={{position:'absolute',bottom:0,width:'100%'}}>
                    <ProfilePicker checkValidation={this.state.checkValidation} changeValidation={this.changeValidation}/>

                    <View style={{alignSelf:'stretch',flex:1,flexDirection:'row',justifyContent:'space-around',backgroundColor:'white'}}>
                      <TouchableOpacity  onPress={() => {this.popupGunluk.dismiss()}} style={{flex:1,height:40,flexGrow:1,borderRightWidth:1,justifyContent:'center'}}>
                        <Text style={{textAlign:'center'}}>Vazgeç</Text>
                      </TouchableOpacity>
                      <TouchableOpacity  onPress={() => {this.startGunluk2()}} style={{flex:1,height:40,flexGrow:1,borderLeftWidth:1,justifyContent:'center'}}>
                        <Text style={{textAlign:'center',alignItems:'center',fontWeight:'bold'}}>BAŞLA</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              </ImageBackground>
            </PopupDialog>
            <PopupDialog

              ref={(popupDialog2) => { this.popupAsk = popupDialog2; }}
              dialogStyle={{marginTop:-150}}
              overlayOpacity={0.75}
              width={0.8}
              height={0.7}
            >
              <ImageBackground style={{flex:1,width: null,height: null}} source={require('../static/images/ask.jpg')}>
                <View style={{flex:1,alignSelf: 'stretch',backgroundColor:'rgba(249,50,12,0.6)'}}>
                  <View style={{padding:5,flexDirection:'row',position:'absolute',top:0,right:0}}>
                    <Text style={[styles.label]}>
                      100
                    </Text>
                    <Image source={require('../static/images/coins.png')} style={styles.coin}/>
                  </View>
                  <Text style={styles.faltypeyazipopup}>
                    Sırlar dökülsün, aşk konuşalım
                  </Text>
                  <Text style={{position:'absolute',color:'transparent',backgroundColor:'transparent',fontSize:0}}>{this.props.userStore.userCredit}</Text>
                  <Text style={styles.faltypeyazikucukpopup}>
                    {'\u2022'} Falınızı sosyal panoda ücretsiz paylaşma imkanı{'\n'}
                    {'\u2022'} Detaylı aşk yorumları{'\n'}
                    {'\u2022'} İlişki tavsiyeleri{'\n'}

                  </Text>

                  <View style={{position:'absolute',bottom:0,width:'100%'}}>
                    <ProfilePicker checkValidation={this.state.checkValidation} changeValidation={this.changeValidation}/>

                    <View style={{alignSelf:'stretch',flex:1,flexDirection:'row',justifyContent:'space-around',backgroundColor:'white'}}>
                      <TouchableOpacity  onPress={() => {this.popupAsk.dismiss()}} style={{flex:1,height:40,flexGrow:1,borderRightWidth:1,justifyContent:'center'}}>
                        <Text style={{textAlign:'center'}}>Vazgeç</Text>
                      </TouchableOpacity>
                      <TouchableOpacity  onPress={() => {this.startAsk2()}} style={{flex:1,height:40,flexGrow:1,borderLeftWidth:1,justifyContent:'center'}}>
                        <Text style={{textAlign:'center',alignItems:'center',fontWeight:'bold'}}>BAŞLA</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              </ImageBackground>
            </PopupDialog>
            <PopupDialog
              ref={(popupDialog) => { this.popupDetay = popupDialog; }}
              dialogStyle={{marginTop:-150}}
              width={0.8}
              height={0.7}
              overlayOpacity={0.75}
            >
              <ImageBackground style={{flex:1,width: null,height: null}} source={require('../static/images/detayli.jpg')}>
                <View style={{flex:1,paddingTop:10,alignSelf: 'stretch',backgroundColor:'rgba(114,0,218,0.6)'}}>
                  <View style={{padding:5,flexDirection:'row',position:'absolute',top:0,right:0}}>
                    <Text style={[styles.label]}>
                      150
                    </Text>
                    <Image source={require('../static/images/coins.png')} style={styles.coin}/>
                  </View>
                  <Text style={styles.faltypeyazipopup}>
                    Ortaya çıkmayan detay kalmasın
                  </Text>
                  <Text style={styles.faltypeyazikucukpopup}>
                    {'\u2022'} Falınızı sosyal panoda ücretsiz paylaşma imkanı{'\n'}
                    {'\u2022'} Her konuya dair detaylı yorumlar{'\n'}
                    {'\u2022'} Ruh haliniz incelensin{'\n'}

                  </Text>
                  <View style={{position:'absolute',bottom:0,width:'100%'}}>
                  <ProfilePicker checkValidation={this.state.checkValidation} changeValidation={this.changeValidation}/>

                    <View style={{alignSelf:'stretch',flex:1,flexDirection:'row',justifyContent:'space-around',backgroundColor:'white'}}>
                      <TouchableOpacity  onPress={() => {this.popupDetay.dismiss()}} style={{flex:1,height:40,flexGrow:1,borderRightWidth:1,justifyContent:'center'}}>
                        <Text style={{textAlign:'center'}}>Vazgeç</Text>
                      </TouchableOpacity>
                      <TouchableOpacity  onPress={() => {this.startDetay2()}} style={{flex:1,height:40,flexGrow:1,borderLeftWidth:1,justifyContent:'center'}}>
                        <Text style={{textAlign:'center',fontWeight:'bold'}}>BAŞLA</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              </ImageBackground>
            </PopupDialog>
            <PopupDialog

              ref={(popupDialog) => { this.popupHand = popupDialog; }}
              dialogStyle={{marginTop:-150}}
              width={0.8}
              height={0.7}
              overlayOpacity={0.75}
            >
              <ImageBackground style={{flex:1,width: null,height: null}} source={require('../static/images/elfali.jpg')}>
                <View style={{flex:1,alignSelf: 'stretch',backgroundColor:'rgba(0,185,241, 0.6)'}}>
                  {this.props.userStore.user.handUsed ?
                      <View style={{padding:5,flexDirection:'row',position:'absolute',top:0,right:0}}>
                      <Text style={[styles.label]}>
                        50
                      </Text>
                      <Image source={require('../static/images/coins.png')} style={styles.coin}/>
                    </View> :  null}
                  <Text style={styles.faltypeyazipopup}>
                    Eliniz, kaderiniz
                  </Text>
                  <Text style={styles.faltypeyazikucukpopup}>
                    Elinizin fotoğrafını gönderin, falcılarımız ile sohbet ederek el falınıza baktırın!
                  </Text>
                  <View style={{position:'absolute',bottom:0,width:'100%'}}>
                  <ProfilePicker checkValidation={this.state.checkValidation} changeValidation={this.changeValidation}/>

                    <View style={{alignSelf:'stretch',flex:1,flexDirection:'row',justifyContent:'space-around',backgroundColor:'white'}}>
                      <TouchableOpacity  onPress={() => {this.popupHand.dismiss()}} style={{flex:1,height:40,flexGrow:1,borderRightWidth:1,justifyContent:'center'}}>
                        <Text style={{textAlign:'center'}}>Hayır</Text>
                      </TouchableOpacity>
                      <TouchableOpacity  onPress={() => {this.startHand2()}} style={{flex:1,height:40,flexGrow:1,borderLeftWidth:1,justifyContent:'center'}}>
                        <Text style={{textAlign:'center',fontWeight:'bold'}}>BAŞLA</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              </ImageBackground>
            </PopupDialog>
            <PopupDialog

              ref={(popupDialog) => { this.popupSoru = popupDialog; }}
              dialogStyle={{marginTop:-150}}
              width={0.8}
              height={0.5}
              overlayOpacity={0.75}
            >
              <ImageBackground style={{flex:1,width: null,height: null,alignItems:'center',}} source={require('../static/images/greenback.jpg')}>

                  <View style={{padding:5,flexDirection:'row',position:'absolute',top:0,right:0}}>
                    <Text style={[styles.label]}>
                      100
                    </Text>
                    <Image source={require('../static/images/coins.png')} style={styles.coin}/>
                  </View>
                  <Image style={{height:56,width:56, borderRadius:28,marginTop:25,marginBottom:10}} source={require('../static/images/anneLogo3.png')}></Image>
                  <Text style={styles.faltypeyazipopup}>
                    Sorunuz mu var? {"\n"} Daha çok detay mı istiyorsunuz?
                  </Text>
                  <Text style={styles.faltypeyazikucukpopup}>
                    Falcılarımın göremediği detayları ve cevaplayamadığı soruları bizzat ben sohbete bağlanıp cevaplayacağım.{"\n"}
                  </Text>
                  <View style={{position:'absolute',bottom:0,width:'100%'}}>

                    <View style={{alignSelf:'stretch',flex:1,flexDirection:'row',justifyContent:'space-around',backgroundColor:'white'}}>
                      <TouchableOpacity  onPress={() => {this.popupSoru.dismiss();Backend.sendPayload('finishfortune');}} style={{flex:1,height:40,flexGrow:1,borderRightWidth:1,justifyContent:'center'}}>
                        <Text style={{textAlign:'center'}}>İstemiyorum</Text>
                      </TouchableOpacity>
                      <TouchableOpacity  onPress={() => {this.continueFal();}} style={{flex:1,height:40,flexGrow:1,borderLeftWidth:1,justifyContent:'center'}}>
                        <Text style={{textAlign:'center',fontWeight:'bold'}}>DEVAM ET</Text>
                      </TouchableOpacity>
                    </View>
                  </View>

              </ImageBackground>
            </PopupDialog>
            <PopupDialog

              ref={(popupDialog) => { this.popupSosyal = popupDialog; }}
              dialogStyle={this.state.keyboardVisible?styles.marginKeyboardVisible:styles.marginKeyboardNotVisible}
              width={0.8}
              height={450}
              overlayOpacity={0.75}
            >
              <View style={{flex:1,backgroundColor:'#36797f',alignItems:'center',paddingBottom:40}} >

                  <View style={{padding:5,flexDirection:'row',position:'absolute',top:0,right:0}}>
                  {this.state.falType==2||this.state.falType==1?  (
                      <View style={{padding:5,flexDirection:'row',position:'absolute',top:5,right:5}}>
                      <Animatable.Text style={[styles.label,{color:'#F8D38C'}]} animation="pulse" iterationCount={"infinite"} direction="alternate">ÜCRETSİZ</Animatable.Text>
                    </View>
                    ): (
                        <View style={{padding:5,flexDirection:'row',position:'absolute',top:0,right:0}}>
                        <Text style={[styles.label]}>
                          50
                        </Text>
                        <Image source={require('../static/images/coins.png')} style={styles.coin}/>
                      </View>)}
                  </View>
                  <Image source={require('../static/images/karilar.png')} style={{height:60,resizeMode:'contain',marginTop:10}}/>
                  <Text style={styles.faltypeyazipopup}>
                    Siz sorun, diğer falseverlerimiz cevaplasın!
                  </Text>
                  <Text style={styles.faltypeyazikucukpopup}>
                    Birlikten kuvvet doğar! Falınızı, aklınızdaki soru ile birlikte 2 gün boyunca Sosyal Panomuzda yayınlayıp, diğer falseverlerin yorumuna sunalım.   {"\n"}
                  </Text>
                  <TextInput
                    editable={true}
                    multiline={true}
                    value={this.state.sosyalInput}
                    onChangeText={(text) => this.setState({sosyalInput:text})}
                    placeholder={"Sorunu yaz"}
                    style={{height:60,width:'90%',borderColor: 'gray', borderWidth: 1,padding:3,backgroundColor:'white'}}
                  />

                  <View style={{width:'100%',marginTop:10,flexDirection:'row',borderColor:'gray',borderBottomWidth:0,height:120,paddingBottom:40}}>
                  {
                    this.state.falPhotos.map(function (foto,index) {

                      return (
                        <View style={{flex:1,height:50,margin:10}} key={index}>

                         <Image source={{uri:foto}} style={{ height: 50,borderRadius:5,width:50,alignSelf:'center'}}></Image>


                         </View>
                        );
                    }, this)}
                  </View>
                  <View style={{position:'absolute',bottom:0,width:'100%'}}>

                   <View style={{alignSelf:'stretch',flex:1,flexDirection:'row',justifyContent:'space-around',backgroundColor:'white'}}>
                     <TouchableOpacity  onPress={() => {this.popupSosyal.dismiss();Backend.sendPayload('finishfortune');}} style={{flex:1,height:40,flexGrow:1,borderRightWidth:1,justifyContent:'center'}}>
                       <Text style={{textAlign:'center'}}>İstemiyorum</Text>
                     </TouchableOpacity>
                     <TouchableOpacity  onPress={() => {this.sendSosyal();}} style={{flex:1,height:40,flexGrow:1,borderLeftWidth:1,justifyContent:'center'}}>
                       <Text style={{textAlign:'center',fontWeight:'bold'}}>GÖNDER</Text>
                     </TouchableOpacity>
                   </View>
                 </View>



              </View>
            </PopupDialog>
          </ImageBackground>

    );
  }
}

const styles = StyleSheet.create({
  containerimage: {
    flex: 1,
    width:null,
    alignSelf:'stretch'
  },
  coin:{
    height:15,
    width:15,
    marginLeft:5,
  },
  coin2:{
    height:13,
    width:13,

  },
  label: {
    fontSize: 12,
    color:'white',
    textAlign:'center',
    fontWeight:'bold',
    backgroundColor:'transparent'
  },
  label: {
    fontSize: 10,
    color:'white',
    textAlign:'center',
    fontWeight:'bold',
    backgroundColor:'transparent'
  },
  quickContainer: {
    marginTop: 5,
    marginLeft: 10,
    marginRight: 10,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent:'space-around',
  },
  faltypeyazi:{
    textAlign: 'center',color:'white',fontWeight:'bold',fontSize:22
  },
  faltypeyazipopup:{
    textAlign: 'center',color:'white',fontWeight:'bold',fontSize:18,marginTop:15,marginBottom:5,backgroundColor:'transparent'
  },
  faltypeyazikucuk:{
    textAlign: 'center',color:'white',fontSize:14
  },
  faltypeyazikucukpopup:{
    color:'white',fontSize:14,margin:10,backgroundColor:'transparent',textAlign: 'justify'
  },
  faltypeyazikucukpopup2:{
    flex:1,color:'white',fontSize:14,padding:15,fontWeight:'bold',alignSelf:'stretch',textAlign:'center'
  },
  quickBubble:{
    borderRadius:10,
    borderWidth:2,
    borderColor:'#1194F7',
    padding:8,
    backgroundColor:'#1194F7',

  },
  quickText:{
    fontSize: 14,
    color: '#aaa',
  },
  footerText: {
    fontSize: 14,
    color: 'white',
    textAlign:'center',
    fontWeight:'bold',
    backgroundColor:'transparent'
  },
  footerText1: {
    fontSize: 14,
    color: 'white',
    textAlign:'center',
    fontWeight:'bold',
    backgroundColor:'transparent'
  },
  container: {
    flex: 1,
    padding: 0,
    flexDirection: 'column-reverse'
  },
  innerContainer: {
    height: 300,
    alignSelf:'stretch',
    alignItems: 'center',
  },
  row: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row',
    marginBottom: 20,
  },
  rowTitle: {
    flex: 1,
    fontWeight: 'bold',
  },
  button: {
    borderRadius: 5,
    flexGrow: 1,
    height: 44,
    alignSelf: 'stretch',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  buttonText: {
    fontSize: 18,
    margin: 5,
    textAlign: 'center',
  },
  modalButton: {
    marginTop: 10,
  },
  pickerItem: {
    fontSize: 16,
  },
  marginKeyboardVisible:{
    marginTop:-450
  },
  marginKeyboardNotVisible:{
    marginTop:-100
  },
  centering: {
  alignItems: 'center',
  justifyContent: 'center',
  padding: 8,
},
});
