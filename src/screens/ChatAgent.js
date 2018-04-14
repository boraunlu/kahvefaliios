import React from 'react';
import {
  Platform,
  StyleSheet,
  Text,
  ScrollView,
  Button,
  Keyboard,
  TouchableHighlight,
  Modal,
  View,
  Dimensions,
  Image,
  BackAndroid,
  Animated,
  Alert,
  Easing,
  ActivityIndicator,
  TouchableWithoutFeedback
} from 'react-native';


import { NavigationActions } from 'react-navigation'
import {GiftedChat, Actions,Bubble,Send,Composer,InputToolbar,Avatar,Message} from 'react-native-gifted-chat';
import CustomActions from '../components/CustomActions';
import CustomView from '../components/CustomView';
import Backend from '../Backend';
import Icon from 'react-native-vector-icons/FontAwesome';
import ChatModal from '../components/ChatModal';
import Elements from '../components/Elements';
import firebase from 'firebase';
import { observable } from 'mobx';
import { observer, inject } from 'mobx-react';

@inject("userStore")
@observer
export default class ChatAgent extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      messages: [],
      loadEarlier: true,
      typingText: null,
      isLoadingEarlier: false,
      modalVisible: false,
      modalElements:[],
      initialLoaded:false,
      loadingVisible:true,
      quick_reply: null,
      buttons: null,
      ticket:null,
      inputVisible:true,
      falSender:null,
      resolved:false,
      falsever:null,

    };


    this._isMounted = false;
    this.onSend = this.onSend.bind(this);
    this.renderCustomActions = this.renderCustomActions.bind(this);
    this.renderBubble = this.renderBubble.bind(this);
    this.renderFooter = this.renderFooter.bind(this);
    this.renderSend = this.renderSend.bind(this);
    this.renderComposer = this.renderComposer.bind(this);
    this.renderInputToolbar = this.renderInputToolbar.bind(this);
    this.onLoadEarlier = this.onLoadEarlier.bind(this);


    this._isAlright = null;
  }
  static navigationOptions = ({ navigation }) => ({
    headerLeft:<Icon name="chevron-left" style={{marginLeft:10}} color={'#1194F7'} size={25} onPress={() => {navigation.state.params.navBack()}} />  ,
    headerTitle:<Text>flasever</Text>,

  })


  setModalVisibility(visible) {
    ////console.log(visible);
    this.setState(() => {
      return {
        modalVisible: visible,
      };
    });
  }


  navigateto = (route) => {
    const { navigate } = this.props.navigation;

    if(route=="Mesajlar"){
      const resetAction = NavigationActions.reset({
         index: 0,
         actions: [
           NavigationActions.navigate({ routeName: 'Greeting'})
         ]
       })
       this.props.navigation.dispatch(resetAction)
    }
    else{

      const { navigate } = this.props.navigation;
      navigate(route)
    }
  }
  setnavigation(route){

    if(route=="Greeting"){
      const resetAction = NavigationActions.reset({
         index: 0,
         actions: [
           NavigationActions.navigate({ routeName: 'Greeting'})
         ]
       })
       this.props.navigation.dispatch(resetAction)
    }
    else{
      BackAndroid.removeEventListener('hardwareBackPress', this.backhandler);
      const { navigate } = this.props.navigation;
      navigate(route)
    }

  }
  componentWillMount() {
    this._isMounted = true;
    Backend.refreshLastLoaded();
    this.setState(() => {
      return {
        messages: [],
      };
    });

    this.keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', this._keyboardDidShow);
  }

  componentWillUnmount() {
    this._isMounted = false;
    //console.log("chatunmounted")
    this.keyboardDidShowListener.remove();


  }

  _keyboardDidShow = (event) => {
    var height= event.endCoordinates.height
    this.setState({keyboardHeight: height});

  }

  sendMessageToFalsever = (messages) => {

    Backend.sendMessageToFalsever(messages,this.state.falsever)

  }


  navBack = () => {
    const {goBack} = this.props.navigation;
    if(this.state.resolved){
      goBack()
    }
    else{
      Alert.alert(
        'Tamamlanmadı',
        'Bu falı cevaplamadınız. Cevaplamadan çıkmak istediğinize emin misiniz?',
        [
          {text: 'Hayır', onPress: () => {}},
          {text: 'Evet', onPress: () => {
            const { params } = this.props.navigation.state;
            var ticketref= firebase.database().ref('tickets/'+params.ticket.key);
            ticketref.update({status:0}).then(() => {
              goBack()
            })
          }},
        ],
      )
    }
  }

  componentDidMount() {
    this.props.navigation.setParams({navBack: this.navBack,resolveTicket:this.resolveTicket  })
    const { params } = this.props.navigation.state;
    var ticketref= firebase.database().ref('tickets/'+params.ticket.key);
    if(params.ticket.status==1){
      this.setState({loadingVisible:false})
    }
    else {
      if(this.props.userStore.isAgent&&Backend.getUid()==!params.ticket.fireID){

        var user = firebase.auth().currentUser;
        ticketref.update({status:1,agentID:Backend.getUid(),agentName:user.displayName,agentPhoto:user.photoURL})
        fetch('https://eventfluxbot.herokuapp.com/appapi/getFortuneSender', {
          method: 'POST',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            uid: params.ticket.fireID,
            agentID: Backend.getUid(),

            ticketKey:params.ticket.key
          })
        })
        .then((response) => response.json())
         .then((responseJson) => {

            this.setState({falSender:responseJson});
             //alert(JSON.stringify(responseJson))


         })
       }
       else {
         ticketref.on('child_changed', function(childSnapshot, prevChildKey) {
           var child=childSnapshot.val()
           if(child.status=1){
             var agent={}
             agent.name=child.agentName;
             agent.avatar=child.agentPhoto;
             agent.fireID=child.agentID;
             this.setState({loadingVisible:false,falsever:agent})
           }
         });
       }
    }


    /*
     this.props.navigation.setParams({ showpopup: this.showpopup  })
     var falseverref = firebase.database().ref('messages/'+Backend.getUid()+'/falsever/mesajlar/'+this.state.falsever.fireID);
     falseverref.on('child_added',function(snapshot,key){
         var mesaj=snapshot.val()
         if(key){
             mesaj._id=key
         }
         else {
           mesaj._id="asdf"
         }
         this.setState((previousState) => {
           return {
             messages: GiftedChat.append(previousState.messages, mesaj),
           };
         });
      }.bind(this))*/
     //this.props.userStore.setTicket(params.ticket.key)
  }



  onLoadEarlier() {
    this.setState((previousState) => {
      return {
        isLoadingEarlier: true,
      };
    });

    setTimeout(() => {
      if (this._isMounted === true) {
        this.setState((previousState) => {
          return {
            messages: GiftedChat.prepend(previousState.messages, []),
            loadEarlier: false,
            isLoadingEarlier: false,
          };
        });
      }
    }, 1000); // simulating network
  }
  resolveTicket = () => {
    const { params } = this.props.navigation.state;
    var totalLength=0
    var messages = this.state.messages
    for (var i = 0; i < messages.length; i++) {
      totalLength += messages[i].text.length
    }
    if(totalLength>60){
      this.setState({resolved:true})
      const { params } = this.props.navigation.state;
      var ticketref= firebase.database().ref('tickets/'+params.ticket.key);
      ticketref.update({status:2})
      /*
      fetch('https://eventfluxbot.herokuapp.com/webhook/resolveTicket', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          uid: params.ticket.fireID,
          agentID:Backend.getUid(),
          message:messages
        })
      })*/
    }
    else {
      alert("Daha uzun cevap vermeniz gerekiyor.")
    }



  }

  onSend = (messages = []) => {
    this.setState((previousState) => {
      return {
        messages: GiftedChat.append(previousState.messages, messages),
      };
    });

  }


  renderCustomActions(props) {

      return (
        <CustomActions
          {...props}
          ref={instance => { this.child = instance; }}
        />
      );

  }

  renderBubble(props) {
    return (
      <Bubble
        {...props}
        wrapperStyle={{
          left: {
            backgroundColor: '#f0f0f0',
          }
        }}
      />
    );
  }

  renderCustomView(props) {
    return (
      <CustomView
        {...props}
      />
    );
  }
  renderSend(props) {
    return (
      <Send
        {...props}
        label={'Gönder'}
      />
    );
  }
  renderComposer(props) {
    if(this.state.inputVisible){
      return (
        <Composer
          {...props}
          placeholder={'Mesajınızı yazın...'}
        />
      );
    }
    else{
      return null
    }

  }
  renderInputToolbar(props) {
    if(this.state.inputVisible){
      return (
        <InputToolbar
          {...props}
        />
      );
    }
    else{
      return null
    }

  }

  renderFooter(props) {

    return null;
  }

  renderFalSender = () => {
    if(this.state.falSender){
      const { params } = this.props.navigation.state;
      var ticket = params.ticket
      var meslek =''
      switch(this.state.falSender.workStatus) {
        case 1:
            meslek='Çalışıyor';
            break;
        case 2:
            meslek='İş arıyor';
            break;
        case 3:
            meslek='Öğrenci';
            break;
        case 4:
            meslek='Çalışmıyor';
            break;
      }
      var iliski =''
      switch(this.state.falSender.relStatus) {
          case "0":
              iliski='İlişkisi Yok';
              break;
          case "1":
              iliski='Sevgilisi Var';
              break;
          case "2":
              iliski='Evli';
              break;

      }
      return(
        <ScrollView style={{position:'absolute',top:0,height:200,width:"100%",backgroundColor:'rgba(0, 0, 0, 0.6)'}}>
        <Text style={{color:'white',fontSize:16}}>Fal baktıran: {this.state.falSender.name + ", "+this.state.falSender.age+" yaşında, "+iliski+", "+meslek+"\n" }</Text>
          <Text style={{color:'white',fontSize:16,fontWeight:'bold'}}>Sorusu:</Text>
          {
          this.state.falSender.questions.map(function (question,index) {
            return (

                   <Text key={index} style={{fontSize:16,color:'white'}}>
                     {question}
                    </Text>

              )
          }, this)}
          <Text>{"\n"}</Text>
          <Text style={{color:'white',fontSize:16,fontWeight:'bold'}}>Gidecek Fallar: </Text>
          {
          this.state.falSender.fortunesToSend.map(function (fortune,index) {
            return (

                   <Text key={index} style={{fontSize:13,color:'white'}}>
                     {fortune}
                    </Text>

              )
          }, this)}
        </ScrollView>
      )
    }

  }

  render() {
    return (

        <Image source={require('../static/images/splash4.png')}  style={styles.containerimage}>
          <Modal
            animationType={"none"}
            transparent={false}
            visible={this.state.loadingVisible}
            onRequestClose={() => {}}
            >
            <Image source={require('../static/images/splashscreenfinal.jpg')} style={{ flex:1, width: null, height: null, resizeMode:'stretch',justifyContent:'center' }}>
               <View style={{ height: 100,backgroundColor:'white',justifyContent:'center' }}>
                <Text style={{textAlign:'center'}}>
                  Uygun falcı aranıyor...
                  </Text>
                 <ActivityIndicator
                   animating={true}
                   style={[styles.centering, {height: 80}]}
                   size="large"
                 />
               </View>
             </Image>
          </Modal>

          <GiftedChat
            messages={this.state.messages}

            onSend={(message) => {
              this.sendMessageToFalsever(message)
            }}
            loadEarlier={false}
            user={{
              _id: Backend.getUid(),
              name: Backend.getName(),
              avatar:Backend.getAvatar(),
            }}
            renderActions={this.renderCustomActions}
            renderBubble={this.renderBubble}
            renderCustomView={this.renderCustomView}
            renderFooter={this.renderFooter}
            renderSend={this.renderSend}
            renderComposer={this.renderComposer}
            renderInputToolbar={this.renderInputToolbar}

            >

            </GiftedChat>
               {this.renderFalSender()}
          </Image>

    );
  }
}

const styles = StyleSheet.create({
  containerimage: {
    flex: 1,
    width:null,
    alignSelf:'stretch'
  },
  quickContainer: {
    marginTop: 5,
    marginLeft: 10,
    marginRight: 10,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent:'space-around',
  },
  quickBubble:{
    borderRadius:10,
    borderWidth:2,
    borderColor:'#1194F7',
    padding:8,
    backgroundColor:'#1194F7',

  },
  quickText:{
    fontSize: 14,
    color: '#aaa',
  },
  footerText: {
    fontSize: 14,
    color: 'white',
    textAlign:'center',
    fontWeight:'bold',
    backgroundColor:'transparent'
  },
  footerText1: {
    fontSize: 14,
    color: 'white',
    textAlign:'center',
    fontWeight:'bold',
    backgroundColor:'transparent'
  },
  container: {
    flex: 1,
    padding: 0,
    flexDirection: 'column-reverse'
  },
  innerContainer: {
    height: 300,
    alignSelf:'stretch',
    alignItems: 'center',
  },
  row: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row',
    marginBottom: 20,
  },
  rowTitle: {
    flex: 1,
    fontWeight: 'bold',
  },
  button: {
    borderRadius: 5,
    flexGrow: 1,
    height: 44,
    alignSelf: 'stretch',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  buttonText: {
    fontSize: 18,
    margin: 5,
    textAlign: 'center',
  },
  modalButton: {
    marginTop: 10,
  },
  pickerItem: {
    fontSize: 16,
  },
  centering: {
  alignItems: 'center',
  justifyContent: 'center',
  padding: 8,
},
});
