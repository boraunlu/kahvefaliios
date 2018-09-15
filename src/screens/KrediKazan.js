import React, {

} from 'react';
import {
  StyleSheet,
  Text,
  View,
  Image,
  ScrollView,
  ImageBackground,
  TouchableOpacity,
  Button,
  Linking,
  Alert,
  Share
} from 'react-native';

import firebase from 'react-native-firebase';
import Backend from '../Backend';
import { NavigationActions } from 'react-navigation'
import Icon from 'react-native-vector-icons/FontAwesome';
import PropTypes from 'prop-types';
import { ShareDialog, ShareButton } from 'react-native-fbsdk';
import { observable } from 'mobx';
import { observer, inject } from 'mobx-react';
import Spinner from 'react-native-loading-spinner-overlay';

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
export default class KrediKazan extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      shareLinkContent: shareLinkContent,
      spinnerVisible:false,
      dynamiclink:null
  };
}

  static navigationOptions = {
      title: 'Kredi Kazan',
    };

    advert = firebase.admob().rewarded('ca-app-pub-6158146193525843/9355345612');
   AdRequest = firebase.admob.AdRequest;
    request = new this.AdRequest();

    shareWithFriends = () => {
      if(this.state.dynamiclink){
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
      else {
        const link =
        new firebase.links.DynamicLink('http://www.falsohbeti.com/indir?senderID='+Backend.getUid(), 'qwue3.app.goo.gl')
        .android.setPackageName('com.kahvefaliapp')
          .ios.setBundleId('com.grepsi.kahvefaliios');


        firebase.links()
          .createShortDynamicLink(link,'SHORT')
          .then((url) => {
            Alert.alert(
              'Arkadaşınla Paylaş',
              'Senin davetinle uygulamayı indiren her arkadaşından 20 kredi kazan!',
              [
                {text: 'Tamam', onPress: () => {
                  Share.share({
                    message: url,
                    url: url,
                    title: 'Kahve Falı Sohbeti'
                  }, {
                    // Android only:
                    dialogTitle: 'Kahve Falı Sohbeti',
                    // iOS only:

                  })
                }},
              ],
            )
        });
      }

    }

    shareLinkWithShareDialog = () => {
      if(this.props.userStore.sharedWeek==null){
        Alert.alert("Bir hafta içinde sadece 1 kere paylaşarak kredi kazanabilirsin")
      }
      else if (this.props.userStore.sharedWeek==true) {
        Alert.alert("Bir hafta içinde sadece 1 kere paylaşarak kredi kazanabilirsin")
      }
      else{
        var tmp = this;
        var shareLinkContent={
          contentType: 'link',
          contentUrl: "http://www.falsohbeti.com/indir",
          contentDescription: 'Hemen mesaj atın, sohbet ederek falınıza bakalım !',
        };
        ShareDialog.canShow(shareLinkContent).then(
          function(canShow) {
            if (canShow) {
              Keyboard.dismiss()
              return ShareDialog.show(shareLinkContent);
            }
            else(alert("asd"))
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
        Alert.alert('Uyarı','Uygulamamıza puan vererek sadece bir kere kredi kazanabilirsin')
      }
      else{
        Alert.alert(
          'Bedava Kredi',
          'Uygulamamıza güzel bir puan vererek veya yorum yazarak 15 Kredi kazanabilirsiniz. Krediniz puan verdikten ortalama 15 dakika sonra yüklenecektir.',
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
  }

  componentWillUnmount() {


  }


  render() {


    return (

      <ImageBackground source={require('../static/images/newImages/BG.png')} style={styles.container}>

        <ScrollView style={{padding:30,flex:1,width:'100%'}}>

          <View style={styles.row}>
            <TouchableOpacity onPress={() => {this.props.navigation.navigate('FalPuan')}} style={{flexDirection:'row',alignItems:'center',flex:1,padding:5,backgroundColor:'transparent',justifyContent:'center'}}>
              <Icon style={{alignSelf:'center'}}name="heart" color={'#ffffff'} size={22} />
              <View style={{ width: 2,height: 20,opacity: 0.2,backgroundColor: "#ffffff",marginLeft:5,marginRight:5}}></View>
              <View style={{flex:2}}><Text style={styles.textStyle}>Fallara yorum yap, Kredi ve Hediyeler Kazan!</Text></View>
              <View style={{ width: 2,height: 20,opacity: 0.2,backgroundColor: "#ffffff",marginLeft:5,marginRight:5}}></View>
              <Text style={styles.textStyle}>50 Kredi</Text>
            </TouchableOpacity>

          </View>

          <View style={styles.row}>
            <TouchableOpacity onPress={() => {this.shareWithFriends()}} style={{flexDirection:'row',alignItems:'center',flex:1,padding:5,backgroundColor:'transparent',justifyContent:'center'}}>
             <Icon style={{alignSelf:'center'}}name="users" color={'#ffffff'} size={22} />
              <View style={{ width: 2,height: 20,opacity: 0.2,backgroundColor: "#ffffff",marginLeft:5,marginRight:5}}></View>
              <View style={{flex:2}}><Text style={styles.textStyle}>Arkadaşınla Paylaş, İndirsin, Kredi Kazan!</Text></View>
              <View style={{ width: 2,height: 20,opacity: 0.2,backgroundColor: "#ffffff",marginLeft:5,marginRight:5}}></View>
              <Text style={styles.textStyle}>20 Kredi</Text>
            </TouchableOpacity>

          </View>



          <View style={styles.row}>
            <TouchableOpacity onPress={() => {this.reklamGoster()}} style={{flexDirection:'row',alignItems:'center',flex:1,padding:5,backgroundColor:'transparent',justifyContent:'center'}}>
              <Image source={require('../static/images/krediler/shape.png')} style={{width:23.6, height: 22}}/>
              <View style={{ width: 2,height: 20,opacity: 0.2,backgroundColor: "#ffffff",marginLeft:5,marginRight:5}}></View>
              <View style={{flex:2}}><Text style={styles.textStyle}>Günde iki kere reklam izle</Text></View>
              <View style={{ width: 2,height: 20,opacity: 0.2,backgroundColor: "#ffffff",marginLeft:5,marginRight:5}}></View>
              <Text style={styles.textStyle}>5+5 Kredi</Text>
            </TouchableOpacity>

          </View>

          <View style={styles.row}>
            <TouchableOpacity onPress={() => {this.rateApp()}} style={{flexDirection:'row',alignItems:'center',flex:1,padding:5,backgroundColor:'transparent',justifyContent:'center'}}>
              <Icon name="star" color={'#ffffff'} size={22} />
              <View style={{ width: 2,height: 20,opacity: 0.2,backgroundColor: "#ffffff",marginLeft:5,marginRight:5}}></View>
              <View style={{flex:2}}><Text style={styles.textStyle}>Uygulamaya puan ver</Text></View>
              <View style={{ width: 2,height: 20,opacity: 0.2,backgroundColor: "#ffffff",marginLeft:5,marginRight:5}}></View>
              <Text style={styles.textStyle}>15 Kredi</Text>
            </TouchableOpacity>

          </View>
          <View style={styles.row}>
            <TouchableOpacity onPress={() => {this.props.navigation.navigate('Oneri')}} style={{flexDirection:'row',alignItems:'center',flex:1,padding:5,backgroundColor:'transparent',justifyContent:'center'}}>
              <Icon style={{alignSelf:'center'}}name="comments" color={'#ffffff'} size={22} />
              <View style={{ width: 2,height: 20,opacity: 0.2,backgroundColor: "#ffffff",marginLeft:5,marginRight:5}}></View>
              <View style={{flex:2}}><Text style={styles.textStyle}>Fikir ver, beğenilirse kredi kazan!</Text></View>
              <View style={{ width: 2,height: 20,opacity: 0.2,backgroundColor: "#ffffff",marginLeft:5,marginRight:5}}></View>
              <Text style={styles.textStyle}>30 Kredi</Text>
            </TouchableOpacity>

          </View>

        </ScrollView>
      </ImageBackground>

    );
  }
}




const styles = StyleSheet.create({

  container: {
    flex: 1,
    width:'100%',
    alignSelf: 'stretch',
    alignItems:'center',
    padding:0,
    paddingTop:0,
    paddingBottom:0

  },
  textStyle:{marginBottom:5, fontFamily: "SourceSansPro-Italic",
        fontSize: 14,
        fontWeight: "normal",
        fontStyle: "italic",
        letterSpacing: 0,
        textAlign: "center",
        color: "#ffffff"},
  row:{ height: 56,justifyContent:'space-between',
         borderRadius: 6,marginBottom:20,
         backgroundColor: "rgba(0, 0, 0, 0.6)",paddingLeft:5}

});
