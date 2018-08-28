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
  Button
} from 'react-native';

import firebase from 'react-native-firebase';
import Backend from '../Backend';
import { NavigationActions } from 'react-navigation'
import Icon from 'react-native-vector-icons/FontAwesome';
import PropTypes from 'prop-types';

export default class FalBakKazan extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      text:'Buraya Önerilerinizi ve Şikayetlerinizi yazabilirsiniz. Teşekkür ederiz!'
  };
}

  static navigationOptions = {
      header:null
    };





  componentDidMount() {

  }

  componentWillUnmount() {


  }


  render() {


    return (

      <ImageBackground source={require('../static/images/newImages/BG.png')} style={styles.container}>

        <ScrollView style={{padding:30,flex:1,width:'100%'}}>

          <Text style={{fontSize:30,color:'white',textAlign:'center',marginBottom:50,fontFamily:'SourceSansPro-Bold'}}>🎁 FAL BAK, KAZAN! 🎁</Text>
          <View style={{flexDirection:'row',alignSelf:'center',marginBottom:15,padding:10}}>
            <View style={{height:26,width:26,borderRadius:13,backgroundColor:'rgb( 236 ,196 ,75)',marginRight:5,justifyContent:'center'}}><Text style={{backgroundColor:'transparent',color:'rgb(36, 20, 102)',fontFamily:'SourceSansPro-Bold',fontWeight:'bold',textAlign:'center'}}>1</Text></View>
            <Text style={{fontSize:20,color:'white',textAlign:'center',fontFamily:'SourceSansPro-Bold'}}>FALLARA YORUM YAP, YETENEĞİNİ KONUŞTUR 🔥</Text>
            <View style={{width:31,height:2}}></View>
          </View>
          <View style={{alignSelf:'center',marginBottom:15}}>
              <Icon name="arrow-down" color={'rgb( 236 ,196 ,75)'} size={35} />
          </View>

          <View style={{flexDirection:'row',alignSelf:'center',marginBottom:15,padding:10}}>
            <View style={{height:26,width:26,borderRadius:13,backgroundColor:'rgb( 236 ,196 ,75)',marginRight:5,justifyContent:'center'}}><Text style={{backgroundColor:'transparent',color:'rgb(36, 20, 102)',fontFamily:'SourceSansPro-Bold',fontWeight:'bold',textAlign:'center'}}>2</Text></View>
            <Text style={{fontSize:20,color:'white',textAlign:'center',fontFamily:'SourceSansPro-Bold'}}>BEĞENİ KAZANARAK FAL PUAN BİRİKTİR ❤️</Text>
            <View style={{width:31,height:2}}></View>
        </View>
          <View style={{alignSelf:'center',marginBottom:15}}>
              <Icon name="arrow-down" color={'rgb( 236 ,196 ,75)'} size={35} />
          </View>
          <View style={{flexDirection:'row',alignSelf:'center',marginBottom:0,padding:10}}>
            <View style={{height:26,width:26,borderRadius:13,backgroundColor:'rgb( 236 ,196 ,75)',marginRight:5,justifyContent:'center'}}><Text style={{backgroundColor:'transparent',color:'rgb(36, 20, 102)',fontFamily:'SourceSansPro-Bold',fontWeight:'bold',textAlign:'center'}}>3</Text></View>
            <Text style={{fontSize:20,color:'white',textAlign:'center',fontFamily:'SourceSansPro-Bold'}}>FAL PUANLARINLA SEVİYE ATLA, ANINDA KREDİ KAZAN VE ÇEKİLİŞE KATIL! 🎁</Text>
            <View style={{width:31,height:2}}></View>
        </View>
          <TouchableOpacity style={{alignSelf:'center'}} onPress={()=>{this.props.navigation.navigate('FalPuan')}}>
            <Text style={{color:'white',textDecorationLine:'underline'}}>Ödülleri Gör</Text>
          </TouchableOpacity>
          <TouchableOpacity  onPress={() => {this.props.navigation.goBack()}} style={{width:'100%',height:55,marginTop:20,borderRadius:4,backgroundColor:'rgb( 236 ,196 ,75)',justifyContent:'center'}}>
            <Text style={{textAlign:'center',color:'rgb(36, 20, 102)',fontWeight:'bold'}}>HEMEN YORUM YAPMAYA BAŞLA</Text>
          </TouchableOpacity>

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

});
