import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  Image,
  ScrollView,
  TouchableOpacity
} from 'react-native';

import firebase from 'firebase';
import Backend from '../Backend';
import { NavigationActions } from 'react-navigation'
import moment from 'moment';
var esLocale = require('moment/locale/tr');
moment.locale('tr', esLocale);

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

function replaceGecenHafta(string) {
    return string.replace("geçen hafta ","")
}

export default class Social extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      sosyaller:null
  };
}

  static navigationOptions = {
      title: 'Sosyal',
    };





  componentDidMount() {
    fetch('https://eventfluxbot.herokuapp.com/appapi/getSosyals', {
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

        this.setState({sosyaller:responseJson});
         //alert(JSON.stringify(responseJson))



     })
  }

  componentDidUpdate() {

  }

  componentWillUnmount() {


  }

  renderSosyaller = () => {
    if(this.state.sosyaller){
      var sosyaller = this.state.sosyaller
      return (

         sosyaller.map(function (sosyal,index) {
           return (
             <TouchableOpacity key={index} style={{backgroundColor:'white',width:'100%',borderTopWidth:1,borderColor:'gray',flex:1}} onPress={() => {}}>
              <View style={{flexDirection:'row',justifyContent:'space-between',height:60,}}>

              <Image source={{uri:sosyal.profile_pic}} style={styles.falciAvatar}></Image>
                <View style={{padding:10,flex:2}}>
                  <Text style={{fontWeight:'bold',fontSize:16}}>
                    {sosyal.question}
                   </Text>
                   <Text>
                   {capitalizeFirstLetter(replaceGecenHafta(moment(sosyal.time).calendar()))}
                  </Text>
                </View>

              </View>

             </TouchableOpacity>
             );
         }, this)
      )
    }
  }

  render() {


    return (

      <Image source={require('../static/images/splash4.png')} style={styles.container}>
        <ScrollView style={{flex:1,width:'100%'}}>
          {this.renderSosyaller()}
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

  },
  falciAvatar:{
    height:40,
    width:40,
    margin:10,
    borderRadius:20,
  }

});
