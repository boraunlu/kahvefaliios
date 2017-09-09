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
  ScrollView
} from 'react-native';



import firebase from 'firebase';
import UserData from '../components/UserData';
import { NavigationActions } from 'react-navigation'
import Icon from 'react-native-vector-icons/FontAwesome';
import Backend from '../Backend';
import { NativeModules } from 'react-native'
import FCM from 'react-native-fcm';
import { observable } from 'mobx';
import { observer, inject } from 'mobx-react';
import Spinner from 'react-native-loading-spinner-overlay';
import PopupDialog, { SlideAnimation, DialogTitle } from 'react-native-popup-dialog';
import * as Animatable from 'react-native-animatable';

const { InAppUtils } = NativeModules
require('../components/data/falcilar.js');
import moment from 'moment';
var esLocale = require('moment/locale/tr');
moment.locale('tr', esLocale);

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}
function generateRandom(uzunluk, mevcut) {
    var num = Math.floor(Math.random() * falcilar.length);
    return (num === mevcut ) ? generateRandom(uzunluk, mevcut) : num;
}

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
  };
  this.navigateto = this.navigateto.bind(this);
  this.greetingMounted = false;
  this.springValue = new Animated.Value(0.1)
}

  static navigationOptions = {
      title: 'Kahve Falı Sohbeti',
      tabBarLabel: 'Ana Sayfa',
       tabBarIcon: ({ tintColor }) => (
         <Icon name="home" color={tintColor} size={25} />
       ),
    };

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
          var identifier = products[0].identifier
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
            NavigationActions.navigate({ routeName: 'Chat',params:{newFortune:false,falciNo:falciNo}})
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
          var randomnumber = generateRandom(falcilar.length,this.state.userData.currentFalci)
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



  startGunluk = () => {
    var userData =this.state.userData
    if(!userData.appGunlukUsed&&!userData.aktif){
      this.navigateto('Chat',0,0)
    }else if(!userData.appGunlukUsed&&userData.aktif){
      Alert.alert(
        'Yeni Fal',
        'Şu an mevcut bir aktif sohbetin bulunuyor. Bu konuşmayı sonlandırıp günlük falına bakmak istediğinden emin misin?',
        [
          {text: 'Hayır', onPress: () => {}},
          {text: 'Evet', onPress: () => {this.navigateto('Chat',0,0)}, style: 'cancel'},
        ],
      )
    }
    else if (userData.appGunlukUsed&&!userData.aktif) {
      Alert.alert(
        'Yeni Günlük Fal',
        'Günlük fala ücretsiz olarak günde sadece bir kere bakıyoruz. Hemen 100 kredi karşılığında bir günlük fal daha baktırmak ister misin?',
        [
          {text: 'Hayır', onPress: () => {}},
          {text: 'Evet', onPress: () => {
            if(this.props.userStore.userCredit<100){
              this.pay(0)
            }
            else{
              this.navigateto('Chat',0,0)
              Backend.addCredits(-100)
            }
        }, style: 'cancel'},
        ],
      )
    }
    else{
      Alert.alert(
        'Yeni Günlük Fal',
        'Günlük fala ücretsiz olarak günde sadece bir kere bakıyoruz. Mevcut sohbetini sonlandırarak, hemen 100 kredi karşılığında bir günlük fal daha baktırmak ister misin?',
        [
          {text: 'Hayır', onPress: () => {}},
          {text: 'Evet', onPress: () => {
            if(this.props.userStore.userCredit<100){
              this.pay(0)
            }
            else{
              this.navigateto('Chat',0,0)
              Backend.addCredits(-100)
            }
        }, style:'cancel'},
        ],
      )
    }

  }


  startAsk = () => {
    var userData =this.state.userData
    if(this.props.userStore.userCredit<100){
      var messagebody = ''
      userData.aktif ? messagebody = 'Aşk falına 100 Kredi karşılığında bakıyoruz. Mevcut konuşmanı sonlandırıp hemen hesabına 100 kredi ekleyelim mi?' : messagebody='Aşk falına 100 Kredi karşılığında bakıyoruz. Hemen hesabına 100 kredi ekleyelim mi?'
      Alert.alert(
        'Aşk Falı',
        messagebody,
        [
          {text: 'Hayır', onPress: () => {}},
          {text: 'Evet', onPress: () => {
              this.pay(1)
          }, style: 'cancel'},
        ],
      )
    }
    else{
      var messagebody = ''
      userData.aktif ? messagebody = 'Aşk falına 100 Kredi karşılığında bakıyoruz. Mevcut konuşmanı sonlandırıp hemen aşk falına başlayalım mı?' : messagebody='Aşk falına 100 Kredi karşılığında bakıyoruz. Hemen başlayalım mı?'
      Alert.alert(
        'Aşk Falı',
        messagebody,
        [
          {text: 'Hayır', onPress: () => {}},
          {text: 'Evet', onPress: () => {
                this.navigateto('Chat',0,1);
                Backend.addCredits(-100)
          }, style: 'cancel'},
        ],
      )
    }
  }

  startAsk2 = () => {

    if(this.props.userStore.userCredit<100){
              this.pay(1)
    }
    else{
      Backend.addCredits(-100)
      this.navigateto('Chat',0,1);
    }
  }

  startDetay = () => {
    var userData =this.state.userData
    if(this.props.userStore.userCredit<150){
      var messagebody = ''
      userData.aktif ? messagebody = 'Detaylı kahve falına 150 Kredi karşılığında bakıyoruz. Mevcut konuşmanı sonlandırıp hemen hesabına 150 kredi ekleyelim mi?' : messagebody='Detaylı kahve falına 150 Kredi karşılığında bakıyoruz. Hemen hesabına 150 kredi ekleyelim mi?'
      Alert.alert(
        'Detaylı Fal',
        messagebody,
        [
          {text: 'Hayır', onPress: () => {}},
          {text: 'Evet', onPress: () => {
              this.pay(2)
          }, style: 'cancel'},
        ],
      )
    }
    else{
      var messagebody = ''
      userData.aktif ? messagebody = 'Detaylı kahve falına 150 Kredi karşılığında bakıyoruz. Mevcut konuşmanı sonlandırıp hemen detaylı falına başlayalım mı?' : messagebody='Detaylı kahve falına 150 Kredi karşılığında bakıyoruz. Hemen başlayalım mı?'
      Alert.alert(
        'Detaylı Fal',
        messagebody,
        [
          {text: 'Hayır', onPress: () => {}},
          {text: 'Evet', onPress: () => {
                this.navigateto('Chat',0,2);
                Backend.addCredits(-150)
          }, style: 'cancel'},
        ],
      )
    }
  }

  startDetay2 = () => {
    if(this.props.userStore.userCredit<150){
              this.pay(2)
    }
    else{
      Backend.addCredits(-150)
      this.navigateto('Chat',0,2);
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
          {text: 'Evet', onPress: () => {this.navigateto('Chat',0,3)}, style: 'cancel'},
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
        }, style: 'cancel'},
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
        }, style: 'cancel'},
        ],
      )
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
  componentDidUpdate(prevProps,prevState){
    if(prevState.userData==null&&this.state.userData!==null){
      this.fadeButtons();
    }

  }

  componentDidMount() {
    //const { params } = this.props.navigation.state;
    FCM.setBadgeNumber(0);
    fetch('https://eventfluxbot.herokuapp.com/webhook/getAppUser', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        uid: Backend.getUid(),
      })
    })
    .then((response) => response.json())
     .then((responseJson) => {
       //alert(JSON.stringify(responseJson));
          this.setState({greetingMessage:responseJson.greeting,userData:responseJson,credit:responseJson.credit});
         //alert(JSON.stringify(responseJson))
         this.props.userStore.setUser(responseJson)

     })


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
          <View style={{backgroundColor:'#dcdcdc'}}><Text style={{textAlign:'center',color:'#2f4f4f',fontWeight:'bold'}}>Canlı Sohbetin</Text></View>
          <TouchableOpacity style={{backgroundColor:'white',borderTopWidth:1,borderBottomWidth:1,borderColor:'#c0c0c0',marginBottom:20}} onPress={() => {this.navigateToAktif(userData.currentFalci)}}>
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
            <View style={{backgroundColor:'#dcdcdc'}}><Text style={{textAlign:'center',color:'#2f4f4f',fontWeight:'bold'}}>Son Konuşman</Text></View>
            <TouchableHighlight style={{backgroundColor:'white',borderTopWidth:1,borderBottomWidth:1,borderColor:'#c0c0c0',marginBottom:20}} onPress={() => {this.navigateto('ChatOld',userData.currentFalci)}}>
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

            </TouchableHighlight>
            </View>
          )
        }
        else{
          return null
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
        <View style={{backgroundColor:'#dcdcdc',padding:2,flexDirection:'row',justifyContent:'center'}}><Text style={{textAlign:'center',color:'#2f4f4f',fontSize:17,fontWeight:'bold'}}>Yeni Fal</Text><Text> </Text></View>
        <View style={{borderColor:'white',borderWidth:1}}>
          <View style={{flexDirection:'row'}}>
            <TouchableOpacity style={styles.faltypecontainer} onPress={() => {this.startGunluk()}}>
              <Image source={require('../static/images/gunluk.jpg')} style={styles.faltypeimage}>

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
              </Image>
            </TouchableOpacity>

          </View>
          <View style={{flexDirection:'row'}}>
            <TouchableOpacity style={styles.faltypecontainer} onPress={() => {this.popupAsk.show()}}>
              <Image source={require('../static/images/ask.jpg')} style={styles.faltypeimage}>
                <View style={{flex:1,alignSelf: 'stretch',alignItems:'center',justifyContent:'center',backgroundColor:'rgba(249,50,12, 0.6)'}}>
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
                    Sırlar dökülsün, aşk konuşalım
                  </Text>
                </View>
              </Image>
            </TouchableOpacity>
            <TouchableOpacity style={styles.faltypecontainer} onPress={() => {this.popupDetay.show()}}>
              <Image source={require('../static/images/detayli.jpg')} style={styles.faltypeimage}>
              <View style={{padding:10,flex:1,alignSelf: 'stretch',alignItems:'center',justifyContent:'center',backgroundColor:'rgba(114,0,218, 0.6)'}}>
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
                  Ortaya çıkmayan detay kalmasın
                </Text>

              </View>
              </Image>
            </TouchableOpacity>

          </View>
          <View style={{flexDirection:'row'}}>
            <TouchableOpacity style={styles.faltypecontainer} onPress={() => {this.startHand()}}>
              <Image source={require('../static/images/elfali.jpg')} style={styles.faltypeimage}>
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
              </Image>
            </TouchableOpacity>
            <TouchableOpacity style={styles.faltypecontainer} onPress={() => {Alert.alert("Rüya Tabiri","Çok yakında sizlerle, beklemede kalın...")}}>
              <Image source={require('../static/images/ruya.jpg')} style={styles.faltypeimage}>
              <View style={{padding:10,flex:1,alignSelf: 'stretch',alignItems:'center',justifyContent:'center',backgroundColor:'rgba(209,142,12, 0.8)'}}>

                <Text style={styles.faltypeyazi}>
                  Rüya Tabiri
                </Text>
                <Text style={styles.faltypeyazikucuk}>
                  Çok yakında...
                </Text>

              </View>
              </Image>
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

      <Image source={require('../static/images/splash4.png')} style={styles.containerasd}>

        <Spinner visible={this.state.spinnerVisible} textStyle={{color: '#DDD'}} />

        <ScrollView style={{flex:1,padding:0}}>

          <View style={{borderBottomWidth:0,borderColor:'#1194F7',marginBottom:20}}>
            <View style={{padding:Dimensions.get('window').height/50,flexDirection:'row',justifyContent:'space-between',paddingLeft:0,marginBottom:5,alignSelf:'stretch'}}>
              <View>
                <Image style={{height:40,width:40, borderRadius:20,marginRight:10,marginLeft:10}} source={require('../static/images/anneLogo3.png')}>
                </Image>

              </View>
              <View style={{borderRadius:10,backgroundColor:'rgba(0, 0, 0, 0.5)',padding:10,width:Dimensions.get('window').width-85}}>
                <Text style={{fontSize:16,color:'white'}}>
                  {this.state.greetingMessage}
                </Text>

              </View>

            </View>

            {this.renderAktif()}
            {this.renderFalTypes()}


          </View>


        </ScrollView>
        <PopupDialog
          dialogTitle={<DialogTitle title="AŞK FALI" />}
          ref={(popupDialog) => { this.popupAsk = popupDialog; }}
          dialogStyle={{marginTop:-150}}
          dialogAnimation = { new SlideAnimation({ slideFrom: 'left' }) }
          width={'80%'}
          height={'50%'}
        >
          <Image style={{flex:1,width: null,height: null}} source={require('../static/images/ask.jpg')}>
            <View style={{flex:1,alignSelf: 'stretch',backgroundColor:'rgba(249,50,12,0.6)'}}>

              <Text style={styles.faltypeyazipopup}>
                Sırlar dökülsün, aşk konuşalım
              </Text>
              <Text style={styles.faltypeyazikucukpopup}>
                {'\u2022'} Detaylı aşk yorumları{'\n'}
                {'\u2022'} İlişki tavsiyeleri{'\n'}
                {'\u2022'} Sıra beklemek yok{'\n'}
              </Text>
              <View style={{position:'absolute',bottom:0,width:'100%'}}>
                <Text style={styles.faltypeyazikucukpopup2}>Aşk falına 100 Kredi karşılığında bakıyoruz. Hemen başlayalım mı?</Text>
                <View style={{alignSelf:'stretch',flex:1,flexDirection:'row',justifyContent:'space-around',backgroundColor:'white'}}>
                  <TouchableOpacity  onPress={() => {this.popupAsk.dismiss()}} style={{flex:1,height:40,flexGrow:1,borderRightWidth:1,justifyContent:'center'}}>
                    <Text style={{textAlign:'center'}}>Hayır</Text>
                  </TouchableOpacity>
                  <TouchableOpacity  onPress={() => {this.startAsk2()}} style={{flex:1,height:40,flexGrow:1,borderLeftWidth:1,justifyContent:'center'}}>
                    <Text style={{textAlign:'center',fontWeight:'bold'}}>BAŞLA</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Image>
        </PopupDialog>
        <PopupDialog
          dialogTitle={<DialogTitle title="DETAYLI KAHVE FALI" />}
          ref={(popupDialog) => { this.popupDetay = popupDialog; }}
          dialogStyle={{marginTop:-150}}
          dialogAnimation = { new SlideAnimation({ slideFrom: 'right' }) }
          width={'80%'}
          height={'50%'}
        >
          <Image style={{flex:1,width: null,height: null}} source={require('../static/images/detayli.jpg')}>
            <View style={{flex:1,alignSelf: 'stretch',backgroundColor:'rgba(114,0,218,0.6)'}}>

              <Text style={styles.faltypeyazipopup}>
                Ortaya çıkmayan detay kalmasın
              </Text>
              <Text style={styles.faltypeyazikucukpopup}>
                {'\u2022'} Hayatınızdaki her konuya dair detaylı yorumlar{'\n'}
                {'\u2022'} Ruh haliniz incelensin{'\n'}
                {'\u2022'} Sıra beklemek yok{'\n'}
              </Text>
              <View style={{position:'absolute',bottom:0,width:'100%'}}>
                <Text style={styles.faltypeyazikucukpopup2}>Detaylı Kahve Falına 150 Kredi karşılığında bakıyoruz. Hemen başlayalım mı?</Text>
                <View style={{alignSelf:'stretch',flex:1,flexDirection:'row',justifyContent:'space-around',backgroundColor:'white'}}>
                  <TouchableOpacity  onPress={() => {this.popupDetay.dismiss()}} style={{flex:1,height:40,flexGrow:1,borderRightWidth:1,justifyContent:'center'}}>
                    <Text style={{textAlign:'center'}}>Hayır</Text>
                  </TouchableOpacity>
                  <TouchableOpacity  onPress={() => {this.startDetay2()}} style={{flex:1,height:40,flexGrow:1,borderLeftWidth:1,justifyContent:'center'}}>
                    <Text style={{textAlign:'center',fontWeight:'bold'}}>BAŞLA</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Image>
        </PopupDialog>
        <PopupDialog
          dialogTitle={<DialogTitle title="EL FALI" />}
          ref={(popupDialog) => { this.popupEl = popupDialog; }}
          dialogStyle={{marginTop:-150}}
          dialogAnimation = { new SlideAnimation({ slideFrom: 'left' }) }
          width={'80%'}
          height={'50%'}
        >
          <Image style={{flex:1,width: null,height: null}} source={require('../static/images/elfali.jpg')}>
            <View style={{flex:1,alignSelf: 'stretch',backgroundColor:'rgba(0,185,241, 0.6)'}}>

              <Text style={styles.faltypeyazipopup}>
                Eliniz, kaderiniz...
              </Text>
              <Text style={styles.faltypeyazikucukpopup}>
                {'\u2022'} Hayatınızdaki her konuya dair detaylı yorumlar{'\n'}
                {'\u2022'} Ruh haliniz incelenir{'\n'}
                {'\u2022'} Sıra beklemek yok{'\n'}
              </Text>
              <Text style={styles.faltypeyazikucukpopup2}>Detaylı kahve falına 150 Kredi karşılığında bakıyoruz. Hemen başlayalım mı?</Text>
              <View style={{alignSelf:'stretch',flex:1,flexDirection:'row',justifyContent:'space-around',backgroundColor:'white',position:'absolute',bottom:0}}>
                <TouchableOpacity  onPress={() => {this.popupDetay.dismiss()}} style={{flex:1,height:40,flexGrow:1,borderRightWidth:1,justifyContent:'center'}}>
                  <Text style={{textAlign:'center'}}>Hayır</Text>
                </TouchableOpacity>
                <TouchableOpacity  onPress={() => {this.startDetay2()}} style={{flex:1,height:40,flexGrow:2,borderLeftWidth:1,justifyContent:'center'}}>
                  <Text style={{textAlign:'center',fontWeight:'bold'}}>BAŞLA</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Image>
        </PopupDialog>
      </Image>

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
    height:125,
    borderWidth:1,
    borderColor:'white'
  },
  faltypeimage:{
    alignItems:'center',
    alignSelf: 'stretch',
    width: null,
    height:123,
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
    textAlign: 'center',color:'white',fontWeight:'bold',fontSize:22
  },
  faltypeyazipopup:{
    textAlign: 'center',color:'white',fontWeight:'bold',fontSize:18,marginTop:20,marginBottom:15
  },
  faltypeyazikucuk:{
    textAlign: 'center',color:'white',fontSize:14
  },
  faltypeyazikucukpopup:{
    color:'white',fontSize:14,marginLeft:25
  },
  faltypeyazikucukpopup2:{
    flex:1,color:'white',fontSize:14,padding:15,fontWeight:'bold',backgroundColor:'rgba(0, 0, 0, 0.2)',alignSelf:'stretch',textAlign:'center'
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
  falciAvatar:{
    height:40,
    width:40,
    margin:10,
    borderRadius:20,
  }
});
