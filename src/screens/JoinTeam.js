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

export default class JoinTeam extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
        email:"",
        kendi:""

  };
  this.sendBasvuru=this.sendBasvuru.bind(this);
}

  static navigationOptions = {
      title: 'EKİBİMİZE KATILIN',
      headerStyle: {
        backgroundColor:'white',
        height: 46

      },headerRight:<View style={{width:70,height:10}}></View>,
      headerTitleStyle: {
        fontWeight: 'bold',
        fontSize:18,
        textAlign: "center",alignSelf: 'center',
        color: "#241466",
  textAlign:'center'
      },

    };

    sendBasvuru = () => {
        if(this.state.kendi == ""){
          alert("Lütfen önce kendinden bahset")
        }
        else{
          Alert.alert('Başvuru','Başvurunuz bize ulaşmıştır. Teşekkürler!')
          this.setState({kendi:''})
          //this.popupDialog3.dismiss(() => {
          //  console.log('callback');
          //});
          Keyboard.dismiss()
          fetch('https://eventfluxbot.herokuapp.com/sendMail', {
            method: 'POST',
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              uid: Backend.getUid(),
              text: "başvuru "+this.state.kendi
            })
          })
          .then((response) => {

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

        <Text style={{fontSize:15,color:'white',textAlign:'center',fontFamily:'SourceSansPro-Regular'}}>Başvurunuzu aldıktan sonra SOSYAL PANOdaki performansınız takip edilip size dönüş yapılacaktır. İlginiz için teşekkür ederiz!</Text>
        <View style={{width:Dimensions.get('window').width*0.9,borderRadius:0,backgroundColor:'rgba(0, 0, 0, 0.3)',padding:10,marginTop:20}}>

            <View style={{height:50,marginBottom:10}}>
              <Text style={{color:"#ffffff",marginBottom:3}}>E-posta adresiniz</Text>
               <View style={{width:"100%",height:38}}>
                <TextInput

                 multiline = {true}
                 placeholder={"E-posta"}

                 style={{flex:1,position:"relative",width:"100%",top:0,height:38,padding:3,paddingLeft:15,fontSize: 16,backgroundColor:'#ffffff', borderColor: 'gray', borderWidth: 1}}
                 onChangeText={(text) => this.setState({email:text})}

                 editable = {true}
               /></View>
             </View>
             <Text style={{color:"#ffffff",marginBottom:3}}>Kısaca kendinizi tanıtın</Text>
              <View style={{width:"100%",height:Dimensions.get('window').height*0.22,marginBottom:10}}>
                <TextInput

                multiline = {true}

                style={{flex:1,position:"relative",width:"100%",top:0,padding:15,fontSize: 16,backgroundColor:'#ffffff', borderColor: 'gray', borderWidth: 1}}
                onChangeText={(text) => this.setState({kendi:text})}
                placeholder={"Bize biraz kendinizden bahsedin"}
                editable = {true}
              />
              </View>

           <View style={{}}>
             <Button title={"Gönder"} color='rgb( 236 ,196 ,75)' onPress={() => {this.sendBasvuru()}}/>
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
