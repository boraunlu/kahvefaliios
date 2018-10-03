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
  TextInput,
  Alert
} from 'react-native';

import firebase from 'react-native-firebase';
import Backend from '../Backend';
import axios from 'axios';
import { NavigationActions } from 'react-navigation'
import Icon from 'react-native-vector-icons/FontAwesome';
import Spinner from 'react-native-loading-spinner-overlay';
import PropTypes from 'prop-types';
import { observable } from 'mobx';
import { observer, inject } from 'mobx-react';


@inject("userStore")
@observer
export default class Instagram extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      text:'Buraya Önerilerinizi ve Şikayetlerinizi yazabilirsiniz. Teşekkür ederiz!',
      promoCode:'',
      spinnerVisible:false
  };
}

  static navigationOptions = {

    };





  componentDidMount() {

  }

  componentWillUnmount() {


  }

  sendInstaCode = () => {
    this.setState({spinnerVisible:true})

    var code = this.state.promoCode
    axios.post('https://eventfluxbot.herokuapp.com/appapi/instaShareCode', {
      uid: Backend.getUid(),
      code:code
    })
    .then( (response) => {
      var responseJson=response.data

      this.setState({spinnerVisible:false})
      if(responseJson){
        setTimeout(()=>{
          alert('Tebrikler, 30 Krediniz hesabınıza eklendi!')
          this.props.userStore.increment(30)
          this.props.navigation.goBack()
        },400)
      }
      else {
        setTimeout(()=>{
          alert('Kod yanlış veya daha önce kullanmışsınız.')
        },400)
      }

          //alert(responseJson)
    })
    .catch(function (error) {
      this.setState({spinnerVisible:false})
    });
  }


  render() {


    return (

      <ImageBackground source={require('../static/images/newImages/BG.png')} style={styles.container}>
        <Spinner visible={this.state.spinnerVisible} textStyle={{color: '#DDD'}} />
        <ScrollView style={{padding:30,flex:1,width:'100%'}}>
{/*
          <Text style={{fontSize:30,color:'white',textAlign:'center',fontFamily:'SourceSansPro-Bold'}}> INSTAGRAM'DA PAYLAŞ </Text>
          <Text style={{fontSize:22,color:'white',textAlign:'center',marginBottom:35,fontFamily:'SourceSansPro-Bold'}}> Haftada Bir Kere </Text>
*/}
          <View style={{flexDirection:'row',alignSelf:'center',marginBottom:15,padding:10}}>
            <View style={{height:26,width:26,borderRadius:13,backgroundColor:'rgb( 236 ,196 ,75)',marginRight:5,justifyContent:'center'}}><Text style={{backgroundColor:'transparent',color:'rgb(36, 20, 102)',fontFamily:'SourceSansPro-Bold',fontWeight:'bold',textAlign:'center'}}>1</Text></View>
            <Text style={{fontSize:18,color:'white',textAlign:'center',fontFamily:'SourceSansPro-Bold'}}>Instagram'da <Text  style={{fontFamily:'SourceSansPro-Bold',textDecorationLine:'underline',}}
                onPress={() => {Linking.openURL('https://www.instagram.com/kahvefalisohbeti')}}
              >
                @kahvefalisohbeti
              </Text> hesabını etiketleyerek fotoğraf veya hikaye paylaş</Text>
            <View style={{width:31,height:2}}></View>
          </View>
          <Image source={require('../static/images/instashare.jpeg')} style={{alignSelf:'center',height:200,width:200,resizeMode:'contain'}}></Image>

          <View style={{flexDirection:'row',alignSelf:'center',marginBottom:15,padding:10}}>
            <View style={{height:26,width:26,borderRadius:13,backgroundColor:'rgb( 236 ,196 ,75)',marginRight:5,justifyContent:'center'}}><Text style={{backgroundColor:'transparent',color:'rgb(36, 20, 102)',fontFamily:'SourceSansPro-Bold',fontWeight:'bold',textAlign:'center'}}>2</Text></View>
            <Text style={{fontSize:18,color:'white',textAlign:'center',fontFamily:'SourceSansPro-Bold'}}>Özel mesaj ile sana promosyon kodunu en geç bir gün içinde gönderelim.</Text>
            <View style={{width:31,height:2}}></View>
        </View>
          <View style={{flexDirection:'row',alignSelf:'center',marginBottom:0,padding:10}}>
            <View style={{height:26,width:26,borderRadius:13,backgroundColor:'rgb( 236 ,196 ,75)',marginRight:5,justifyContent:'center'}}><Text style={{backgroundColor:'transparent',color:'rgb(36, 20, 102)',fontFamily:'SourceSansPro-Bold',fontWeight:'bold',textAlign:'center'}}>3</Text></View>
            <Text style={{fontSize:18,color:'white',textAlign:'center',fontFamily:'SourceSansPro-Bold'}}>Kodu aşağıdaki kutuya gir, kredini kap!</Text>
            <View style={{width:31,height:2}}></View>
        </View>
          <View style={{flex:1,flexDirection:'row'}}>
            <TextInput
              multiline = {false}
              autoCorrect={false}
              style={{alignSelf:'center',height: 35,width:200,flex:1,padding:5,fontSize: 16,backgroundColor:'#ffffff', borderColor: 'gray', borderWidth: 1,borderRadius:4}}
              onChangeText={(code) => this.setState({promoCode:code})}
              underlineColorAndroid='transparent'
              blurOnSubmit={true}
              placeholder={'Kodu Giriniz.'}
              editable = {true}
              />
            <TouchableOpacity  onPress={() => {this.sendInstaCode()}} style={{width:80,height:35,marginLeft:10,borderRadius:4,backgroundColor:'rgb( 236 ,196 ,75)',justifyContent:'center'}}>
                <Text style={{textAlign:'center',color:'rgb(36, 20, 102)',fontWeight:'bold'}}>Gönder</Text>
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

});
