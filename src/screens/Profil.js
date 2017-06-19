import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  Image,
  ScrollView,
  TouchableHighlight
} from 'react-native';

import firebase from 'firebase';
import Backend from '../Backend';
import UserData from '../components/UserData';
import { NavigationActions } from 'react-navigation'


export default class Profil extends React.Component {
  constructor(props) {
    super(props);
    this.state = {

      userData:null,
  };
}

  static navigationOptions = {
      title: 'Profilin',
    };





  componentDidMount() {
    var user = firebase.auth().currentUser;
    if(user.photoURL){
      this.setState({profPhoto:user.photoURL})
    }
    if(user.displayName){
        this.setState({userName:user.displayName})
    }
    fetch('https://eventfluxbot.herokuapp.com/webhook/getAppUser', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        uid: user.uid,
      })
    })
    .then((response) => response.json())
     .then((responseJson) => {
       //alert(JSON.stringify(responseJson));
          this.setState({userData:responseJson});
         //alert(JSON.stringify(responseJson))

     })
  }

  componentWillUnmount() {


  }


  render() {


    return (

      <Image source={require('../static/images/splash4.png')} style={styles.container}>
        <ScrollView>
        <View style={{elevation:3,paddingTop:15,backgroundColor:'white',flexDirection:'column'}}>
          <View style={{alignSelf:'center',marginBottom:3,width:64,height:64,borderRadius:32,borderColor:'#1194F7',borderWidth:1,paddingTop:1,alignItems:'center'}}>
            <Image style={{height:60,width:60, borderRadius:30}} source={{uri:this.state.profPhoto}}></Image>
          </View>
          <Text style={{alignSelf:'center',marginBottom:5,fontWeight:'bold',color:'black',fontSize:16}}>{this.state.userName}</Text>

          <UserData userData={this.state.userData} setDestination={(destination) =>{this.navigateto(destination)}}/>

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
    alignItems:'center',
    padding:10,
    paddingTop:30
  },

});
