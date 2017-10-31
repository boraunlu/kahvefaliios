import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  Image,
  ScrollView,
  TouchableOpacity,
  Dimensions
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



  navigateToFal = (fal) => {
    const { navigate } = this.props.navigation;
    navigate( "SocialFal",{fal:fal} )
  }

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
           var profile_pic=null
           sosyal.profile_pic?profile_pic={uri:sosyal.profile_pic}:sosyal.gender=="female"?profile_pic=require('../static/images/femaleAvatar.png'):profile_pic=require('../static/images/maleAvatar.png')
           return (
             <TouchableOpacity key={index} style={{backgroundColor:'white',width:'100%',borderColor:'gray',flex:1,marginTop:5}} onPress={() => {this.navigateToFal(sosyal)}}>
              <View style={{flexDirection:'row',justifyContent:'space-between',height:60,}}>

              <Image source={profile_pic} style={styles.falciAvatar}></Image>
                <View style={{padding:10,flex:2}}>

                  <Text numberOfLines={1} ellipsizeMode={'tail'} style={{fontWeight:'bold',fontSize:16}}>
                    {sosyal.question}
                   </Text>
                   <Text style={{fontWeight:'normal',fontSize:14}}>
                     {sosyal.name} - <Text style={{color:'teal'}}>
                      {capitalizeFirstLetter(replaceGecenHafta(moment(sosyal.time).calendar()))}
                     </Text>
                    </Text>

                </View>
                <View style={{padding:20,borderLeftWidth:1,borderColor:'teal'}}>
                  <Text style={{color:'teal'}}>({sosyal.comments?sosyal.comments.length:0})</Text>
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
          <View style={{padding:Dimensions.get('window').height/50,flexDirection:'row',justifyContent:'space-between',paddingLeft:0,marginBottom:5,alignSelf:'stretch'}}>
            <View>
              <Image style={{height:40,width:40, borderRadius:20,marginRight:10,marginLeft:10}} source={require('../static/images/anneLogo3.png')}>
              </Image>

            </View>
            <View style={{borderRadius:10,backgroundColor:'rgba(0, 0, 0, 0.6)',padding:10,width:Dimensions.get('window').width-85}}>
              <Text style={{fontSize:16,color:'white'}}>
                Bu sayfada diğer falseverlerden gelen falları okuyabilir, bu fallara yorum yapıp falpuan kazanabilirsin.
              </Text>

            </View>
          </View>
          <View style={{backgroundColor:'teal'}}><Text style={{textAlign:'center',color:'white',fontWeight:'bold'}}>Fallar</Text></View>
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
