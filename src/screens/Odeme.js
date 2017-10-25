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
  Button,
  Dimensions,
  Linking,
  ActivityIndicator,
  Alert,
} from 'react-native';

import firebase from 'firebase';
import Backend from '../Backend';
import { NativeModules } from 'react-native'
const { InAppUtils } = NativeModules
import {AdMobRewarded} from 'react-native-admob'
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
      spinnerVisible:false
  };

}

  static navigationOptions = {
      title: 'Kredilerin',
      headerBackTitle:'Geri',
      tabBarLabel: 'Krediler',
       tabBarIcon: ({ tintColor }) => (
         <Icon name="database" color={tintColor} size={20} />
       ),
    };



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
            AdMobRewarded.showAd((error) => error && Alert.alert("Reklam Yok","Şu an için uygun reklam bulunmuyor, lütfen daha sonra tekrar dene."));
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

  componentDidMount() {

    Keyboard.dismiss()
    /*
    fetch('https://eventfluxbot.herokuapp.com/webhook/getCredits', {
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
      this.setState({credit:responseJson.credit,sharedWeek:responseJson.sharedToday})
     })
*/
     AdMobRewarded.setAdUnitID('ca-app-pub-6158146193525843/9355345612');
     //AdMobRewarded.setTestDeviceID('EMULATOR');

     AdMobRewarded.addEventListener('rewardedVideoDidRewardUser',
       (type, amount) => {Backend.addCredits(5,"reklam"); Alert.alert('Tebrikler','5 Kredi hesabınıza eklendi!',); this.props.userStore.increment(5) }
     );

     /*
     AdMobRewarded.addEventListener('rewardedVideoDidFailToLoad',
       (error) => alert('Reklam yüklenirken bir sorun oluştu.', error)
     );*/
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

     AdMobRewarded.requestAd((error) => error && console.log(error));
  }

  componentWillUnmount() {
    AdMobRewarded.removeAllListeners();
  }


  render() {


    return (

      <Image source={require('../static/images/splash4.png')} style={styles.container}>
      <Spinner visible={this.state.spinnerVisible} textStyle={{color: '#DDD'}} />
      <ScrollView>
        <View style={{padding:Dimensions.get('window').height/50,flexDirection:'row',justifyContent:'space-between',paddingLeft:0,marginBottom:15,alignSelf:'stretch'}}>
          <Image style={{height:40,width:40, borderRadius:20,marginRight:10,marginLeft:10}} source={require('../static/images/anneLogo3.png')}>
          </Image>
          <View style={{borderRadius:10,flexDirection:'row',backgroundColor:'rgba(0, 0, 0, 0.5)',padding:10,width:Dimensions.get('window').width-85}}>

            <Text  style={[styles.chattext]}>
          {'Mevcut Kredin:' + ' '}
        </Text>
        {this.props.userStore.userCredit!==null ? (
          <Text  style={[styles.chattext]}>
            {this.props.userStore.userCredit}
          </Text>
          ) : (
            <ActivityIndicator
              animating={true}
              size="small"
            />
          )}

            <Image source={require('../static/images/coins.png')} style={{width:15, height: 15,marginLeft:5,marginTop:5}}/>
          </View>

        </View>
        <View style={{marginBottom:20}}>
          <View style={{backgroundColor:'teal',padding:2,borderColor:'#c0c0c0'}} >
           <View style={{flexDirection:'row',justifyContent:'space-around',alignItems:'center'}}>
            <Image source={require('../static/images/coins.png')} style={{width:17, height: 17}}/>
            <Text style={{color:'white',fontSize:17,fontWeight:'bold'}}> Bedava Kredi Kazan! </Text>
            <Image source={require('../static/images/coins.png')} style={{width:17, height: 17}}/>
           </View>
          </View>
          <View style={{flexDirection:'row',flex:1,height:60}}>
            <TouchableOpacity onPress={() => {this.shareLinkWithShareDialog()}} style={{flex:1,padding:5,borderWidth:1,borderColor:'#dcdcdc',backgroundColor:'#f8f8ff',alignItems:'center'}}><Text style={{marginBottom:5,textAlign:'center',fontSize:16}}>Paylaş</Text><Icon name="facebook-official" color={'#3b5998'} size={22} /></TouchableOpacity>
            <TouchableOpacity onPress={() => {this.reklamGoster()}} style={{flex:1,padding:5,borderWidth:1,borderColor:'#dcdcdc',backgroundColor:'#f8f8ff',alignItems:'center'}}><Text style={{marginBottom:5,textAlign:'center',fontSize:16}}>Reklam İzle</Text><Icon name="video-camera" color={'#b22222'} size={22} /></TouchableOpacity>
            {this.props.userStore.user ? this.props.userStore.user.appRated||!this.props.userStore.user.timesUsed ? <View/> : <TouchableOpacity onPress={() => {this.rateApp()}} style={{flex:1,padding:5,borderWidth:1,borderColor:'#dcdcdc',backgroundColor:'#f8f8ff',alignItems:'center'}}><Text style={{marginBottom:5,textAlign:'center',fontSize:16}}>Puan Ver</Text><Icon name="star" color={'gold'} size={22} /></TouchableOpacity> : <View/> }
          </View>
        </View>
        <View style={{flex:1}}>
          <View style={{flex:1,backgroundColor:'teal',padding:2}}><Text style={{textAlign:'center',color:'white',fontSize:17,fontWeight:'bold'}}>Kredi Al</Text></View>
          <Image style={styles.container2} source={require('../static/images/hazine.jpg')}>
          <View style={{borderColor:'white',borderWidth:1}}>
            <View style={{flexDirection:'row'}}>
              <TouchableOpacity style={styles.faltypecontainer} onPress={() => {this.pay(100)}}>


                  <View style={{flex:1,alignSelf: 'stretch',alignItems:'center',justifyContent:'center',backgroundColor:'rgba(209,142,12, 0.8)'}}>

                    <Text style={styles.faltypeyazi}>
                      100 Kredi
                    </Text>
                    <Text style={styles.faltypeyazikucuk}>
                    +10 Kredi Hediye
                    </Text>
                    <View style={styles.corner}>
                      <Text style={[styles.label]}>
                        6.99
                      </Text>
                      <Icon name="try" color={'#2f4f4f'} size={14} />
                    </View>
                  </View>

              </TouchableOpacity>
              <TouchableOpacity style={styles.faltypecontainer} onPress={() => {this.pay(150)}}>

                  <View style={{flex:1,alignSelf: 'stretch',alignItems:'center',justifyContent:'center',backgroundColor:'rgba(249,50,12, 0.6)'}}>

                    <Text style={styles.faltypeyazi}>
                      150 Kredi
                    </Text>
                    <Text style={styles.faltypeyazikucuk}>
                    +15 Kredi Hediye
                    </Text>
                    <View style={styles.corner}>
                      <Text style={[styles.label]}>
                        9.99
                      </Text>
                      <Icon name="try" color={'#2f4f4f'} size={14} />
                    </View>
                  </View>

              </TouchableOpacity>
            </View>
            <View style={{flexDirection:'row'}}>
              <TouchableOpacity style={styles.faltypecontainer} onPress={() => {this.pay(250)}}>


                  <View style={{flex:1,alignSelf: 'stretch',alignItems:'center',justifyContent:'center',backgroundColor:'rgba(60,179,113, 0.8)'}}>
                    <View style={{padding:5,flexDirection:'row',position:'absolute',top:0,left:0}}>
                      <Icon name="star" color={'yellow'} size={30} />
                      <Text style={{color:'white'}}> Falseverlerin {"\n"} favorisi</Text>
                    </View>
                    <Text style={styles.faltypeyazi}>
                      250 Kredi
                    </Text>
                    <Text style={styles.faltypeyazikucuk}>
                    +50 Kredi Hediye
                    </Text>
                    <View style={styles.corner}>
                      <Text style={[styles.label]}>
                        13.99
                      </Text>
                      <Icon name="try" color={'#2f4f4f'} size={14} />
                    </View>
                  </View>

              </TouchableOpacity>
              </View>
            <View style={{flexDirection:'row'}}>
              <TouchableOpacity style={styles.faltypecontainer} onPress={() => {this.pay(500)}}>

                <View style={{padding:10,flex:1,alignSelf: 'stretch',alignItems:'center',justifyContent:'center',backgroundColor:'rgba(114,0,218, 0.6)'}}>

                  <Text style={styles.faltypeyazi}>
                    500 Kredi
                  </Text>


                  <Text style={styles.faltypeyazikucuk}>
                    +100 Kredi Hediye
                  </Text>
                  <View style={styles.corner}>
                    <Text style={[styles.label]}>
                      24.99
                    </Text>
                    <Icon name="try" color={'#2f4f4f'} size={14} />
                  </View>

                </View>

              </TouchableOpacity>
              <TouchableOpacity style={styles.faltypecontainer} onPress={() => {this.pay(1000)}}>

                <View style={{flex:1,alignSelf: 'stretch',alignItems:'center',justifyContent:'center',backgroundColor:'rgba(0,185,241, 0.8)'}}>

                  <Text style={styles.faltypeyazi}>
                    1000 Kredi

                  </Text>
                  <Text style={styles.faltypeyazikucuk}>
                    +250 Kredi Hediye
                  </Text>
                  <View style={styles.corner}>
                    <Text style={[styles.label]}>
                      44.99
                    </Text>
                    <Icon name="try" color={'#2f4f4f'} size={14} />
                  </View>
                </View>

              </TouchableOpacity>
            </View>
          </View>
          </Image>
        </View>


        </ScrollView>
      </Image>

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
    fontSize: 13,
    color:'#2f4f4f',
    fontWeight:'bold',
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
    textAlign: 'center',color:'white',fontWeight:'bold',fontSize:22
  },
  faltypeyazikucuk:{
    textAlign: 'center',color:'white',fontSize:14
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
  corner:{backgroundColor:'#dcdcdc',padding:5,flexDirection:'row',borderRadius:5,marginTop:5}
});
