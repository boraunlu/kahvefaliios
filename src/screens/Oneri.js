import React, {

} from 'react';
import {
  StyleSheet,
  Text,
  View,Alert,
  Image,
  ScrollView,TextInput,Button,
  ImageBackground,Dimensions,Keyboard
} from 'react-native';

import firebase from 'react-native-firebase';
import Backend from '../Backend';
import { NavigationActions } from 'react-navigation'
import PropTypes from 'prop-types';

export default class Oneri extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      text:'Buraya Önerilerinizi ve Şikayetlerinizi yazabilirsiniz. Teşekkür ederiz!'
  };
  this.sendMail=this.sendMail.bind(this);
}

  static navigationOptions = {
      title: 'Öneri Ve Şikayet',
      headerRight:<View></View>,

    };


    sendMail = () => {
        if(this.state.text == 'Buraya Önerilerinizi ve Şikayetlerinizi yazabilirsiniz. Teşekkür ederiz!'||this.state.text==""){
          alert("Lütfen önce önerini veya şikayetini yaz")
        }
        else{
          Alert.alert('Şikayet & Oneri','Yorumlarınız bize ulaşmıştır. Teşekkürler!')
          this.setState({text:'Buraya Önerilerinizi ve Şikayetlerinizi yazabilirsiniz. Teşekkür ederiz!'})
         // this.popupDialog2.dismiss(() => {
         //   console.log('callback');
         // });
          Keyboard.dismiss()
          fetch('https://eventfluxbot.herokuapp.com/sendMail', {
            method: 'POST',
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              uid: Backend.getUid(),
              text: this.state.text
            })
          })
          .then((response) => {
            this.props.navigation.goBack()
          })
        }
      }



  componentDidMount() {

  }

  componentWillUnmount() {


  }


  render() {


    return (

      <ImageBackground source={require('../static/images/newImages/BG.png')} style={styles.container}>
        <Text style={{fontSize:22,color:'white',textAlign:'center',fontFamily:'SourceSansPro-Bold'}}>ÖNERİDE BULUN KREDİ KAZAN!</Text>
        <Text style={{fontSize:15,color:'white',textAlign:'center',fontFamily:'SourceSansPro-Regular'}}>{"\n"}Uygulamamız ile ilgili aksaklıkları veya güzel fikirlerinizi bize bildirin, size 50 kredi hediye edelim!</Text>
        {/* <Image style={{height:80,width:80, borderRadius:40,marginTop:30,marginBottom:30}} source={require('../static/images/anneLogo3.png')}></Image>*/}
        <View style={{width:Dimensions.get('window').width*0.9,borderRadius:0,backgroundColor:'rgba(0, 0, 0, 0.3)',padding:10,marginTop:20}}>
        <View style={{width:"100%",height:Dimensions.get('window').height*0.3}}>

            <TextInput
              multiline = {true}
              style={{flex:1,position:"relative",width:"100%",top:0,padding:15,fontSize: 16,backgroundColor:'#ffffff', borderColor: 'gray', borderWidth: 1}}
              onChangeText={(text) => this.setState({text})}
              placeholder={'Buraya Önerilerinizi ve Şikayetlerinizi yazabilirsiniz. Teşekkür ederiz!'}
              editable = {true}
              />
              </View>

            <View style={{marginTop:10,backgroundColor:"#37208e"}}>
              <Button title={"Gönder"} color='rgb( 236 ,196 ,75)'  onPress={() => {this.sendMail()}}/>
            </View>


        </View>
      </ImageBackground>

    );
  }
}




const styles = StyleSheet.create({
  container: {



    alignItems:'center',
    paddingRight:10,
    paddingLeft:10,
    paddingTop:10,
    backgroundColor: '#ccc',
    flex: 1,

    justifyContent: 'flex-start',
  },

});
