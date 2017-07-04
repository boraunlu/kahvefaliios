import React from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableHighlight,
  View,
  Image,
  ScrollView,
  Button,
  ActivityIndicator,
  TextInput,
  Alert
} from 'react-native';

import firebase from 'firebase';
import Backend from '../Backend';
import { NavigationActions } from 'react-navigation'
import Icon from 'react-native-vector-icons/FontAwesome';
require('../components/data/falcilar.js');
import moment from 'moment';
var esLocale = require('moment/locale/tr');
moment.locale('tr', esLocale);

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

export default class Mesajlar extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      messages: null,
      aktifChat:null

  };
}

  static navigationOptions = {
      title: 'Mesajların',
      tabBarLabel: 'Mesajlar',
       tabBarIcon: ({ tintColor }) => (
         <Icon name="comments" color={tintColor} size={25} />
       ),
    };

    navigateto = (destination,falciNo) => {
      const { navigate } = this.props.navigation;
      navigate( destination,{falciNo:falciNo} )
    }
    navigateToAktif = (falciNo) => {
      const { navigate } = this.props.navigation;


        Backend.setFalci(falciNo).then(() => {
          const resetAction = NavigationActions.reset({
            index: 0,
            actions: [
              NavigationActions.navigate({ routeName: 'Chat',params:{newFortune:false,falciNo:falciNo}})
            ]
          })
          this.props.navigation.dispatch(resetAction)
        })

    }
    delete = (falciNo) => {

      Alert.alert(
        'Konuşmayı Sil',
        'Bu konuşmayı kalıcı olarak silmek istediğine emin misin?',
        [

          {text: 'Hayır', onPress: () => {}, style: 'cancel'},
          {text: 'Evet', onPress: () => {Backend.deleteThread(falciNo); this.removeThread(falciNo)}},
        ],
      )

    }

    removeThread = (falciNo) => {
      var newList = this.state.messages;
      delete newList[falciNo];
      this.setState({messages:newList})
    }

  componentDidMount() {
    Backend.getLastMessages().then((snapshot) => {
        if(snapshot.output.length==0){
          this.setState({messages:"mesajyok"})
        }
        else{
            this.setState({messages:snapshot.output})
        }
        if(snapshot.aktif){
          this.setState({aktifChat:snapshot.aktif})
        }

    })
  }

  componentWillUnmount() {


  }
  renderAktif = () => {
    if(this.state.aktifChat==null){
      return null
    }
    else{
      return(
        <View>
        <View style={{backgroundColor:'#dcdcdc'}}><Text style={{textAlign:'center',color:'#2f4f4f',fontWeight:'bold'}}>Canlı Sohbetin</Text></View>
        <TouchableHighlight style={{backgroundColor:'white',borderTopWidth:1,borderBottomWidth:1,borderColor:'#c0c0c0'}} onPress={() => {this.navigateToAktif(this.state.aktifChat.key)}}>
         <View style={{flexDirection:'row',justifyContent:'space-between',height:60,}}>
            <View>
            <Image source={{uri:falcilar[this.state.aktifChat.key].url}} style={styles.falciAvatar}></Image>
            <View style={{height:12,width:12,borderRadius:6,backgroundColor:'#00FF00',right:8,top:8,position:'absolute'}}></View>
           </View>
           <View style={{padding:10,flex:2}}>
             <Text style={{fontWeight:'bold',fontSize:16}}>
               {falcilar[this.state.aktifChat.key].name}
              </Text>
              <Text numberOfLines={1} ellipsizeMode={'tail'}>
              {capitalizeFirstLetter(this.state.aktifChat.text)}
             </Text>
           </View>
           <View style={{padding:20}}>
             <Icon name="angle-right" color={'gray'} size={20} />
             </View>
         </View>

        </TouchableHighlight>
        </View>
      )
    }
  }
  renderBody = (props) => {
    if(this.state.messages==null){
      return(
        <ActivityIndicator
          animating={true}
          style={[styles.centering, {height: 80}]}
          size="large"
        />
      )
    }
    else if (this.state.messages=="mesajyok") {
      return(
        <Text style={{textAlign:'center',backgroundColor:'transparent'}}> Eski falın bulunmuyor </Text>
      )
    }
    else{
      var messages = this.state.messages
      return (

         messages.map(function (message,index) {
           return (
             <TouchableHighlight key={message.key} style={{backgroundColor:'white',borderTopWidth:1,borderColor:'gray'}} onPress={() => {this.navigateto('ChatOld',message.key)}}>
              <View style={{flexDirection:'row',justifyContent:'space-between',height:60,}}>
                <Image source={{uri:falcilar[message.key].url}} style={styles.falciAvatar}></Image>

                <View style={{padding:10,flex:2}}>
                  <Text style={{fontWeight:'bold',fontSize:16}}>
                    {falcilar[message.key].name}
                   </Text>
                   <Text>
                   {capitalizeFirstLetter(moment(message.createdAt).calendar())}
                  </Text>
                </View>
                <TouchableHighlight onPress={() => {this.delete(message.key,index)}} style={{padding:20,borderLeftWidth:1,borderColor:'gray'}}>
                  <Icon name="trash-o" color={'gray'} size={20} />
                </TouchableHighlight>
              </View>

             </TouchableHighlight>
             );
         }, this)
      )
    }
  }

  render() {


    return (
      <Image source={require('../static/images/splash4.png')} style={styles.container}>
        <ScrollView style={{flex:1}}>
          {this.renderAktif()}
          <View style={{backgroundColor:'#dcdcdc'}}><Text style={{textAlign:'center',color:'#2f4f4f',fontWeight:'bold'}}>Eski Falların</Text></View>
          {this.renderBody()}
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
  falciAvatar:{
    height:40,
    width:40,
    margin:10,
    borderRadius:20,
  }
});
