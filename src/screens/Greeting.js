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
  ImageBackground
} from 'react-native';


import PropTypes from 'prop-types';
import firebase from 'react-native-firebase';
import axios from 'axios';
import UserData from '../components/UserData';
import { NavigationActions } from 'react-navigation'
import Icon from 'react-native-vector-icons/FontAwesome';
import Backend from '../Backend';
import { NativeModules } from 'react-native'
import FCM from 'react-native-fcm';
import { observable } from 'mobx';
import { observer, inject } from 'mobx-react';
import Spinner from 'react-native-loading-spinner-overlay';
import Picker from 'react-native-picker';
import ProfilePicker from '../components/ProfilePicker';
import PopupDialog, { SlideAnimation, DialogTitle } from 'react-native-popup-dialog';
import * as Animatable from 'react-native-animatable';
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
      marquee:''
  };
  this.navigateto = this.navigateto.bind(this);
  this.greetingMounted = false;
  this.springValue = new Animated.Value(0.1)
}

static navigationOptions = ({ navigation }) => ({
    title: 'Kahve Falı Sohbeti',
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

  startgunluk1 = () => {
    var userData=this.props.userStore.user
  //  alert(typeof userData.detayUsed === 'undefined')
    if(userData.timesUsed>9&&typeof userData.detayUsed === 'undefined'&&typeof userData.loveUsed === 'undefined'){
      this.popupParaiste.show()
    }
    else {
      this.popupGunluk.show()
    }
  }

  startGunluk2 = () => {
    if(this.props.userStore.profileIsValid){
      var userData =this.state.userData
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


  startHand = () => {
    var userData =this.state.userData
    if(!userData.handUsed&&!userData.aktif){
      this.navigateto('Chat',0,3)
    }else if(!userData.handUsed&&userData.aktif){
      Alert.alert(
        'Yeni Fal',
        'Şu an mevcut bir aktif sohbetin bulunuyor. Bu konuşmayı sonlandırıp el falına bakmak istediğinden emin misin?',
        [
          {text: 'Hayır', onPress: () => {}},
          {text: 'Evet', onPress: () => {this.navigateto('Chat',0,3)}},
        ],
      )
    }
    else if (userData.handUsed&&!userData.aktif) {
      Alert.alert(
        'El Falı',
        'El falına sadece bir kere ücretsiz bakıyoruz. Hemen 50 kredi karşılığında bir el falı daha baktırmak ister misin?',
        [
          {text: 'Hayır', onPress: () => {}},
          {text: 'Evet', onPress: () => {
            if(this.props.userStore.userCredit<50){
              this.pay(3)
            }
            else{
              this.navigateto('Chat',0,3)
              Backend.addCredits(-50)
            }
        }},
        ],
      )
    }
    else{
      Alert.alert(
        'El Falı',
        'El falına sadece bir kere ücretsiz bakıyoruz. Mevcut sohbetini sonlandırarak, hemen 50 kredi karşılığında bir el falı daha baktırmak ister misin?',
        [
          {text: 'Hayır', onPress: () => {}},
          {text: 'Evet', onPress: () => {
            if(this.props.userStore.userCredit<50){
              this.pay(3)
            }
            else{
              this.navigateto('Chat',0,3)
              Backend.addCredits(-50)
            }
        }},
        ],
      )
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

  startAgent = () => {
    var user = firebase.auth().currentUser;
    var pushRef = firebase.database().ref('tickets');
    var ticket={
      fireID: user.uid,
      text: "Yeni Fal",
      status:0,
      senderName:user.displayName,
      senderPhoto:user.photoURL,
      createdAt: firebase.database.ServerValue.TIMESTAMP,
    }
    pushRef.push(ticket).then(function(value){
      var ticketKey = /[^/]*$/.exec(value)[0];
      ticket.key=ticketKey
      //Backend.createTicket(ticket);
      this.props.navigation.navigate('Countdown',{ticket:ticket})
    }.bind(this))
    //Backend.createTicket();
    //this.props.navigation.navigate('ChatAgent')
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

    this.generatefalcisayisi()

    FCM.setBadgeNumber(0);

    axios.post('https://eventfluxbot.herokuapp.com/webhook/getAppUser', {
      uid: Backend.getUid(),
    })
    .then( (response) => {
      var responseJson=response.data

      this.setState({greetingMessage:responseJson.greeting,userData:responseJson,credit:responseJson.credit,marquee:"       Canlı falcı sayısı: "+this.generatefalcisayisi()+"     ||     "+responseJson.marquee});
       //alert(JSON.stringify(responseJson))
       this.props.userStore.setUser(responseJson)
       this.props.navigation.setParams({ crredit: responseJson.credit,odemeyegit: this.navigateto})
    })
    .catch(function (error) {

    });


     Backend.lastMessageUpdate((message) => {

       this.props.userStore.setAktifLastMessage(message.text)
       if(message.user==0){
          this.props.userStore.setAktifUnread(1)
       }

     })
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
        else{/*
          return (  <View style={styles.marqueeContainer}>
          <Marquee speed={15} style={styles.marquee}>
                  {this.state.marquee}
              </Marquee>
              </View>)*/
        }

      }
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
        <View style={{flexDirection:'row'}}>
          <TouchableOpacity style={styles.faltypecontainersosyal} onPress={() => {this.props.navigation.navigate('Social')}}>
            <ImageBackground source={require('../static/images/karilar.png')} style={styles.faltypeimagesosyal}>

              <View style={{flex:1,alignSelf: 'stretch',alignItems:'center',justifyContent:'center',backgroundColor:'rgba(0,128,128, 0.8)'}}>

                <Text style={styles.faltypeyazi}>
                  Sosyal Fal
                </Text>
                <Text style={styles.faltypeyazikucuk}>
                  Diğer falseverle buluşma yeriniz!
                </Text>
              </View>
              <View style={{position:'absolute',right:10,top:13,backgroundColor:'transparent'}}>
                <Icon name="chevron-right" color={"white"} size={50} />
              </View>
            </ImageBackground>
          </TouchableOpacity>

        </View>
          <View style={{flexDirection:'row'}}>
            <TouchableOpacity style={styles.faltypecontainer} onPress={() => {this.startgunluk1()}}>
              <ImageBackground source={require('../static/images/gunluk.jpg')} style={styles.faltypeimage}>

                <View style={{flex:1,alignSelf: 'stretch',alignItems:'center',justifyContent:'center',backgroundColor:'rgba(60,179,113, 0.8)'}}>
                {this.state.userData.appGunlukUsed ? (
                    <View style={{padding:5,flexDirection:'row',position:'absolute',top:0,right:0}}>
                    <Text style={[styles.label]}>
                      100
                    </Text>
                    <Image source={require('../static/images/coins.png')} style={styles.coin}/>
                  </View>) : (
                    <View style={{padding:5,flexDirection:'row',position:'absolute',top:5,right:5}}>
                    <Animatable.Text style={[styles.label,{color:'#F8D38C'}]} animation="pulse" iterationCount={"infinite"} direction="alternate">ÜCRETSİZ</Animatable.Text>


                  </View>
                  )}
                  <Text style={styles.faltypeyazi}>
                    Günlük Fal
                  </Text>
                  <Text style={styles.faltypeyazikucuk}>
                    Hergün 1 adet kahve falı bizden size <Text style={{fontWeight:'bold'}}>HEDİYE!</Text>
                  </Text>
                </View>
              </ImageBackground>
            </TouchableOpacity>

          </View>
          <View style={{flexDirection:'row'}}>
            <TouchableOpacity style={styles.faltypecontainer} onPress={() => {this.popupAsk.show()}}>
              <ImageBackground source={require('../static/images/ask.jpg')} style={styles.faltypeimage}>

                <View style={{flex:1,alignSelf: 'stretch',alignItems:'center',justifyContent:'center',backgroundColor:'rgba(249,50,12, 0.6)'}}>
                <View style={{padding:5,flexDirection:'row',position:'absolute',top:0,left:0}}>
                  <Icon name="star" color={'yellow'} size={20} />
                  <Text style={{color:'white',fontSize:12,fontStyle:'italic'}}> Deneyimli {"\n"} falcılar</Text>
                </View>
                  <View style={{padding:5,flexDirection:'row',position:'absolute',top:0,right:0}}>
                    <Text style={[styles.label]}>
                      100
                    </Text>
                    <Image source={require('../static/images/coins.png')} style={styles.coin}/>
                  </View>
                  <Text style={styles.faltypeyazi}>
                    Aşk Falı
                  </Text>
                  <Text style={styles.faltypeyazikucuk}>
                  Detaylı Aşk Yorumları{"\n"}
                  +{"\n"}
                  Falınıza diğer falseverlerden de yorum isteme imkanı
                  </Text>
                </View>
              </ImageBackground>
            </TouchableOpacity>


          </View>
          <View style={{flexDirection:'row'}}>
            <TouchableOpacity style={styles.faltypecontainer} onPress={() => {this.popupDetay.show()}}>
              <ImageBackground source={require('../static/images/detayli.jpg')} style={styles.faltypeimage}>

              <View style={{padding:10,flex:1,alignSelf: 'stretch',alignItems:'center',justifyContent:'center',backgroundColor:'rgba(114,0,218, 0.6)'}}>
              <View style={{padding:5,flexDirection:'row',position:'absolute',top:0,left:0}}>
                <Icon name="star" color={'yellow'} size={20} />
                <Text style={{color:'white',fontSize:12,fontStyle:'italic'}}> Deneyimli {"\n"} falcılar</Text>
              </View>
                <View style={{padding:5,flexDirection:'row',position:'absolute',top:0,right:0}}>
                  <Text style={[styles.label]}>
                    150
                  </Text>
                  <Image source={require('../static/images/coins.png')} style={styles.coin}/>
                </View>
                <Text style={styles.faltypeyazi}>
                  Detaylı Fal
                </Text>
                <Text style={styles.faltypeyazikucuk}>
                Tüm Konularda Detay{"\n"}
                +{"\n"}
                Falınıza diğer falseverlerden de yorum isteme imkanı
                </Text>

              </View>
              </ImageBackground>
            </TouchableOpacity>
          </View>

          <View style={{flexDirection:'row'}}>
            <TouchableOpacity style={styles.faltypecontainer} onPress={() => {this.popupHand.show()}}>
              <ImageBackground source={require('../static/images/elfali.jpg')} style={styles.faltypeimage}>
              <View style={{flex:1,alignSelf: 'stretch',alignItems:'center',justifyContent:'center',backgroundColor:'rgba(0,185,241, 0.6)'}}>
                {this.state.userData.handUsed == true &&
                    <View style={{padding:5,flexDirection:'row',position:'absolute',top:0,right:0}}>
                    <Text style={[styles.label]}>
                      50
                    </Text>
                    <Image source={require('../static/images/coins.png')} style={styles.coin}/>
                  </View>}
                <Text style={styles.faltypeyazi}>
                  El Falı
                </Text>
                <Text style={styles.faltypeyazikucuk}>
                  Eliniz, kaderiniz...
                </Text>
              </View>
              </ImageBackground>
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

      <ImageBackground source={require('../static/images/splash4.png')} style={styles.containerasd}>

        <Spinner visible={this.state.spinnerVisible} textStyle={{color: '#DDD'}} />

        <ScrollView style={{flex:1,padding:0}}>

          <View style={{borderBottomWidth:0,borderColor:'#1194F7',marginBottom:20}}>

            <View style={{padding:Dimensions.get('window').height/50,flexDirection:'row',justifyContent:'space-between',paddingLeft:0,marginBottom:5,alignSelf:'stretch'}}>
              <View>
                <Image style={{height:40,width:40, borderRadius:20,marginRight:10,marginLeft:10}} source={require('../static/images/anneLogo3.png')}>
                </Image>

              </View>
              <View style={{borderRadius:10,backgroundColor:'rgba(0, 0, 0, 0.6)',padding:10,width:Dimensions.get('window').width-85}}>
                <Text style={{fontSize:13,color:'white'}}>
                  {this.state.greetingMessage}
                </Text>

              </View>

            </View>

            {this.renderAktif()}
            {this.renderFalTypes()}


          </View>


        </ScrollView>
        <PopupDialog

          ref={(popupDialog2) => { this.popupGunluk = popupDialog2; }}
          dialogStyle={{marginTop:-150}}
          overlayOpacity={0.75}
          width={0.8}
          height={0.7}
        >
          <ImageBackground style={{flex:1,width: null,height: null}} source={require('../static/images/gunluk.jpg')}>
            <View style={{flex:1,alignSelf: 'stretch',backgroundColor:'rgba(60,179,113, 0.8)'}}>
            {this.state.userData ? this.state.userData.appGunlukUsed ?
                (<View style={{padding:5,flexDirection:'row',position:'absolute',top:0,right:0}}>
                <Text style={[styles.label]}>
                  100
                </Text>
                <Image source={require('../static/images/coins.png')} style={styles.coin}/>
              </View>) :
                (<View style={{padding:5,flexDirection:'row',position:'absolute',top:5,right:5}}>
                <Animatable.Text style={[styles.label,{color:'#F8D38C'}]} animation="pulse" iterationCount={"infinite"} direction="alternate">ÜCRETSİZ</Animatable.Text>


              </View>) : null
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
              {this.state.userData ? this.state.userData.handUsed ?
                  <View style={{padding:5,flexDirection:'row',position:'absolute',top:0,right:0}}>
                  <Text style={[styles.label]}>
                    50
                  </Text>
                  <Image source={require('../static/images/coins.png')} style={styles.coin}/>
                </View> : null : null}
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
          ref={(popupDialog) => { this.popupParaiste = popupDialog; }}
          dialogStyle={{marginTop:-150}}
          width={0.8}
          height={0.6}
          overlayOpacity={0.75}
        >
          <ImageBackground style={{flex:1,width: null,height: null}} source={require('../static/images/paraisteback.jpg')}>

            <ImageBackground source={require('../static/images/appicon.png')} style={{marginTop:10,marginBottom:10,height:80,width:80,borderRadius:40,alignSelf:'center'}}/>
            <Text style={{backgroundColor:'transparent',color:'white',marginLeft:15,marginRight:15,fontSize:16}}>
              {"Sevgili "+this.props.userStore.userName+",\n\nÜcretsiz günlük fal haklarını maalesef tükettin 😞\n\n"}
              Bir kere <Text style={{fontWeight:'bold'}}>AŞK</Text> veya <Text style={{fontWeight:'bold'}}>DETAYLI</Text> fal baktırırsan, tam <Text style={{fontWeight:'bold',fontSize:18,color:'#ffbacd'}}>250 adet</Text> bedava günlük fal hakkı kazanacaksın!🎉🎊
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
      </ImageBackground>

    );
  }
}




const styles = StyleSheet.create({
  containerasd: {
    flex: 1,

    width: null,
    height: null,

  },
  fbloginbutton:{
    justifyContent:'center',
  },
  faltypecontainer:{
    flex:1,
    height:100,
    borderWidth:1,
    borderColor:'white',
    marginLeft:10,
    marginTop:10,
    marginRight:10,
    borderBottomWidth:1
  },
  faltypecontainersosyal:{
    flex:1,
    height:75,
    borderWidth:1,
    borderColor:'white',
    marginLeft:10,
    marginTop:10,
    marginRight:10,
    borderBottomWidth:1
  },
  faltypeimage:{
    alignItems:'center',
    alignSelf: 'stretch',
    width: null,
    height:98,
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
    textAlign: 'center',color:'white',fontWeight:'bold',fontSize:22,marginBottom:5
  },
  faltypeyazipopup:{
    textAlign: 'center',color:'white',fontWeight:'bold',fontSize:22,marginTop:20,marginBottom:15
  },
  faltypeyazikucuk:{
    textAlign: 'center',color:'white',fontSize:14
  },
  faltypeyazikucukpopup:{
    color:'white',fontSize:18,marginLeft:25,marginRight:5
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
  label: {
    fontSize: 12,
    color:'white',
    textAlign:'center',
    fontWeight:'bold'
  },
  marqueeContainer:{
    flex:1,
    marginBottom:5,
    paddingVertical:5,
    backgroundColor:'rgba(0, 0, 0, 0.6)',
    borderTopWidth:1,
    borderBottomWidth:1,
    borderColor:'white'
  },
  marquee: {

      fontSize: 16,
      color:'white',
      backgroundColor: 'transparent',
      overflow: 'hidden',
  },
  falciAvatar:{
    height:40,
    width:40,
    margin:10,
    borderRadius:20,
  }
});
