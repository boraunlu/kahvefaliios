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
import NotificationIcon from '../components/NotificationIcon';
import { NavigationActions } from 'react-navigation'
import Icon from 'react-native-vector-icons/FontAwesome';
import { observable } from 'mobx';
import { observer, inject } from 'mobx-react';
require('../components/data/falcilar.js');
import moment from 'moment';
var esLocale = require('moment/locale/tr');
moment.locale('tr', esLocale);

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

function replaceGecenHafta(string) {
    return string.replace("geçen hafta ","")
}

@inject("userStore")
@observer
export default class Mesajlar extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      messages: null,
      falsevers:null,
      aktifChat:null,
      lastBizden:null,
      tickets:null,
      agentCheck:false,
      activeTicket:null
  };
}

  static navigationOptions = {
      title: 'Mesajların',
      tabBarLabel: 'Mesajlar',
       tabBarIcon: ({ tintColor }) => (

         <NotificationIcon tintColor={tintColor}/>
       ),
    };

    navigateto = (destination,falciNo) => {
      const { navigate } = this.props.navigation;
      navigate( destination,{falciNo:falciNo} )
    }
    navigateToAgent = (destination,ticket) => {
      const { navigate } = this.props.navigation;
      navigate( destination,{ticket:ticket} )
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
    delete = (falciNo,index) => {

      Alert.alert(
        'Konuşmayı Sil',
        'Bu konuşmayı kalıcı olarak silmek istediğine emin misin?',
        [

          {text: 'Hayır', onPress: () => {}, style: 'cancel'},
          {text: 'Evet', onPress: () => {Backend.deleteThread(falciNo); this.removeThread(index)}},
        ],
      )

    }

    removeThread = (index) => {
      var newList = this.state.messages;
      newList.splice(index, 1);
      this.setState({messages:newList})
    }

  componentDidMount() {
    Backend.getLastMessages().then((snapshot) => {
        if(snapshot.output.length==0){
          this.setState({messages:[]})
        }
        else{
            this.setState({messages:snapshot.output})
        }
        if(snapshot.aktif){
          if(snapshot.aktif.read==false){
            this.props.userStore.setAktifUnread(1)

          }
          this.setState({aktifChat:snapshot.aktif})
        }

    })
    Backend.getBizden().then((snapshot) => {
      if(snapshot){
        var data = snapshot
        var output =[]
        for (var key in data) {
            data[key].key = key;   // save key so you can access it from the array (will modify original data)
            output.push(data[key]);
        }
        var lastBizden = output[output.length-1]
        if(lastBizden.read==false){
              this.props.userStore.setBizdenUnread(1)
        }

        this.setState({lastBizden:lastBizden.text})
      }

    })
    /*
    var falseverref = firebase.database().ref('messages/'+Backend.getUid()+'/falsever/bilgiler');
    falseverref.on('value',function(dataSnapshot){
        var falsevers=dataSnapshot.val()
        var data = falsevers
        var output =[]
        for (var key in data) {
            data[key].fireID = key;   // save key so you can access it from the array (will modify original data)
            output.push(data[key]);
        }

        this.setState({falsevers:output})
    }.bind(this))
*/

  }

  componentDidUpdate(prevProps,prevState) {
        //alert(prevProps.userStore.isAgent)
        /*
    if(this.props.userStore.isAgent==true&&this.state.agentCheck==false){
      this.setState({agentCheck:true})
      this.trackTickets();
      if(this.props.userStore.hasTicket){

      }
    }*/
  }

  componentWillMount() {
//alert(this.props.userStore.isAgent)

  }

  /*
  trackTickets = () => {
    var ticketref= firebase.database().ref('tickets');
    ticketref.orderByChild("status").equalTo(0).on('value',function(snapshot){

      var obj = snapshot.val()

      var res =[]
      for (var key in obj) {

          obj[key].key = key;   // save key so you can access it from the array (will modify original data)
          res.push(obj[key]);
      }
      this.setState({tickets:res})
    }.bind(this))

    ticketref.orderByChild("status").equalTo(1).on('value',function(snapshot){

      var obj = snapshot.val()
      var agentID = Backend.getUid()
      var res =[]
      var ticketvar=false
      for (var key in obj) {
          if(obj[key].agentID==agentID){
            obj[key].key = key;
            this.setState({activeTicket:obj[key]})
            ticketvar=true
          }

      }
      if(!ticketvar){
        this.setState({activeTicket:null})
      }

    }.bind(this))
  }*/

  renderAktif = () => {
    if(this.state.aktifChat==null){
      return null
    }
    else{
      return(
        <View>
        <View style={{backgroundColor:'teal'}}><Text style={{textAlign:'center',color:'white',fontWeight:'bold'}}>Canlı Sohbetin</Text></View>
        <TouchableOpacity style={{backgroundColor:'white',borderTopWidth:1,borderBottomWidth:1,borderColor:'#c0c0c0'}} onPress={() => {this.navigateToAktif(this.state.aktifChat.key)}}>
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
              {capitalizeFirstLetter(this.props.userStore.aktifLastMessage)}
             </Text>
           </View>
           <View style={{padding:20}}>
            {this.props.userStore.aktifUnread==1  ?    <View style={{height:26,width:26,borderRadius:13,backgroundColor:'red',justifyContent:'center'}}><Text style={{backgroundColor:'transparent',color:'white',fontWeight:'bold',textAlign:'center'}}>1</Text></View> :    <Icon name="angle-right" color={'gray'} size={20} />}

             </View>
         </View>

        </TouchableOpacity>
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
    else if (this.state.messages.length==0) {
      return(
        <Text style={{textAlign:'center',backgroundColor:'transparent'}}> Eski falın bulunmuyor </Text>
      )
    }
    else{
      var messages = this.state.messages
      return (

         messages.map(function (message,index) {
           return (
             <TouchableOpacity key={message.key} style={{backgroundColor:'white',borderTopWidth:1,borderColor:'gray'}} onPress={() => {this.navigateto('ChatOld',message.key)}}>
              <View style={{flexDirection:'row',justifyContent:'space-between',height:60,}}>
                <Image source={{uri:falcilar[message.key].url}} style={styles.falciAvatar}></Image>

                <View style={{padding:10,flex:2}}>
                  <Text style={{fontWeight:'bold',fontSize:16}}>
                    {falcilar[message.key].name}
                   </Text>
                   <Text>
                   {capitalizeFirstLetter(replaceGecenHafta(moment(message.createdAt).calendar()))}
                  </Text>
                </View>
                <TouchableOpacity onPress={() => {this.delete(message.key,index)}} style={{padding:20,borderLeftWidth:1,borderColor:'gray'}}>
                  <Icon name="trash-o" color={'gray'} size={20} />
                </TouchableOpacity>
              </View>

             </TouchableOpacity>
             );
         }, this)
      )
    }
  }

  renderFalsevers = (props) => {
    if(this.state.falsevers==null){
      return(
        <ActivityIndicator
          animating={true}
          style={[styles.centering, {height: 80}]}
          size="large"
        />
      )
    }
    else if (this.state.falsevers.length==0) {
      return(
        <Text style={{textAlign:'center',backgroundColor:'transparent'}}> Eski falın bulunmuyor </Text>
      )
    }
    else{
      var messages = this.state.falsevers
      return (

         messages.map(function (message,index) {
           return (
             <TouchableOpacity key={index} style={{backgroundColor:'white',borderTopWidth:1,borderColor:'gray'}} onPress={() => {this.props.navigation.navigate('ChatFalsever',{falsever:message})}}>
              <View style={{flexDirection:'row',justifyContent:'space-between',height:60,}}>
                <Image source={{uri:message.avatar}} style={styles.falciAvatar}></Image>

                <View style={{padding:10,flex:2}}>
                  <Text style={{fontWeight:'bold',fontSize:16}}>
                    {message.name}
                   </Text>
                   <Text>
                   {capitalizeFirstLetter(replaceGecenHafta(moment(message.createdAt).calendar()))}
                  </Text>
                </View>
                <TouchableOpacity onPress={() => {this.delete(message.fireID,index)}} style={{padding:20,borderLeftWidth:1,borderColor:'gray'}}>
                  <Icon name="trash-o" color={'gray'} size={20} />
                </TouchableOpacity>
              </View>

             </TouchableOpacity>
             );
         }, this)
      )
    }
  }

  renderAgent = () => {


    if(this.props.userStore.isAgent){

        if(this.state.activeTicket){
          return(
            <View>
            <View style={{backgroundColor:'teal'}}><Text style={{textAlign:'center',color:'white',fontWeight:'bold'}}>Bekleyen Fallar</Text></View>
            <TouchableOpacity style={{backgroundColor:'white',borderTopWidth:1,borderColor:'gray'}} onPress={() => {this.navigateToAgent('ChatAgent',this.state.activeTicket)}}>
             <View style={{flexDirection:'row',justifyContent:'space-between',height:60,}}>


               <View style={{padding:10,flex:2}}>
                 <Text style={{fontWeight:'bold',fontSize:16}}>
                  Bu senin
                  </Text>

               </View>

             </View>

            </TouchableOpacity>
            </View>
          )
        }
        else{



       var tickets = this.state.tickets
       if(tickets){


        return (
          <View>
          <View style={{backgroundColor:'teal'}}><Text style={{textAlign:'center',color:'white',fontWeight:'bold'}}>Bekleyen Fallar</Text></View>
          {
           tickets.map(function (ticket,index) {
             if(index==0){
               return (
                 <TouchableOpacity key={ticket.key} style={{backgroundColor:'white',borderTopWidth:1,borderColor:'gray'}} onPress={() => {this.navigateToAgent('ChatAgent',ticket)}}>
                  <View style={{flexDirection:'row',justifyContent:'space-between',height:60,}}>


                    <View style={{padding:10,flex:2}}>
                      <Text style={{fontWeight:'bold',fontSize:16}}>
                        Cevapla
                       </Text>
                       <Text>
                       {replaceGecenHafta(moment(ticket.createdAt).calendar())}
                      </Text>
                    </View>

                  </View>

                 </TouchableOpacity>
                 );
             }else{
               return (
                 <TouchableOpacity key={ticket.key} style={{backgroundColor:'white',borderTopWidth:1,borderColor:'gray'}} onPress={() => {}}>
                  <View style={{flexDirection:'row',justifyContent:'space-between',height:60,}}>


                    <View style={{padding:10,flex:2}}>
                      <Text style={{fontWeight:'bold',fontSize:16}}>
                        Bekleyenler
                       </Text>
                       <Text>
                       {replaceGecenHafta(moment(ticket.createdAt).calendar())}
                      </Text>
                    </View>

                  </View>

                 </TouchableOpacity>
                 );
             }

           }, this)
         }
         </View>
        )

        }
        else{
          return(
          <Text>Bekleyen Fal bulunmuyor</Text>)
        }
      }
    }
    else {
      return (null)
    }


  }

  renderBizden = () => {
    if(this.state.lastBizden==null){
      return null
    }
    else{

      return(
        <View>
        <View style={{backgroundColor:'teal'}}><Text style={{textAlign:'center',color:'white',fontWeight:'bold'}}>Bizden Gelenler</Text></View>
        <TouchableOpacity style={{backgroundColor:'white',borderTopWidth:1,borderBottomWidth:1,borderColor:'#c0c0c0'}} onPress={() => {this.navigateto('ChatBizden'); this.props.userStore.setBizdenUnread(0)}}>
         <View style={{flexDirection:'row',justifyContent:'space-between',height:60,}}>
            <View>
            <Image source={require('../static/images/anneLogo3.png')} style={styles.falciAvatar}></Image>

           </View>
           <View style={{padding:10,flex:2}}>
             <Text style={{fontWeight:'bold',fontSize:16}}>
               Nevin
              </Text>
              <Text numberOfLines={1} ellipsizeMode={'tail'}>
                {capitalizeFirstLetter(this.state.lastBizden)}
             </Text>
           </View>
           <View style={{padding:20}}>
           {this.props.userStore.bizdenUnread==1 ?    <View style={{height:26,width:26,borderRadius:13,backgroundColor:'red',justifyContent:'center'}}><Text style={{backgroundColor:'transparent',color:'white',fontWeight:'bold',textAlign:'center'}}>1</Text></View> :    <Icon name="angle-right" color={'gray'} size={20} />}

             </View>
         </View>

        </TouchableOpacity>
        </View>
      )
    }
  }

  render() {


    return (
      <Image source={require('../static/images/splash4.png')} style={styles.container}>
        <ScrollView style={{flex:1}}>

          {this.renderAktif()}

          {this.renderBizden()}
          <View style={{backgroundColor:'teal'}}><Text style={{textAlign:'center',color:'white',fontWeight:'bold'}}>Eski Falların</Text></View>
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
