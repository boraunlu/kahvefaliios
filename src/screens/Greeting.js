import React from 'react';
import {
  StyleSheet,
  Text,
  Button,
  TouchableOpacity,
  TouchableHighlight,
  View,
  Image,
  Modal,
  Dimensions,
  Animated,
  Easing,
  Alert,
  BackAndroid,
  ScrollView,
  ImageBackground,
  AsyncStorage,
  Platform
} from 'react-native';


import PropTypes from 'prop-types';
import firebase from 'react-native-firebase';
import axios from 'axios';
import UserData from '../components/UserData';
import { NavigationActions } from 'react-navigation'
import Icon from 'react-native-vector-icons/FontAwesome';
import Backend from '../Backend';
import { NativeModules } from 'react-native'
import { observable } from 'mobx';
import { observer, inject } from 'mobx-react';
import Spinner from 'react-native-loading-spinner-overlay';
import Picker from 'react-native-picker';
import ProfilePicker from '../components/ProfilePicker';
import PopupDialog, { SlideAnimation, DialogTitle } from 'react-native-popup-dialog';
import * as Animatable from 'react-native-animatable';
import FCM, {FCMEvent, RemoteNotificationResult, WillPresentNotificationResult, NotificationType} from 'react-native-fcm';
//import Marquee from '@remobile/react-native-marquee';

const { InAppUtils } = NativeModules
require('../components/data/falcilar.js');
import moment from 'moment';
var esLocale = require('moment/locale/tr');
moment.locale('tr', esLocale);

function capitalizeFirstLetter(stringy) {
  if(stringy){
    if(stringy.length>0){
      return stringy.charAt(0).toUpperCase() + stringy.slice(1);
    }
    else {
      return ""
    }
  }
  else {
    return ""
  }

}
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

@inject("socialStore")
@inject("userStore")
@observer
export default class Greeting extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      user:null,
      userData:null,
      credit:null,
      animatedButton: new Animated.Value(0),
      animatedBubble: new Animated.Value(0),
      buttonOpacity: new Animated.Value(0),
      greetingMessage:"...",
      spinnerVisible:false,
      checkValidation:false,
      marquee:'',
      reklam:null
  };
  this.navigateto = this.navigateto.bind(this);
  this.greetingMounted = false;
  this.springValue = new Animated.Value(0.1)
}

static navigationOptions = ({ navigation }) => ({
    title: 'Kahve Falı Sohbeti',
    headerStyle: {
      backgroundColor:'white',

    },
    headerTitleStyle: {
      fontWeight: 'bold',
      fontSize:18,
      textAlign: "center",
      color: "#241466",
      textAlign:'center',
      fontFamily:'SourceSansPro-Bold'
    },
    tabBarLabel: 'Ana Sayfa',
     tabBarIcon: ({ tintColor }) => (
       <Icon name="home" color={tintColor} size={25} />
       ),

  })


    pay = (falType) => {
      this.setState({spinnerVisible:true})
      var credit = 0;
      switch (falType) {
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
             if(error){}
             else{
               if(response && response.productIdentifier) {
                  //AlertIOS.alert('Purchase Successful', 'Your Transaction ID is ' + response.transactionIdentifier);
                        this.navigateto('Chat',0,falType);
                        Backend.addCredits(0,"greeting"+credit)
               }
             }
          });
        }
      });

    }

  navigateToAktif = (falciNo) => {
    const { navigate } = this.props.navigation;


      Backend.setFalci(falciNo).then(() => {
        const resetAction = NavigationActions.reset({
          index: 0,
          actions: [
            NavigationActions.navigate({ routeName: 'Chat',params:{newFortune:false,falciNo:falciNo,falType:this.props.userStore.user.fortuneType}})
          ]
        })
        this.props.navigation.dispatch(resetAction)
      })

  }
  navigateto = (destination,falciNo,falType) => {

    const { navigate } = this.props.navigation;
    if(destination=="Chat"){
      /*
          if(this.state.userData.currentFalci==null){
            var randomnumber = Math.floor(Math.random() * falcilar.length);
          }
          else{
            var randomnumber = generateRandom(falcilar.length,this.state.userData.currentFalci)
          }*/
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

  navigateToFal = () => {
    if(this.props.userStore.user.lastFalType==0){
      this.props.navigation.navigate('SocialFal',{fal:this.props.socialStore.tek})
    }
    else {
      if(this.props.socialStore.tek.comments.length>0){
        this.props.navigation.navigate('GunlukFal',{fal:this.props.socialStore.tek})
      }
      else {
        Alert.alert("Falınız kısa süre içinde yorumlanacak :)")
      }

    }
  }

  animateButtons = () => {

    this.state.animatedButton.setValue(0)
    Animated.timing(
      this.state.animatedButton,
      {
        toValue: 1,
        duration: 1000,
        easing: Easing.quad
      }
    ).start()

  }

  changeValidation = () => {
    this.setState({checkValidation:false})
  }

  navigateToFalPaylas = (type) => {
    this.props.navigation.navigate('FalPaylas',{type:type})
  }


  startgunluk1 = () => {

    var userData=this.props.userStore.user
    if(userData.timesUsed>9&&typeof userData.lastSosyal === 'undefined'){
      this.popupParaiste.show()
    }
    else {
      this.popupGunluk.show()
    }
  }

  startGunluk2 = () => {
    if(this.props.userStore.profileIsValid){
      var userData =this.state.userData
      if(!userData.gunlukUsed){
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
          this.navigateto('Chat',0,2);
        }
        Backend.setProfile(this.props.userStore.userName,this.props.userStore.age,this.props.userStore.iliskiStatus,this.props.userStore.meslekStatus)
      }
    else {
      this.setState({checkValidation:true})
    }
  }

  startHand2 = () => {


    var userData =this.state.userData

    if(this.props.userStore.profileIsValid){
      if(userData.handUsed){
        if(this.props.userStore.userCredit<50){
                  this.pay(3)
        }
        else{
          Backend.addCredits(-50)
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


  fadeButtons = () => {
    this.state.buttonOpacity.setValue(0)
    Animated.timing(
      this.state.buttonOpacity,
      {
        toValue: 1,
        duration: 1000,
      }
    ).start()
  }
  animateBubble = () => {

    this.state.animatedBubble.setValue(0)
    Animated.timing(
      this.state.animatedBubble,
      {
        toValue: 1,
        duration: 1000,
        easing: Easing.quad
      }
    ).start()
  }
  spring = () => {
    this.springValue.setValue(0)
    Animated.spring(
      this.springValue,
      {
        toValue: 1,
        friction: 2
      }
    ).start()
  }

  showReklamPopup = () => {
    if(this.state.reklam){
      AsyncStorage.getItem('reklam', (err, result) => {

          if(result){
            result=JSON.parse(result)
            if(result.url!==this.state.reklam.url){

              this.popupReklam.show()
              AsyncStorage.setItem('reklam', JSON.stringify(this.state.reklam), () => {});
            }
          }
          else {
            this.popupReklam.show()
            AsyncStorage.setItem('reklam', JSON.stringify(this.state.reklam), () => {});
          }
      });
    }
  }

 generatefalcisayisi = () => {
   var saat = moment().hour()
   var gun = moment().day()%3
   var falcisayisi= 5
   if(saat>7&&saat<11){
     falcisayisi=4+gun
   }
   if(saat>10&&saat<16){
     falcisayisi=6+gun
   }
   if(saat>15&&saat<22){
     falcisayisi=8+gun
   }
   if(saat>21&&saat<25){
     falcisayisi=5+gun
   }
   if(saat<4){
     falcisayisi=2+gun
   }
   if(saat>3&&saat<8){
     falcisayisi=1+gun
   }
   return falcisayisi
 }

  componentDidUpdate(prevProps,prevState){

    if(prevState.userData==null&&this.state.userData!==null){
      this.fadeButtons();
    }
  }

  componentDidMount() {


    FCM.setBadgeNumber(0);



    axios.post('https://eventfluxbot.herokuapp.com/appapi/getAppUser', {
      uid: Backend.getUid(),
    })
    .then( (response) => {
      var responseJson=response.data
      this.setState({userData:responseJson,credit:responseJson.credit});
       //alert(JSON.stringify(responseJson))
       this.props.userStore.setUser(responseJson)
       this.props.socialStore.setTek(responseJson.tek)

    })
    .catch(function (error) {

    });

     this.notificationListener = FCM.on(FCMEvent.Notification, async (notif) => {


         if(notif.deeplink){
           var deeplink=JSON.parse(notif.deeplink)
           //alert(deeplink.type)
           if(deeplink.type=='gunluk'){
             //alert("asd")
             Backend.getGunluk(notif.deeplink_value).then( (response) => {
                this.props.socialStore.setTek(response)
             })
             //this.props.navigation.navigate('GunlukFal',{falId:notif.deeplink_value})
           }
         }
         // there are two parts of notif. notif.notification contains the notification payload, notif.data contains data payload
         if(notif.local_notification){
           //this is a local notification
           //alert("local")
         }
         if(notif.opened_from_tray){
           //alert("tray")
           if(notif.deeplink){
             var deeplink=JSON.parse(notif.deeplink)
             //alert(deeplink.type)
             if(deeplink.type=='falId'){
               //alert("asd")
               this.props.navigation.navigate('SocialFal',{falId:notif.deeplink_value})
             }
             else if(deeplink.type=='gunluk'){
               //alert("asd")
               this.props.navigation.navigate('GunlukFal',{falId:notif.deeplink_value})
             }
           }
         }

         if(Platform.OS ==='ios'){
           //FCM.setBadgeNumber(1);
           //optional
           //iOS requires developers to call completionHandler to end notification process. If you do not call it your background remote notifications could be throttled, to read more about it see the above documentation link.
           //This library handles it for you automatically with default behavior (for remote notification, finish with NoData; for WillPresent, finish depend on "show_in_foreground"). However if you want to return different result, follow the following code to override
           //notif._notificationType is available for iOS platfrom
           /*
           switch(notif._notificationType){
             case NotificationType.Remote:
               notif.finish(RemoteNotificationResult.NewData) //other types available: RemoteNotificationResult.NewData, RemoteNotificationResult.ResultFailed
               break;
             case NotificationType.NotificationResponse:
               notif.finish();
               break;
             case NotificationType.WillPresent:
               notif.finish(WillPresentNotificationResult.None) //other types available: WillPresentNotificationResult.None
               break;
           }*/
         }
     });




  }

componentWillMount() {
  this.greetingMounted=true;

}
componentWillUnmount() {

}

  renderAktif = () => {

    if(this.state.userData==null){
      return null
    }
    else{
      var userData = this.state.userData
      if(userData.aktif== true){

        return(
          <View>
          <View style={{borderColor:'white',backgroundColor:'teal'}}><Text style={{textAlign:'center',color:'white',fontWeight:'bold'}}>Canlı Sohbetin</Text></View>
          <TouchableOpacity style={{backgroundColor:'white',borderTopWidth:1,borderBottomWidth:1,borderColor:'#c0c0c0',marginBottom:0}} onPress={() => {this.navigateToAktif(userData.currentFalci)}}>
           <View style={{flexDirection:'row',justifyContent:'space-between',height:60,}}>
              <View>
              <Image source={{uri:falcilar[userData.currentFalci].url}} style={styles.falciAvatar}></Image>
              <View style={{height:12,width:12,borderRadius:6,backgroundColor:'#00FF00',right:8,top:8,position:'absolute'}}></View>
             </View>
             <View style={{padding:10,flex:2}}>
               <Text style={{fontWeight:'bold',fontSize:16}}>
                 {falcilar[userData.currentFalci].name}
                </Text>
                <Text numberOfLines={1} ellipsizeMode={'tail'}>
                {capitalizeFirstLetter(this.props.userStore.aktifLastMessage)}
               </Text>
             </View>
             <View style={{padding:20}}>
              {this.props.userStore.aktifUnread<1 ?      <Icon name="angle-right" color={'gray'} size={20} /> :  <View style={{height:26,width:26,borderRadius:13,backgroundColor:'red',justifyContent:'center'}}><Text style={{backgroundColor:'transparent',color:'white',fontWeight:'bold',textAlign:'center'}}>1</Text></View> }

               </View>
           </View>

          </TouchableOpacity>
          </View>
        )
      }
      else{
        if(userData.lastMessage){
          return(
            <View>
            <View style={{borderColor:'white',backgroundColor:'teal'}}><Text style={{textAlign:'center',color:'white',fontWeight:'bold'}}>Son Konuşman</Text></View>
            <TouchableOpacity style={{backgroundColor:'white',borderTopWidth:1,borderBottomWidth:1,borderColor:'#c0c0c0',marginBottom:0}} onPress={() => {this.navigateto('ChatOld',userData.currentFalci)}}>
             <View style={{flexDirection:'row',justifyContent:'space-between',height:60,}}>
                <View>
                <Image source={{uri:falcilar[userData.currentFalci].url}} style={styles.falciAvatar}></Image>
                <View style={{height:12,width:12,borderRadius:6,backgroundColor:'gray',right:8,top:8,position:'absolute'}}></View>
               </View>
               <View style={{padding:10,flex:2}}>
                 <Text style={{fontWeight:'bold',fontSize:16}}>
                   {falcilar[userData.currentFalci].name}
                   <Text style={{fontStyle:'italic',fontWeight:'normal',fontSize:12,color:'gray'}}> (Sohbetten Ayrıldı)</Text>
                  </Text>
                  <Text numberOfLines={1} ellipsizeMode={'tail'}>
                  {capitalizeFirstLetter(userData.lastMessage.text)}
                 </Text>
               </View>
               <View style={{padding:20}}>

                 <Icon name="angle-right" color={'gray'} size={20} />
                 </View>
             </View>

            </TouchableOpacity>
            </View>
          )
        }
        else{
        }

      }
    }
  }

  renderTek = () => {
    if(this.props.socialStore.tek){
      var falType=this.props.userStore.user.lastFalType

      var tek = this.props.socialStore.tek
      var bakildi= false
      if(tek.comments.length>0){bakildi=true; var lastComment=tek.comments[tek.comments.length-1];}

        return(
          <View>
            <View style={{backgroundColor:'transparent',marginBottom:10}}><Text style={{fontFamily:'SourceSansPro-Bold',textAlign:'left',color:'white',fontWeight:'bold',fontSize:14}}>Son Falın</Text></View>
            <TouchableOpacity style={{  height: 58,borderRadius: 4,backgroundColor: "rgba(250, 249, 255, 0.6)"}} onPress={() => {this.navigateToFal()}}>
             <View style={{flexDirection:'row',justifyContent:'space-between',height:60}}>
              <View>
                <Image source={{uri:tek.photos[0]}} style={styles.falciAvatar}></Image>
              </View>

                 {bakildi?
                   <View style={{padding:10,flex:2,justifyContent:'center'}}>
                   <Text style={{fontFamily:'SourceSansPro-SemiBold',fontSize:15,color:'rgb(36, 20, 102)'}}>
                     {tek.comments[0].name}
                    </Text>
                    <Text style={{fontFamily:'SourceSansPro-Regular',fontSize:14,color:'rgb(36, 20, 102)'}} numberOfLines={1} ellipsizeMode={'tail'}>
                    {capitalizeFirstLetter(tek.comments[0].comment)}
                   </Text>
                   </View>
                   :
                    <View style={{padding:10,flex:2,justifyContent:'center'}}>
                   <Text style={{fontFamily:'SourceSansPro-SemiBold',fontSize:16,color:'rgb(36, 20, 102)'}}>
                     Yorum bekleniyor...
                    </Text>
                     </View>
                 }

               <View style={{padding:15,justifyContent:'center',alignItems:'center'}}>
                {this.props.userStore.aktifUnread<1
                  ?
                  <Icon name="angle-right" color={'gray'} size={20}/>
                  :
                  <View style={{height:26,width:31,justifyContent:'center',paddingTop:0}}>
                    <Image source={require('../static/images/anasayfa/noun965432Cc.png')} style={{height:26,width:31,justifyContent:'center'}}/>
                    <Text style={{fontSize:14,backgroundColor:'transparent',color:'white',fontWeight:'bold',textAlign:'center',position:'absolute',top:1,right:11}}>1</Text>
                  </View>
                }
               </View>
             </View>
            </TouchableOpacity>
          </View>
        )
    }
  }
  renderReklam = () => {
    if(this.state.reklam){
      return(
        <PopupDialog
          ref={(popupDialog) => { this.popupReklam = popupDialog; }}
          dialogStyle={{marginTop:-150}}
          width={0.8}
          height={0.6}
          overlayOpacity={0.75}
        >
          <TouchableOpacity style={{flex:1,width: null,height: null}} onPress={() => {this.popupReklam.dismiss();this.props.navigation.navigate(this.state.reklam.destination);}} source={{uri:this.state.reklam.url}}>
            <Image source={{uri:this.state.reklam.url}} resizeMode={'stretch'} style={{flex:1,width: null,height: null}}/>
            <TouchableOpacity style={{position:'absolute',top:10,right:10,width:20,height:20,borderRadius:10,backgroundColor:'lightgray',alignItems:'center',justifyContent:'center'}} onPress={() => {this.popupReklam.dismiss()}}>
              <Text>X</Text>
            </TouchableOpacity>

          </TouchableOpacity>
        </PopupDialog>
      )
    }

  }

  renderFalTypes = () => {
    if(this.state.userData==null){
      return null
    }
    else{
      return(
        <Animated.View style={{opacity:this.state.buttonOpacity}}>

        <View style={{}}>
          <View style={{flexDirection:'row',borderRadius:4}}>
            <TouchableOpacity style={styles.faltypecontainer} onPress={() => {this.props.navigation.navigate('Social')}}>
              <View  style={styles.faltypeimage}>

                <View style={{flex:1,alignSelf: 'stretch',borderRadius:4,alignItems:'center',justifyContent:'center',backgroundColor:'rgb(230,213,160)'}}>

                  <Text style={styles.faltypeyazi}>
                    Sosyal Fal
                  </Text>
                  <Text style={styles.faltypeyazikucuk}>
                    Diğer Falseverle Buluşma Yeriniz!
                  </Text>
                <View style={{position:'absolute',left:0,bottom:0,backgroundColor:'transparent'}}>
                    <Image source={require('../static/images/anasayfa/page1.png')} style={{}}/>
                </View>
                </View>



              </View>
            </TouchableOpacity>

          </View>
          <View style={{flexDirection:'row',borderRadius:4}}>
            <TouchableOpacity style={styles.faltypecontainer} onPress={() => {this.navigateToFalPaylas(0)}}>
              <View style={styles.faltypeimage}>

              <View style={{
                elevation:4,
                position:'absolute',
                top:-57,
                right:-65,

                width: 100,
                height: 100,
                backgroundColor: "#d4993a",
                shadowColor: "rgba(0, 0, 0, 0.2)",
                shadowOffset: {
                  width: 0,
                  height: 2
                },
                shadowRadius: 1,
                shadowOpacity: 1,
                borderRadius: 50,
                zIndex:1000,
                transform: [
                  {scaleX: 2}]}}>

              </View>
              {this.state.userData.appGunlukUsed ? (
                    <View style={{padding:5,zIndex:1001,elevation:5,flexDirection:'row',position:'absolute',top:4,right:4,backgroundColor:'transparent'}}>
                    <Text style={[styles.label]}>
                    100
                    </Text>
                    <Image source={require('../static/images/anasayfa/coinsCopy.png')} style={styles.coin}/>
                  </View>) : (
                    <View style={{padding:5,zIndex:1001,elevation:5,flexDirection:'row',position:'absolute',top:0,right:0,backgroundColor:'transparent'}}>
                    <Animatable.Text style={[styles.label,{color:'#FFFFFF'}]} animation="pulse" iterationCount={"infinite"} direction="alternate">ÜCRETSİZ</Animatable.Text>


                  </View>
                  )}

                <View style={{flex:1,borderRadius:4,alignSelf: 'stretch',alignItems:'center',justifyContent:'center',backgroundColor:'rgb(228,176,92)'}}>

                  <Text style={styles.faltypeyazi}>
                    Günlük Fal
                  </Text>
                  <Text style={styles.faltypeyazikucuk}>
                    Her Gün 1 Adet Kahve Falı Bizden Size <Text style={{fontWeight:'bold'}}>HEDİYE!</Text>
                  </Text>
                <View style={{position:'absolute',left:-15,bottom:-10,backgroundColor:'transparent'}}>
                    <Image source={require('../static/images/anasayfa/noun1410215Cc.png')} style={{}}/>
                </View>
                </View>

              </View>
            </TouchableOpacity>

          </View>
          <View style={{flexDirection:'row'}}>
            <TouchableOpacity style={styles.faltypecontainer} onPress={() => {this.navigateToFalPaylas(1)}}>
              <View  style={styles.faltypeimage}>

                <View style={{

                  position:'absolute',
                  top:-57,
                  right:-65,
                  overflow:'hidden',
                  width: 100,
                  height: 100,
                  backgroundColor: "#aa3f6b",
                  shadowColor: "rgba(0, 0, 0, 0.2)",
                  shadowOffset: {
                    width: 0,
                    height: 2
                  },
                  shadowRadius: 1,
                  shadowOpacity: 1,
                  borderRadius: 50,
                  borderRadius: 50,
                  zIndex:1,
                  transform: [
                    {scaleX: 2}]}}>

                </View>
                <View style={{padding:5,zIndex:1001,elevation:5,flexDirection:'row',position:'absolute',top:4,right:4,backgroundColor:'transparent'}}>
                  <Text style={[styles.label]}>
                    100
                  </Text>
                  <Image source={require('../static/images/anasayfa/coinsCopy.png')} style={styles.coin}/>
                </View>

                <View style={{flex:1,borderRadius:4,alignSelf: 'stretch',alignItems:'center',justifyContent:'center',backgroundColor:'rgb(188,69,118)'}}>
                <View style={{padding:5,flexDirection:'row',position:'absolute',top:5,left:5}}>

                  <Text style={{color:'white',fontSize:10,fontStyle:'italic'}}> Deneyimli {"\n"} Falcılar</Text>
                </View>

                  <Text style={styles.faltypeyazi}>
                    Aşk Falı
                  </Text>
                  <Text style={styles.faltypeyazikucuk}>
                  Detaylı Aşk Yorumları,{"\n"}

                  Diğer Fal Severlerden Yorum İsteme İmkanı
                  </Text>
                <View style={{position:'absolute',zIndex:-100,left:0,bottom:0,backgroundColor:'transparent'}}>
                    <Image source={require('../static/images/anasayfa/group.png')} style={{}}/>
                </View>
                </View>

              </View>
            </TouchableOpacity>


          </View>
          <View style={{flexDirection:'row',borderRadius: 4}}>
            <TouchableOpacity style={styles.faltypecontainer} onPress={() => {this.popupDetay.show()}}>
              <View style={styles.faltypeimage}>
<View style={{
  elevation:4,
  position:'absolute',
  top:-57,
  right:-65,

  width: 100,
  height: 100,
  backgroundColor: "#816fbe",
  shadowColor: "rgba(0, 0, 0, 0.2)",
  shadowOffset: {
    width: 0,
    height: 2
  },
  shadowRadius: 1,
  shadowOpacity: 1,
  borderRadius: 50,
  zIndex:1000,
  transform: [
    {scaleX: 2}]}}>

</View>
<View style={{padding:5,zIndex:1001,elevation:5,flexDirection:'row',position:'absolute',top:4,right:4,backgroundColor:'transparent'}}>
                  <Text style={[styles.label]}>
                    150
                  </Text>
                  <Image source={require('../static/images/anasayfa/coinsCopy.png')} style={styles.coin}/>
                </View>


              <View style={{padding:10,flex:1,alignSelf: 'stretch',alignItems:'center',borderRadius:4,justifyContent:'center',backgroundColor: "#8975cd"}}>
              <View style={{padding:5,flexDirection:'row',position:'absolute',top:5,left:5}}>

                <Text style={{color:'white',fontSize:10,fontStyle:'italic'}}> Deneyimli {"\n"} Falcılar</Text>
              </View>

                <Text style={styles.faltypeyazi}>
                  Detaylı Fal
                </Text>
                <Text style={styles.faltypeyazikucuk}>
                Tüm Konularda Detay{"\n"}

                Diğer Falseverlerden Yorum İsteme İmkanı
                </Text>
                <View style={{position:'absolute',left:0,bottom:0,backgroundColor:'transparent'}}>
                    <Image source={require('../static/images/anasayfa/coffee.png')} style={{}}/>
                </View>

              </View>

              </View>
            </TouchableOpacity>
          </View>

          <View style={{flexDirection:'row'}}>
            <TouchableOpacity style={[styles.faltypecontainer,{borderRadius:4,backgroundColor:'rgb(103,104,145)'}]} onPress={() => {this.popupHand.show()}}>
              <View  style={styles.faltypeimage}>
              {this.state.userData.handUsed == true &&
                                    <View style={{position:'absolute',top:0,right:0}}>

                                    <View style={{
                                      elevation:4,
                                      position:'absolute',
                                      top:-57,
                                      right:-65,

                                      width: 100,
                                      height: 100,
                                      backgroundColor: "#57587e",
                                      shadowColor: "rgba(0, 0, 0, 0.2)",
                                      shadowOffset: {
                                        width: 0,
                                        height: 2
                                      },
                                      shadowRadius: 1,
                                      shadowOpacity: 1,
                                      borderRadius: 50,
                                      borderRadius: 50,
                                      zIndex:1000,
                                      transform: [
                                        {scaleX: 2}]}}>

                                    </View>
                                    <View style={{padding:5,zIndex:1001,elevation:5,flexDirection:'row',position:'absolute',top:4,right:4,backgroundColor:'transparent'}}>
                                                      <Text style={[styles.label]}>
                                                        50
                                                      </Text>
                                                      <Image source={require('../static/images/anasayfa/coinsCopy.png')} style={styles.coin}/>
                                                  </View>
                                      </View>



                                    }
              <View style={{flex:1,alignSelf: 'stretch',alignItems:'center',justifyContent:'center',backgroundColor:'transparent'}}>

                <Text style={styles.faltypeyazi}>
                  El Falı
                </Text>
                <Text style={styles.faltypeyazikucuk}>
                  Eliniz, kaderiniz...
                </Text>
                <View style={{position:'absolute',left:0,bottom:0,backgroundColor:'transparent'}}>
                    <Image source={require('../static/images/anasayfa/noun204985Cc.png')} style={{}}/>
                </View>
              </View>
              </View>
            </TouchableOpacity>

          </View>
        </View>
        </Animated.View>
      )
    }
  }
  render() {

    const buttonHeight = this.state.animatedButton.interpolate({
      inputRange: [0, 1],
      outputRange: [0, 40]
    })

    const bubbleWidth = this.state.animatedBubble.interpolate({
      inputRange: [0, 1],
      outputRange: [0, Dimensions.get('window').width-85]
    })


    return (

      <ImageBackground source={require('../static/images/newImages/BG.png')} style={styles.containerasd}>

        <ScrollView style={{flex:1,width:'100%',padding:15,paddingTop:0}}>

          <View style={{borderBottomWidth:0,borderColor:'#1194F7',marginBottom:20}}>

          {/* Canlı Falcı Sayısı */}
          <View style={{paddingRight:15,height: 70,borderRadius: 15,position:'relative',top:20,flexDirection:'row',justifyContent:'flex-start',paddingBottom:40}}>

              <View style={{borderRadius: 15,width: 30,height: 30,backgroundColor: "#f5a623",flexDirection:'row',justifyContent:'center',alignItems:'center',zIndex:3}}>

                    <Image source={require('../static/images/anasayfa/noun68818Cc.png')} style={{height:26,width:26}}/>
              </View>

              <View style={{height:24,position:'relative',right:29,top:3,paddingRight:20,paddingLeft:30,paddingBottom:2,borderRadius:12,backgroundColor:'rgba(0,0,0,0.18)',flexDirection:'row',justifyContent:'center',alignItems:'center'}}>

                    <Text style={{textAlign:'left',fontWeight:'bold',position:'relative',left:5,fontFamily:'SourceSansPro-Bold',color:'rgb(255,255,255)',fontSize:12}}>
                    Canlı Falcı Sayısı:</Text>
                    <Text style={{fontSize:14,fontWeight:'bold',fontFamily:'SourceSansPro-Bold',color:'rgb(255,255,255)',position:'relative',left:7}}>

                    &nbsp;
                    {this.generatefalcisayisi()}
                    </Text>


              </View>

          </View>

            {/* Bizimle ilgli görüşler */}

          <View style={{height: 70,borderRadius: 15,position:'absolute',top:22,right:0,flexDirection:'row',justifyContent:'flex-start',paddingBottom:40}}>

               <Text style={{textAlign:'right',fontWeight:'normal',fontFamily:'SourceSansPro-Bold',color: "#a48bff",fontSize:10,paddingRight:5}}>
                   Bizimle ilgili görüşlerinizi{'\n'}profil sayfanızdan iletebilirsiniz</Text>
              <Image source={require('../static/images/anasayfa/noun1616273Cc.png')} style={{height:25,width:25,position:'relative',top:3}}/>
          </View>




            {this.renderTek()}

            {this.renderFalTypes()}


          </View>


        </ScrollView>
          {/* End of page */}



        <PopupDialog

          ref={(popupDialog2) => { this.popupGunluk = popupDialog2; }}
          dialogStyle={{marginTop:-150}}
          overlayOpacity={0.75}
          width={0.8}
          height={0.7}
        >
          <ImageBackground style={{flex:1,width: null,height: null}} source={require('../static/images/gunluk.jpg')}>
            <View style={{flex:1,alignSelf: 'stretch',backgroundColor:'rgba(60,179,113, 0.8)'}}>
            {this.state.userData ? this.state.userData.gunlukUsed ?
                (<View style={{padding:5,zIndex:1001,elevation:5,flexDirection:'row',position:'absolute',top:4,right:4,backgroundColor:'transparent'}}>
                <Text style={[styles.label]}>
                  100
                </Text>
                <Image source={require('../static/images/coins.png')} style={styles.coin}/>
              </View>) :
                (<View style={{padding:5,flexDirection:'row',position:'absolute',top:4,right:5}}>
                <Animatable.Text style={[styles.label,{color:'#F8D38C'}]} animation="pulse" iterationCount={"infinite"} direction="alternate">ÜCRETSİZ</Animatable.Text>


              </View>) : null
              }
              { Dimensions.get('screen').height>599 ?
              <Text style={styles.faltypeyazipopup}>
                Günlük Fal
              </Text> : null
              }
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
                    <Text style={{textAlign:'center',alignItems:'center',fontWeight:'bold'}}>SOHBETE BAŞLA</Text>
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
              <View style={{padding:5,flexDirection:'row',position:'absolute',top:4,right:4}}>
                <Text style={[styles.label]}>
                  100
                </Text>
                <Image source={require('../static/images/coins.png')} style={styles.coin}/>
              </View>
              { Dimensions.get('screen').height>599 ?
              <Text style={styles.faltypeyazipopup}>
                Sırlar dökülsün, aşk konuşalım
              </Text> : null
              }

              <Text style={{position:'absolute',color:'transparent',backgroundColor:'transparent',fontSize:0}}>{this.props.userStore.userCredit}</Text>
              <Text style={styles.faltypeyazikucukpopup}>
                {'\u2022'} Falınızı sosyal panoda paylaşma imkanı{'\n'}
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
                    <Text style={{textAlign:'center',alignItems:'center',fontWeight:'bold'}}>SOHBETE BAŞLA</Text>
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
              <View style={{padding:5,flexDirection:'row',position:'absolute',top:4,right:4}}>
                <Text style={[styles.label]}>
                  150
                </Text>
                <Image source={require('../static/images/coins.png')} style={styles.coin}/>
              </View>
              { Dimensions.get('screen').height>599 ?
              <Text style={styles.faltypeyazipopup}>
                Ortaya çıkmayan detay kalmasın
              </Text> : null
              }

              <Text style={styles.faltypeyazikucukpopup}>
                {'\u2022'} Falınızı sosyal panoda paylaşma imkanı{'\n'}
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
                    <Text style={{textAlign:'center',fontWeight:'bold'}}>SOHBETE BAŞLA</Text>
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
              {this.state.userData ? this.state.userData.handUsed ?
                  <View style={{padding:5,flexDirection:'row',position:'absolute',top:4,right:4}}>
                  <Text style={[styles.label]}>
                    50
                  </Text>
                  <Image source={require('../static/images/coins.png')} style={styles.coin}/>
                </View> : null : null}

              { Dimensions.get('screen').height>599 ?
                <Text style={styles.faltypeyazipopup}>
                  Eliniz, kaderiniz
                </Text> : null
              }
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
                    <Text style={{textAlign:'center',fontWeight:'bold'}}>SOHBETE BAŞLA</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </ImageBackground>
        </PopupDialog>
        <PopupDialog
          ref={(popupDialog) => { this.popupParaiste = popupDialog; }}
          dialogStyle={{marginTop:-150}}
          width={0.8}
          height={0.6}
          overlayOpacity={0.75}
        >
          <ImageBackground style={{flex:1,width: null,height: null}} source={require('../static/images/paraisteback.jpg')}>

            <Image source={require('../static/images/appicon.png')} style={{marginTop:10,marginBottom:10,height:80,width:80,borderRadius:40,alignSelf:'center'}}/>
            <Text style={{backgroundColor:'transparent',color:'white',marginLeft:15,marginRight:15,fontSize:16}}>
              {"Sevgili "+this.props.userStore.userName+",\n\nÜcretsiz günlük fal haklarını maalesef tükettin 😞\n\n"}
              Bir kere <Text style={{fontWeight:'bold'}}>AŞK</Text> veya <Text style={{fontWeight:'bold'}}>DETAYLI</Text> fal baktırırsan ücretsiz ve sınırsız günlük fal haklarına tekrar kavuşacaksın!🎉🎊
            </Text>
            <View style={{position:'absolute',bottom:0,width:'100%'}}>
              <View style={{alignSelf:'stretch',flex:1,flexDirection:'row',justifyContent:'space-around',backgroundColor:'white'}}>
                <TouchableOpacity  onPress={() => {this.popupParaiste.dismiss();this.popupAsk.show()}} style={{flex:1,height:60,flexGrow:1,borderRightWidth:1,justifyContent:'center'}}>
                  <Text style={{textAlign:'center',fontWeight:'bold'}}>AŞK Falına Bak{'\n'}❤️</Text>
                </TouchableOpacity>
                <TouchableOpacity  onPress={() => {this.popupParaiste.dismiss();this.popupDetay.show()}} style={{flex:1,height:60,flexGrow:1,borderLeftWidth:1,justifyContent:'center'}}>
                  <Text style={{textAlign:'center',fontWeight:'bold'}}>DETAYLI Falına Bak{'\n'}🔮</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ImageBackground>
        </PopupDialog>
        {this.renderReklam()}
      </ImageBackground>

    );
  }
}




const styles = StyleSheet.create({
  containerasd: {
    flex: 1,
    alignSelf: 'stretch',
    width: null,
    alignItems:'center',
    padding:0,
    paddingTop:0,
    paddingBottom:0

  },
  fbloginbutton:{
    justifyContent:'center',
  },
  faltypecontainer:{
    flex:1,
    height:130,
    borderRadius: 4,
    overflow:'hidden',
    marginTop:15,

      },

  faltypeimage:{
    alignItems:'center',
    alignSelf: 'stretch',
    width: null,
    height:130,
    borderRadius: 16,
    flexDirection:'column-reverse'
  },
  faltypeimagesosyal:{
    alignItems:'center',
    alignSelf: 'stretch',
    width: null,
    height:73,
    flexDirection:'column-reverse'
  },
  button1:{
    backgroundColor:'#1194F7',

    width:Dimensions.get('window').width/2,
    justifyContent:'center',
    elevation:6,
    marginBottom:15
  },
  button2:{
    backgroundColor:'#1194F7',
    width:Dimensions.get('window').width/3,
    justifyContent:'center',
    elevation:6
  },
  buttonswrap:{
    justifyContent:'center',
    alignItems:'center',
    flexDirection:'column',
  },
  buttontext1:{
    color:'white',
    fontWeight:'bold',
    textAlign:'center',
    fontSize:22
  },
  faltypeyazi:{
    textAlign: 'center',color:'white',fontWeight:'bold',fontSize:22,fontFamily:'SourceSansPro-Bold'
  },
  faltypeyazipopup:{
    textAlign: 'center',color:'white',fontWeight:'bold',fontSize:19,marginTop:20
  },
  faltypeyazikucuk:{
    textAlign: 'center',color:'white',fontSize:14,zIndex:1000,fontFamily:'SourceSansPro-Regular'
  },
  faltypeyazikucukpopup:{
    color:'white',fontSize:15,marginLeft:25,marginRight:5,marginTop:20
  },
  faltypeyazikucukpopup2:{
    flex:1,color:'white',fontSize:14,padding:15,fontWeight:'bold',alignSelf:'stretch',textAlign:'center'
  },
  buttontext2:{
    color:'white',
    fontWeight:'bold',
    textAlign:'center',
    fontSize:16
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
  marqueeContainer:{
    flex:1,
    marginBottom:10,
    paddingVertical:5,
    backgroundColor:'rgba(0, 0, 0, 0.6)',
    borderTopWidth:1,
    borderBottomWidth:1,
    borderColor:'white',
  },
  marquee: {

      fontSize: 16,
      color:'white',
      backgroundColor: 'transparent',
      overflow: 'hidden',
  },
  label: {
    fontSize: 12,
    color:'white',
    textAlign:'center',
    fontWeight:'bold'
  },
  falciAvatar:{
    height:48,
    width:48,
    margin:5,
    marginLeft:5,
    borderRadius:4,
  }
});
