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
          var identifier = products[0].identifier
          InAppUtils.purchaseProduct(identifier, (error, response) => {
            this.setState({spinnerVisible:false})
             // NOTE for v3.0: User can cancel the payment which will be availble as error object here.
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
                  fetch('https://eventfluxbot.herokuapp.com/webhook/addCredits', {
                    method: 'POST',
                    headers: {
                      'Accept': 'application/json',
                      'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                      uid: Backend.getUid(),
                      credit: credittoadd
                    })
                  })
                  .then((response) => {
                    alert('Teşekkürler!'+ credit+' Kredin hesabına eklendi.')

                    this.props.userStore.increment(credittoadd)
                  });
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
              Backend.addCredits(20);
              Backend.setSharedWeek()
              this.setState({sharedWeek:true});
              this.props.userStore.increment(20)
              setTimeout(function(){Alert.alert('Tebrikler','20 Kredi hesabınıza eklendi!')},1000)
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
            AdMobRewarded.showAd((error) => error && alert("Şu an için uygun reklam bulunmuyor, lütfen daha sonra tekrar dene."));
          }},
        ],
      )

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
       (type, amount) => {Backend.addCredits(10); Alert.alert('Tebrikler','10 Kredi hesabınıza eklendi!',); this.props.userStore.increment(10) }
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
          <View style={{backgroundColor:'#dcdcdc',borderTopWidth:1,borderBottomWidth:1,borderColor:'#c0c0c0'}} >
           <View style={{flexDirection:'row',justifyContent:'space-around',height:40,alignItems:'center'}}>
            <Image source={require('../static/images/coins.png')} style={{width:20, height: 20}}/>
            <Text style={{color:'#2f4f4f',fontSize:20,fontWeight:'bold'}}> Bedava Kredi Kazan! </Text>
            <Image source={require('../static/images/coins.png')} style={{width:20, height: 20}}/>
           </View>
          </View>
          <View style={{flexDirection:'row',flex:1,height:60}}>
            <TouchableOpacity onPress={() => {this.shareLinkWithShareDialog()}} style={{flex:1,padding:5,borderWidth:1,borderColor:'#dcdcdc',backgroundColor:'#f8f8ff',alignItems:'center'}}><Text style={{textAlign:'center',fontSize:18}}>Sayfayı Paylaş</Text><Icon name="facebook-official" color={'#3b5998'} size={24} /></TouchableOpacity>
            <TouchableOpacity onPress={() => {this.reklamGoster()}} style={{flex:1,padding:5,borderWidth:1,borderColor:'#dcdcdc',backgroundColor:'#f8f8ff',alignItems:'center'}}><Text style={{textAlign:'center',fontSize:18}}>Reklam İzle</Text><Icon name="video-camera" color={'#b22222'} size={24} /></TouchableOpacity>
          </View>
        </View>
        <View style={{flex:1}}>
          <View style={{flex:1,backgroundColor:'#dcdcdc',padding:2}}><Text style={{textAlign:'center',color:'#2f4f4f',fontSize:17,fontWeight:'bold'}}>Kredi Al</Text></View>
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
