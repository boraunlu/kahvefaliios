import React from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableHighlight,
  View,
  Image,
  Keyboard,
  ScrollView,
  ImageBackground,
  Button,
  Dimensions,
  Linking,
  ActivityIndicator,
  Alert,
  Share
} from 'react-native';
import PropTypes from 'prop-types';
import axios from 'axios';
import firebase from 'react-native-firebase';
import Backend from '../Backend';
import { NativeModules } from 'react-native'
const { InAppUtils } = NativeModules
//import {AdMobRewarded} from 'react-native-admob'
import { ShareDialog, ShareButton } from 'react-native-fbsdk';
import { observable } from 'mobx';
import { observer, inject } from 'mobx-react';
import Spinner from 'react-native-loading-spinner-overlay';
import Icon from 'react-native-vector-icons/FontAwesome';

const shareModel = {
         contentType: 'link',
          contentUrl: "https://facebook.com/kahvefalisohbeti",
  contentDescription: 'Kahve Falı Sohbeti!',
};
const shareLinkContent = {
  contentType: 'link',
  contentUrl: "http://www.falsohbeti.com/indir",
  contentDescription: 'Hemen mesaj atın, sohbet ederek falınıza bakalım !',
};

@inject("userStore")
@observer
export default class Odeme extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      credit:this.props.userStore.userCredit,
      sharedWeek:this.props.userStore.sharedWeek,
      shareLinkContent: shareLinkContent,
      spinnerVisible:false,
      dynamiclink:null
  };

}

  static navigationOptions = {
      title: 'Kredilerin',
      tabBarLabel: 'Krediler',
       tabBarIcon: ({ tintColor }) => (
         <Icon name="database" color={tintColor} size={20} />
       ),
    };

    advert = firebase.admob().rewarded('ca-app-pub-6158146193525843/9355345612');
   AdRequest = firebase.admob.AdRequest;
    request = new this.AdRequest();

    pay = (credit) => {
      this.setState({spinnerVisible:true})
      var products = [
         'com.grepsi.kahvefaliios.'+credit,
      ];
      InAppUtils.loadProducts(products, (error, products) => {
        if(error){this.setState({spinnerVisible:false})}
        else{
          var identifier = 'com.grepsi.kahvefaliios.'+credit
          InAppUtils.purchaseProduct(identifier, (error, response) => {
            this.setState({spinnerVisible:false})

             if(error){}
             else{
               if(response && response.productIdentifier) {
                 var credittoadd = 0;
                 switch (credit) {
                   case 100:
                       credittoadd = 110;
                       break;
                   case 150:
                       credittoadd = 165;
                       break;
                   case 250:
                       credittoadd = 300;
                       break;
                   case 500:
                       credittoadd = 600;
                       break;
                   case 1000:
                       credittoadd = 1250;
                       break;
                 }


                    Backend.addCredits(credittoadd,"kredisayfası")
                    this.props.userStore.increment(credittoadd)
                    alert('Teşekkürler!'+ credittoadd+' Kredin hesabına eklendi.')
               }
             }
          });
        }
      });

    }
    shareWithFriends = () => {
      Alert.alert(
        'Arkadaşınla Paylaş',
        'Senin davetinle uygulamayı indiren her arkadaşından 20 kredi kazan!',
        [
          {text: 'Tamam', onPress: () => {
            Share.share({
              message: this.state.dynamiclink,
              url: this.state.dynamiclink,
              title: 'Kahve Falı Sohbeti'
            }, {
              // Android only:
              dialogTitle: 'Kahve Falı Sohbeti',
              // iOS only:

            })
          }},
        ],
      )

    }

    shareLinkWithShareDialog = () => {
      if(this.props.userStore.sharedWeek==null){

      }
      else if (this.props.userStore.sharedWeek==true) {
        Alert.alert("Bir hafta içinde sadece 1 kere paylaşarak kredi kazanabilirsin")
      }
      else{
        var tmp = this;
        ShareDialog.canShow(this.state.shareLinkContent).then(
          function(canShow) {
            if (canShow) {
              Keyboard.dismiss()
              return ShareDialog.show(tmp.state.shareLinkContent);
            }
          }
        ).then((result) => {

            if (result.postId) {
              Backend.addCredits(15,"facebookshare");
              Backend.setSharedWeek()
              this.props.userStore.setSharedTrue();
              this.props.userStore.increment(15)
              setTimeout(function(){Alert.alert('Tebrikler','15 Kredi hesabınıza eklendi!')},1000)
            }
          },
          (error) => {
          }
        );
      }
    }

    reklamGoster = () => {
      Alert.alert(
        'Bedava Kredi',
        'Birazdan göstereceğimiz reklam videosunu sonuna kadar izleyerek kredi kazanabilirsin.',
        [
          {text: 'İstemiyorum', onPress: () => {}},
          {text: 'Tamam', onPress: () => {
            var loaded=  this.advert.isLoaded()
            if(loaded){
                this.advert.show()
            }
            else {

              Alert.alert("Reklam Hakkı","Bugünkü reklam izleme hakkınız tamamlanmıştır.")
            }

            //AdMobRewarded.showAd();
            //AdMobRewarded.requestAd();
        }},
        ],
      )

    }

    rateApp = () => {
      if(this.props.userStore.user.appRated){
        Alert.alert('Uyarı','Daha önce uygulamamıza puan ver')
      }
      else{
        Alert.alert(
          'Bedava Kredi',
          'Uygulamamıza güzel bir puan vererek veya yorum yazarak 20 Kredi kazanabilirsiniz. Krediniz puan verdikten ortalama 15 dakika sonra yüklenecektir.',
          [
            {text: 'İstemiyorum', onPress: () => {}},
            {text: 'Tamam', onPress: () => {
              Linking.canOpenURL('itms-apps://itunes.apple.com/tr/app/kahve-fali-sohbeti/id1231962763').then(supported => {
                if(supported){
                  Linking.openURL('itms-apps://itunes.apple.com/tr/app/kahve-fali-sohbeti/id1231962763');
                  Backend.appRated();
                  this.props.userStore.setAppRatedTrue()
                }
              }, (err) => console.log(err));
            }},
          ],
        )
      }
    }

  commentyaptir = () => {
    Alert.alert(
      'Bedava Kredi',
      'Sosyal panodaki kahve fallarından birine yorum yazarak 15 Kredi kazanabilirsiniz!',
      [
        {text: 'İstemiyorum', onPress: () => {}},
        {text: 'Tamam', onPress: () => {
                  this.props.navigation.navigate('Social')
        }},
      ],
    )
  }

  componentDidMount() {

    Keyboard.dismiss()

    this.advert.loadAd(this.request.build());
    this.advert.on('onAdLoaded', () => {
      //console.log('Advert ready to show.');

    });

    this.advert.on('onRewarded', (event) => {
      console.log('The user watched the entire video and will now be rewarded!', event);
      Backend.addCredits(5,"reklam"); setTimeout(function(){Alert.alert('Tebrikler','5 Kredi hesabınıza eklendi!')},1000); this.props.userStore.increment(5);
      this.advert.loadAd(this.request.build());
    });

    const link =
    new firebase.links.DynamicLink('http://www.falsohbeti.com/indir?senderID='+Backend.getUid(), 'qwue3.app.goo.gl')
    .android.setPackageName('com.kahvefaliapp')
      .ios.setBundleId('com.grepsi.kahvefaliios');


    firebase.links()
      .createShortDynamicLink(link,'SHORT')
      .then((url) => {
        this.setState({dynamiclink:url})
    });
     /*AdMobRewarded.setAdUnitID('ca-app-pub-6158146193525843/9355345612');


     AdMobRewarded.addEventListener('rewardedVideoDidRewardUser',
       (type, amount) => {Backend.addCredits(5,"reklam"); Alert.alert('Tebrikler','5 Kredi hesabınıza eklendi!',); this.props.userStore.increment(5) }
     );*/

     /*
     AdMobRewarded.addEventListener('rewardedVideoDidFailToLoad',
       (error) => alert('Reklam yüklenirken bir sorun oluştu.', error)
     );*/

     /*
     AdMobRewarded.addEventListener('rewardedVideoDidOpen',
       () => {}
     );
     AdMobRewarded.addEventListener('rewardedVideoDidClose',
       () => {
         AdMobRewarded.requestAd((error) => error && console.log(error));
       }
     );
     AdMobRewarded.addEventListener('rewardedVideoWillLeaveApplication',
       () => {}
     );

     AdMobRewarded.requestAd((error) => error && console.log(error));*/
  }

  componentWillUnmount() {
    //AdMobRewarded.removeAllListeners();
  }


  render() {


    return (

      <ImageBackground source={require('../static/images/newImages/BG.png')} style={styles.container}>
      <ScrollView style={{flex:1,width:'100%',padding:15,paddingTop:0}}>

                {/* Mevcut Kredi */}


                <View style={{paddingRight:15,height: 30,borderRadius: 15,position:'absolute',top:20,flexDirection:'row',justifyContent:'flex-start'}}>
                     <TouchableOpacity  onPress={() => {this.props.navigation.navigate("Odeme")}} style={{flexDirection:'row'}}>
                     <View style={{width:30,height: 30,borderRadius: 15,backgroundColor: 'white',flexDirection:'row',justifyContent:'center',alignItems:'center',zIndex:3}}>


                           <Image source={require('../static/images/profile/coinsCopy.png')} style={{height:16.2,width:18}}/>




                     </View>

                     <View style={{height:24,paddingRight:18,paddingLeft:37,paddingBottom:2,borderRadius:12,position:'relative',right:29,top:3,backgroundColor:'rgba(0,0,0,0.18)',flexDirection:'row',justifyContent:'center',alignItems:'center'}}>

                           <Text style={{textAlign:'left',fontWeight:'bold',fontFamily:'SourceSansPro-Bold',color:'rgb(255,255,255)',fontSize:12}}>
                           Mevcut Kredin:</Text>
                           <Text style={{fontSize:14,fontWeight:'bold',fontFamily:'SourceSansPro-Bold',color:'rgb(255,255,255)',position:'relative',left:7}}>

                           &nbsp;
                           {this.props.userStore.userCredit}
                           </Text>


                     </View>
              </TouchableOpacity>
          </View>

          {/* Arkadaşınla paylaş   */}


          <View style={{position:'absolute',top:10,right:12,  height: 56,justifyContent:'space-between',
                 borderRadius: 6,
                 backgroundColor: "rgba(0, 0, 0, 0.25)"}}>
            <TouchableOpacity onPress={() => {this.shareWithFriends()}} style={{flex:1,padding:5,backgroundColor:'transparent',justifyContent:'center'}}>
            <Icon style={{alignSelf:'center'}}name="users" color={'#ffffff'} size={22} />
            <Text style={{marginBottom:5, fontFamily: "SourceSansPro-Italic",
                  fontSize: 10,
                  fontWeight: "normal",
                  fontStyle: "italic",
                  letterSpacing: 0,
                  textAlign: "center",
                  color: "#ffffff"}}>Arkadaşınla Paylaş{'\n'}20 Kredi Kazan!</Text></TouchableOpacity>

          </View>



      {/*      Bedava Kredi kazan div      */}




        <View style={{marginBottom:0,marginTop:75}}>

          <View style={{flexDirection:'row',flex:1,  height: 56,justifyContent:'space-between',
                 borderRadius: 6,
                 backgroundColor: "rgba(0, 0, 0, 0.25)"}}>


           <View style={{flex:2,height: 56,justifyContent:'center',paddingLeft:30}}>

                <Text style={{ opacity: 0.7,
                               fontFamily: "SourceSansPro-BoldItalic",
                               fontSize: 12,
                               fontWeight: "bold",
                               fontStyle: "italic",
                               letterSpacing: 0,
                               textAlign: "left",
                               color: "#ffffff"}}>HEMEN BEDAVA{'\n'}KREDİ KAZAN!</Text>

            </View>

            <TouchableOpacity onPress={() => {this.shareLinkWithShareDialog()}}
            style={{flex:1,flexDirection:"column-reverse", padding:5,backgroundColor:'transparent',alignItems:'center'}}>
            <Text style={{marginBottom:5, fontFamily: "SourceSansPro-Italic",
                fontWeight: "normal",
                fontSize: 10,
                fontStyle: "italic",
                letterSpacing: 0,
                textAlign: "left",
                textDecorationLine:'underline',

                color: "#ffffff"}}>Paylaş</Text>
            <Image source={require('../static/images/krediler/facebookAppLogo.png')} style={{width:22, height: 23}}/></TouchableOpacity>
            <View style={{ width: 2,height: 20,opacity: 0.2,backgroundColor: "#ffffff",marginTop:20}}></View>
            <TouchableOpacity onPress={() => {this.reklamGoster()}}
            style={{flex:1,padding:5,backgroundColor:'transparent',alignItems:'center',flexDirection:"column-reverse"}}>
            <Text style={{marginBottom:5, fontFamily: "SourceSansPro-Italic",
                  fontSize: 10,
                  fontWeight: "normal",
                  fontStyle: "italic",
                  letterSpacing: 0,
                  textAlign: "left",
                  textDecorationLine:'underline',

                  color: "#ffffff"}}>Reklam izle</Text>
            <Image source={require('../static/images/krediler/shape.png')} style={{width:23.6, height: 22}}/></TouchableOpacity>
            {this.props.userStore.user ? this.props.userStore.user.appRated||!this.props.userStore.user.timesUsed ? <View/> : <TouchableOpacity onPress={() => {this.rateApp()}} style={{flex:1,padding:5,backgroundColor:'transparent',alignItems:'center',flexDirection:"column-reverse"}}>
            <View style={{ width: 2,height: 20,opacity: 0.2,backgroundColor: "#ffffff",position:'absolute',left:0,top:20}}></View>
            <Text style={{marginBottom:5, fontFamily: "SourceSansPro-Italic",
                  fontSize: 10,
                  fontWeight: "normal",
                  fontStyle: "italic",
                  letterSpacing: 0,
                  textAlign: "left",
                  textDecorationLine:'underline',

                 color: "#ffffff"}}>Puan Ver</Text><Icon name="star" color={'#ffffff'} size={22} /></TouchableOpacity> : <View/> }
          </View>
        </View>
        <View style={{flex:1}}>
          <View style={styles.container2}>
          <View style={{}}>
            <View style={{flexDirection:'column'}}>



                  <TouchableOpacity style={[styles.faltypecontainer, { flexDirection: 'row-reverse', alignSelf: 'stretch', alignItems: 'center', justifyContent: 'center' }]} onPress={() => { this.pay(100) }}>


                    <View style={{ flex: 1, flexDirection: 'row', alignSelf: 'stretch', zIndex: 6, position: 'absolute', left: 0, right: 0, alignItems: 'center', justifyContent: 'center', borderRadius: 4, backgroundColor: 'transparent' }}>


                      <View style={{ flex: 1, height: 80, justifyContent: 'center', alignItems: 'center', width: 35, height: 32 }}>
                        <Image source={require("../static/images/krediler/coinsCopy2.png")} />

                           </View>
                           <View style={{ flex: 2, height: 80, justifyContent: 'center', alignItems: 'center' }}>

                             <Text style={styles.faltypeyazi}>
                               100 Kredi
                                         </Text>
                             <Text style={styles.faltypeyazikucuk}>
                               +10 Kredi Hediye
                                         </Text>
                           </View>

                           <View style={{ flex: 1, height: 80, justifyContent: 'center', alignItems: 'flex-start',marginLeft:15  }}>

                             <View style={[styles.corner, {}]}>
                               <Text style={[styles.label]}>
                                 8.99 TL
                                           </Text>
                             </View>

                           </View>
                         </View>


                         <View style={{
                           flex: 3, position: 'relative', zIndex: 3, alignSelf: 'flex-end', alignItems: 'center', justifyContent: 'center', height: 80,
                           borderRadius: 4,
                           backgroundColor: "#e6d5a0"
                         }}>
                         </View>
                         <View style={{
                           flex: 1, position: 'relative', alignItems: 'center', justifyContent: 'center', height: 80,
                           borderRadius: 4,
                           backgroundColor: "transparent"
                         }}>
                         </View>



                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.faltypecontainer, { flexDirection: 'row', alignSelf: 'stretch', alignItems: 'center', justifyContent: 'center' }]} onPress={() => { this.pay(150) }}>


                    <View style={{ flex: 1, flexDirection: 'row-reverse', alignSelf: 'stretch', zIndex: 6, position: 'absolute', left: 0, right: 0, alignItems: 'center', justifyContent: 'center', borderRadius: 4, backgroundColor: 'transparent' }}>


                      <View style={{ flex: 1, height: 80, justifyContent: 'center', alignItems: 'center', width: 35, height: 32 }}>
                        <Image source={require("../static/images/krediler/coinsCopy3.png")} />

                           </View>
                           <View style={{ flex: 2, height: 80, justifyContent: 'center', alignItems: 'center' }}>

                             <Text style={styles.faltypeyazi}>
                               150 Kredi
                                         </Text>
                             <Text style={styles.faltypeyazikucuk}>
                               +15 Kredi Hediye
                                         </Text>
                           </View>

                           <View style={{ flex: 1, height: 80, justifyContent: 'center', alignItems: 'flex-end',marginRight:15  }}>

                             <View style={[styles.corner, {}]}>
                               <Text style={[styles.label]}>
                                 12.99 TL
                                           </Text>
                             </View>

                           </View>
                         </View>


                         <View style={{
                           flex: 3, position: 'relative', zIndex: 3, alignSelf: 'flex-end', alignItems: 'center', justifyContent: 'center', height: 80,
                           borderRadius: 4,
                           backgroundColor: "#e4b05c"
                         }}>
                         </View>
                         <View style={{
                           flex: 1, position: 'relative', alignItems: 'center', justifyContent: 'center', height: 80,
                           borderRadius: 4,
                           backgroundColor: "transparent"
                         }}>
                         </View>



                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.faltypecontainer, { flexDirection: 'row-reverse', alignSelf: 'stretch', alignItems: 'center', justifyContent: 'center' }]} onPress={() => { this.pay(250) }}>


                    <View style={{ flex: 1, flexDirection: 'row', alignSelf: 'stretch', zIndex: 6, position: 'absolute', left: 0, right: 0, alignItems: 'center', justifyContent: 'center', borderRadius: 4, backgroundColor: 'transparent' }}>


                      <View style={{ flex: 1, height: 80, justifyContent: 'center', alignItems: 'center', width: 35, height: 32 }}>
                        <Image source={require("../static/images/krediler/coinsCopy2.png")} />
                        <Text style={{ fontFamily: "SourceSansPro-BoldItalic",
                              fontSize: 10,
                              fontWeight: "bold",
                              fontStyle: "italic",
                              letterSpacing: 0,
                              textAlign: "left",
                              color: "#ffd949"
                              }}>Favori Kredi</Text>
                           </View>
                           <View style={{ flex: 2, height: 80, justifyContent: 'center', alignItems: 'center' }}>

                             <Text style={styles.faltypeyazi}>
                               250 Kredi
                                         </Text>
                             <Text style={styles.faltypeyazikucuk}>
                               +50 Kredi Hediye
                                         </Text>
                           </View>

                           <View style={{ flex: 1, height: 80, justifyContent: 'center', alignItems: 'flex-start',marginLeft:15   }}>

                             <View style={[styles.corner, {}]}>
                               <Text style={[styles.label]}>
                                 17.99 TL
                                           </Text>
                             </View>

                           </View>
                         </View>


                         <View style={{
                           flex: 3, position: 'relative', zIndex: 3, alignSelf: 'flex-end', alignItems: 'center', justifyContent: 'center', height: 80,
                           borderRadius: 4,
                           backgroundColor: "#bc4576"
                         }}>
                         </View>
                         <View style={{
                           flex: 1, position: 'relative', alignItems: 'center', justifyContent: 'center', height: 80,
                           borderRadius: 4,
                           backgroundColor: "transparent"
                         }}>
                         </View>



                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.faltypecontainer, { flexDirection: 'row', alignSelf: 'stretch', alignItems: 'center', justifyContent: 'center' }]} onPress={() => { this.pay(500) }}>


                    <View style={{ flex: 1, flexDirection: 'row-reverse', alignSelf: 'stretch', zIndex: 6, position: 'absolute', left: 0, right: 0, alignItems: 'center', justifyContent: 'center', borderRadius: 4, backgroundColor: 'transparent' }}>


                      <View style={{ flex: 1, height: 80, justifyContent: 'center', alignItems: 'center', width: 35, height: 32 }}>
                        <Image source={require("../static/images/krediler/coinsCopy3.png")} />

                           </View>
                           <View style={{ flex: 2, height: 80, justifyContent: 'center', alignItems: 'center' }}>

                             <Text style={styles.faltypeyazi}>
                               500 Kredi
                                         </Text>
                             <Text style={styles.faltypeyazikucuk}>
                               +100 Kredi Hediye
                                         </Text>
                           </View>

                           <View style={{ flex: 1, height: 80, justifyContent: 'center',alignItems: 'flex-end',marginRight:15  }}>

                             <View style={[styles.corner, {}]}>
                               <Text style={[styles.label]}>
                                 29.99 TL
                                           </Text>
                             </View>

                           </View>
                         </View>


                         <View style={{
                           flex: 3, position: 'relative', zIndex: 3, alignSelf: 'flex-end', alignItems: 'center', justifyContent: 'center', height: 80,
                           borderRadius: 4,
                           backgroundColor: "#8975cd"
                         }}>
                         </View>
                         <View style={{
                           flex: 1, position: 'relative', alignItems: 'center', justifyContent: 'center', height: 80,
                           borderRadius: 4,
                           backgroundColor: "transparent"
                         }}>
                         </View>



                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.faltypecontainer, { flexDirection: 'row-reverse', alignSelf: 'stretch', alignItems: 'center', justifyContent: 'center' }]} onPress={() => { this.pay(1000) }}>


                    <View style={{ flex: 1, flexDirection: 'row', alignSelf: 'stretch', zIndex: 6, position: 'absolute', left: 0, right: 0, alignItems: 'center', justifyContent: 'center', borderRadius: 4, backgroundColor: 'transparent' }}>


                      <View style={{ flex: 1, height: 80, justifyContent: 'center', alignItems: 'center', width: 35, height: 32 }}>
                        <Image source={require("../static/images/krediler/coinsCopy2.png")} />

                           </View>
                           <View style={{ flex: 2, height: 80, justifyContent: 'center', alignItems: 'center' }}>

                             <Text style={styles.faltypeyazi}>
                               1000 Kredi
                                         </Text>
                             <Text style={styles.faltypeyazikucuk}>
                               +250 Kredi Hediye
                                         </Text>
                           </View>

                           <View style={{ flex: 1, height: 80, justifyContent: 'center', alignItems: 'flex-start',marginLeft:15   }}>

                             <View style={[styles.corner, {}]}>
                               <Text style={[styles.label]}>
                                 54.99 TL
                                           </Text>
                             </View>

                           </View>
                         </View>


                         <View style={{
                           flex: 3, position: 'relative', zIndex: 3, alignSelf: 'flex-end', alignItems: 'center', justifyContent: 'center', height: 80,
                           borderRadius: 4,
                           backgroundColor: 'rgb(103,104,145)'
                         }}>
                         </View>
                         <View style={{
                           flex: 1, position: 'relative', alignItems: 'center', justifyContent: 'center', height: 80,
                           borderRadius: 4,
                           backgroundColor: "transparent"
                         }}>
                         </View>



                  </TouchableOpacity>


            </View>
          </View>
          </View>
        </View>


        </ScrollView>
      </ImageBackground>

    );
  }
}




const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignSelf: 'stretch',
    width: null,
  },
  container2: {
    flex: 1,
    // remove width and height to override fixed static size
    width: null,
    height: null,
  },
  buyButton:{
    color:'green'
  },
  productRow:{
   margin:5,padding:10,backgroundColor:'rgba(0, 0, 0, 0.7)',flexDirection:'row',justifyContent:'space-between',paddingBottom:10,paddingTop:10, borderWidth:1,borderColor:'gainsboro'
  },
  currentCreditContainer:{
   marginTop:10,backgroundColor:'rgba(0, 0, 0, 0.5)',flexDirection:'row',justifyContent:'center',paddingBottom:10,paddingTop:10,
 },
 productsContainer:{
   margin:5,flexDirection:'column',justifyContent:'center',paddingBottom:10,paddingTop:10, borderColor:'gray',flex:1
 },
  label: {
    fontFamily: "SourceSansPro-Regular",
    fontSize: 14,
    fontWeight: "bold",
    fontStyle: "normal",
    letterSpacing: 0,

    color: "#ffffff",
    textAlign:'center'
  },
  chattext:{
    fontSize:16,
    color:'white'
  },
  label2:{
    fontSize: 24,
    color:'white',
    textAlign:'center'
  },
  headline:{
    fontSize: 30,
    color:'white',
    textAlign:'center'
  },
  underlabel:{
    color:'white'
  },
  coin:{
    height:15,
    width:15,
    marginLeft:5,
    marginTop:5
  },
  textInput: {
    height: 40,
    marginLeft: 15,
  },
  descContainer:{
    margin:15,
  },
  description:{
    color:'white',
    fontSize:20,
    fontWeight:'bold',
  },
  description2:{
    color:'white',
    fontSize:20,
    fontWeight:'normal'
  },
  faltypeyazi:{
    textAlign: 'center',color:'white',fontWeight:'bold', fontFamily: "SourceSansPro-Regular",
    fontSize: 22,
    fontWeight: "bold",
    fontStyle: "normal",
    letterSpacing: 0,
  },
  faltypeyazikucuk:{
    textAlign: 'center',color:'white',fontSize:14
  },
  faltypecontainer:{
    flex:1,
    height: 80,
  borderRadius: 4,
  backgroundColor: "#ffffff",
  marginTop:15
  },
  faltypeimage:{
    alignItems:'center',
    alignSelf: 'stretch',
    width: null,
    height:123,
    flexDirection:'column-reverse'
  },
  corner:{ width: 78,
    margin:-10,
    borderRadius: 6,
    backgroundColor: "rgba(0, 0, 0, 0.2)",
    padding:8,alignItems:'center',

    justifyContent:'center'}
});
