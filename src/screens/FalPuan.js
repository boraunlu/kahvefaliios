import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  Image,
  ScrollView,
} from 'react-native';

import firebase from 'react-native-firebase';
import Backend from '../Backend';
import { NavigationActions } from 'react-navigation'
import PropTypes from 'prop-types';

export default class FalPuan extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      text:'Buraya Önerilerinizi ve Şikayetlerinizi yazabilirsiniz. Teşekkür ederiz!'
  };
}

  static navigationOptions = {
      title: 'Fal Puan',
    };





  componentDidMount() {

  }
  componentDidUpdate() {

  }

  componentWillUnmount() {


  }


  render() {


    return (

      <ImageBackground source={require('../static/images/splash4.png')} style={styles.container}>
        <ScrollView>
          <Image style={{alignSelf:'center',height:60,width:60, borderRadius:30,marginTop:20,marginBottom:20}} source={require('../static/images/anneLogo3.png')}></Image>
          <View style={{borderRadius:10,flex:1,backgroundColor:'rgba(0, 0, 0, 0.5)',padding:10}}>
            <Text style={{fontSize:18,fontWeight:'bold',color:'white',textAlign:'justify'}}>
              FalPuan Nasıl Kazanılır?{"\n"}
            </Text>
            <View style={{flexDirection:'row',justifyContent:'space-between'}}>
              <Text style={{fontSize:16,color:'white'}}>Yorumunuzun Beğenilmesi: </Text>
              <Text style={{fontSize:16,color:'white',textAlign:'right'}}>1 Puan</Text>
            </View>
            <View style={{flexDirection:'row',justifyContent:'space-between'}}>
              <Text style={{fontSize:16,color:'white'}}>Günlük Fal Baktırmak: </Text>
              <Text style={{fontSize:16,color:'white',textAlign:'right'}}>1 Puan</Text>
            </View>
            <View style={{flexDirection:'row',justifyContent:'space-between'}}>
              <Text style={{fontSize:16,color:'white'}}>El Falı Baktırmak: </Text>
              <Text style={{fontSize:16,color:'white',textAlign:'right'}}>1 Puan</Text>
            </View>
            <View style={{flexDirection:'row',justifyContent:'space-between'}}>
              <Text style={{fontSize:16,color:'white'}}>Aşk Falı Baktırmak: </Text>
              <Text style={{fontSize:16,color:'white',textAlign:'right'}}>5 Puan</Text>
            </View>
            <View style={{flexDirection:'row',justifyContent:'space-between'}}>
              <Text style={{fontSize:16,color:'white'}}>Detaylı Fal Baktırmak: </Text>
              <Text style={{fontSize:16,color:'white',textAlign:'right'}}>10 Puan</Text>
            </View>
          </View>
          <View style={{borderRadius:10,flex:1,backgroundColor:'rgba(0, 0, 0, 0.5)',padding:10,marginTop:30}}>
            <Text style={{fontSize:18,fontWeight:'bold',color:'white',textAlign:'justify'}}>
              Seviyeler{"\n"}
            </Text>
            <View style={{flexDirection:'row',justifyContent:'space-between'}}>
              <Text style={{fontSize:16,color:'white'}}>Seviye 1: </Text>
              <Text style={{fontSize:16,color:'white',textAlign:'right'}}>Yeni Falsever</Text>
            </View>
            <View style={{flexDirection:'row',justifyContent:'space-between'}}>
              <Text style={{fontSize:16,color:'white'}}>Seviye 2:</Text>
              <Text style={{fontSize:16,color:'white',textAlign:'right'}}>Falsever</Text>
            </View>
            <View style={{flexDirection:'row',justifyContent:'space-between'}}>
            <Text style={{fontSize:16,color:'white'}}>Seviye 3:</Text>
            <Text style={{fontSize:16,color:'white',textAlign:'right'}}>Deneyimli Falsever</Text>
            </View>
            <View style={{flexDirection:'row',justifyContent:'space-between'}}>
            <Text style={{fontSize:16,color:'white'}}>Seviye 4:</Text>
            <Text style={{fontSize:16,color:'white',textAlign:'right'}}>Fal Uzmanı</Text>
            </View>
            <View style={{flexDirection:'row',justifyContent:'space-between'}}>
              <Text style={{fontSize:16,color:'white'}}>Seviye 5:</Text>
              <Text style={{fontSize:16,color:'white',textAlign:'right'}}>Fal Profesörü</Text>
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
    alignItems:'center',
    paddingRight:10,
    paddingLeft:10,

  },

});
