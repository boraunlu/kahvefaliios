import React from 'react';
import {
  Platform,
  StyleSheet,
  Text,
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
} from 'react-native';

import firebase from 'firebase';
import { NavigationActions } from 'react-navigation'
import {GiftedChat, Actions,Bubble,Send,Composer,InputToolbar,Avatar,Message} from 'react-native-gifted-chat';
import CustomActions from '../components/CustomActions';
import CustomView from '../components/CustomView';
import Backend from '../Backend';
import ChatModal from '../components/ChatModal';
import Elements from '../components/Elements';





export default class ChatFalsever extends React.Component {
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
      loadingVisible:false,
      quick_reply: null,
      buttons: null,
      falsever:this.props.navigation.state.params.falsever,
      inputVisible:true,

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

      headerTitle:<View style={{flexDirection:'row',justifyContent:'center',alignItems:'center'}}><Image style={{height:30,width:30, borderRadius:15,marginRight:10}} source={{uri:navigation.state.params.falsever.avatar}}></Image><Text style={{fontWeight:'bold',fontSize:20}}>{navigation.state.params.falsever.name}</Text></View>,

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

  componentDidMount() {
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
    }.bind(this))
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

  onSend(messages = []) {
    this.setState((previousState) => {
      return {
        messages: GiftedChat.append(previousState.messages, messages),
      };
    });
    fetch('https://eventfluxbot.herokuapp.com/sendMail', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        uid: Backend.getUid(),
        text: messages[0].text
      })
    })
  }


  renderCustomActions(props) {

      return (
        <CustomActions
          {...props}
          ref={instance => { this.child = instance; }}
        />
      );

  }

  sendMessageToFalsever = (messages) => {

    Backend.sendMessageToFalsever(messages,this.state.falsever)

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

  render() {
    return (

        <Image source={require('../static/images/splash4.png')}  style={styles.containerimage}>


        <GiftedChat
          messages={this.state.messages}

          onSend={(message) => {
            this.sendMessageToFalsever(message)
          }}
          locale={'tr'}
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
