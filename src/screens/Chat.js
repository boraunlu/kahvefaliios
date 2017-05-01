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
  Image,
  BackAndroid,
  ActivityIndicator,
} from 'react-native';
import Sound from 'react-native-sound'
import Toast from 'react-native-root-toast';


import { ShareDialog, ShareButton } from 'react-native-fbsdk';
import { NavigationActions } from 'react-navigation'
import {GiftedChat, Actions,Bubble,Send,Composer} from 'react-native-gifted-chat';
import CustomActions from '../components/CustomActions';
import CustomView from '../components/CustomView';
import Backend from '../Backend';
import ChatModal from '../components/ChatModal';
import Elements from '../components/Elements';

const productId = "deneme"
const shareModel = {
         contentType: 'link',
          contentUrl: "https://facebook.com",
  contentDescription: 'Facebook sharing is easy!',
};
const shareLinkContent = {
  contentType: 'link',
  contentUrl: "https://facebook.com/kahvefalisohbeti",
  contentDescription: 'Hemen mesaj atın, sohbet ederek falınıza bakalım !',
};

var whoosh = new Sound('yourturn.mp3', Sound.MAIN_BUNDLE, (error) => {
  if (error) {
    console.log('failed to load the sound', error);
    return;
  }
  // loaded successfully
});

export default class Chat extends React.Component {
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
      loadingVisible:this.props.navigation.state.params.newFortune,
      quick_reply: null,
      buttons: null,
      shareLinkContent: shareLinkContent,
      keyboardHeight:300,
    };


    this._isMounted = false;
    this.onSend = this.onSend.bind(this);
    this.onReceive = this.onReceive.bind(this);
    this.renderCustomActions = this.renderCustomActions.bind(this);
    this.renderBubble = this.renderBubble.bind(this);
    this.renderFooter = this.renderFooter.bind(this);
    this.renderSend = this.renderSend.bind(this);
    this.renderComposer = this.renderComposer.bind(this);
    this.onLoadEarlier = this.onLoadEarlier.bind(this);
    this.shareLinkWithShareDialog = this.shareLinkWithShareDialog.bind(this);
    this.setnavigation = this.setnavigation.bind(this);

    this._isAlright = null;
  }
  static navigationOptions = {
    title: 'Sohbet',
    header: ({ state }) => ({
      left:   <Button title={"Sayfam"} onPress={() => {state.params.setnavigation('Greeting')}}/>,
      right: <Button title={"kredi al"} onPress={() => {state.params.setnavigation('Odeme')}}/>,

    }),

  };



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



  setModalVisibility(visible) {
    console.log(visible);
    this.setState(() => {
      return {
        modalVisible: visible,
      };
    });
  }

  sendPayload(payload){

    if(payload=="appstart"){
      Backend.sendPayload(payload);
    }
    else{
      if(payload.type=="postback"){
        if(payload.payload=="sharepage"){
          this.shareLinkWithShareDialog()
        }
        else if (payload.payload.includes("odeme")) {
          alert('odeme')
        }
        else{
            Backend.sendPayload(payload.payload);
        }
      }
      else{
        this.shareLinkWithShareDialog()
      }
      Backend.addMessage(payload.title)
      this.setState((previousState) => {
        return {
          buttons:null
        };
      });
    }
  }

  shareLinkWithShareDialog() {
    var tmp = this;
    ShareDialog.canShow(this.state.shareLinkContent).then(
      function(canShow) {
        if (canShow) {
          Keyboard.dismiss()
          return ShareDialog.show(tmp.state.shareLinkContent);
        }
      }
    ).then(
      function(result) {
        if (result.isCancelled) {
          alert('Share cancelled');
        } else {
          console.log('Share success with postId: ' + result.postId)
          console.log('paylaştı')
          Backend.sendPayload("appshared")
        }
      },
      function(error) {
      }
    );
  }

  sendQuickPayload(payload){
      if(payload.payload=="odeme"){

      }else{
        Backend.sendQuickPayload(payload.payload);
      }
      Backend.addMessage(payload.title)
      this.setState((previousState) => {
        return {
          quick_reply:null
        };
      });
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
    console.log("chatunmounted")
    this.keyboardDidShowListener.remove();

  }

  _keyboardDidShow = (event) => {
    var height= event.endCoordinates.height
    this.setState({keyboardHeight: height});

  }

  componentDidMount() {

    this.props.navigation.setParams({ setnavigation: this.setnavigation })

      Backend.loadMessages((message) => {
        if(message!=={}){
          if(this._isMounted){
          if(message.type=="typing"){
            this.setState({typingText:"Yazıyor..."})
          }
          else{
            this.setState({typingText:null})
            if(message.type=="generic"){

                this.setState({modalElements:message.elements,modalVisible:true})
                  Keyboard.dismiss()
            }
            else if (message.type=="quick") {
              this.setState((previousState) => {
                return {
                  messages: GiftedChat.append(previousState.messages, message),quick_reply:message.quick_reply
                };
              });
            }
            else if (message.type=="button") {
              this.setState((previousState) => {
                return {
                  messages: GiftedChat.append(previousState.messages, message),
                  buttons:message.buttons,
                };
              });
            }
            else if (message.type=="image"||message.type=="text") {
              this.setState((previousState) => {
                return {
                  messages: GiftedChat.append(previousState.messages, message),
                };
              });
            }
              whoosh.play();
          }

        }
        }

      });

      BackAndroid.addEventListener('hardwareBackPress', this.backhandler);


      Backend.loadInitialMessages((messages) => {
        if(!this.props.navigation.state.params.newFortune){
          if(this._isMounted){
                this.setState((previousState) => {
                  return{
                    initialLoaded:true,
                    messages: GiftedChat.append(previousState.messages, messages),
                  }
                });
                if(messages.length>0){
                  var lastMessage=messages[0]
                  if(lastMessage.type=="quick"){
                    this.setState({quick_reply:lastMessage.quick_reply})
                  }
                  else if (lastMessage.type=="button") {
                      this.setState({quick_reply:lastMessage.buttons})
                  }
                  else if (lastMessage.type=="generic") {
                      this.setState({modalElements:lastMessage.elements,modalVisible:true})
                  }

            }
          }
        }
        else{
          this.removeLoading()
        }
      });



  }

  backhandler = () => {
    const resetAction = NavigationActions.reset({
       index: 0,
       actions: [
         NavigationActions.navigate({ routeName: 'Greeting'})
       ]
     })
     this.props.navigation.dispatch(resetAction)
       BackAndroid.removeEventListener('hardwareBackPress', this.backhandler);
     return true
  }

  removeLoading(){
    if(this.state.loadingVisible){
      var randomTime =Math.floor(Math.random()*(18000-12000+1)+12000);
      setTimeout(() => {
        if(this._isMounted){
          this.setState({
            loadingVisible:false,
          });

          this.sendPayload("appstart")
          let toast = Toast.show('Falcı sohbete bağlandı!', {
            duration: Toast.durations.SHORT,
            position: 70,
            shadow: true,
            animation: true,
            hideOnPress: true,
          });
        }
      }, randomTime)
    }
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

    // for demo purpose
    //this.answerDemo(messages);
  }

  answerDemo(messages) {
    if (messages.length > 0) {
      if ((messages[0].image || messages[0].location) || !this._isAlright) {
        this.setState((previousState) => {
          return {
            typingText: 'React Native is typing'
          };
        });
      }
    }

    setTimeout(() => {
      if (this._isMounted === true) {
        if (messages.length > 0) {
          if (messages[0].image) {
            this.onReceive('Nice picture!');
          } else if (messages[0].location) {
            this.onReceive('My favorite place');
          } else {
            if (!this._isAlright) {
              this._isAlright = true;
              this.onReceive('Alright');
            }
          }
        }
      }

      this.setState((previousState) => {
        return {
          typingText: null,
        };
      });
    }, 1000);
  }

  onReceive(text) {
    this.setState((previousState) => {
      return {
        messages: GiftedChat.append(previousState.messages, {
          _id: Math.round(Math.random() * 1000000),
          text: text,
          createdAt: new Date(),
          user: {
            _id: 2,
            name: 'React Native',
            // avatar: 'https://facebook.github.io/react/img/logo_og.png',
          },
        }),
      };
    });
  }

  sendMessageToBack = (message) => {
    this.setState({buttons:null,quick_reply:null})
    Backend.sendMessage(message);
    whoosh.play();
  }
  renderCustomActions(props) {

      return (
        <CustomActions
          {...props}
        />
      );

      /*
    const options = {
      'Action 1': (props) => {
        alert('option 1');
      },
      'Action 2': (props) => {
        alert('option 2');
      },
      'Cancel': () => {},
    };
    return (
      <Actions
        {...props}
        options={options}
      />
    );*/
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
    return (
      <Composer
        {...props}
        placeholder={'Mesajınızı yazın...'}
      />
    );
  }

  renderFooter(props) {
    if (this.state.typingText) {
      return (
        <View style={styles.footerContainer}>
          <Text style={styles.footerText}>
            {this.state.typingText}
          </Text>
        </View>
      );
    }
    if(this.state.quick_reply){
      return (
        <View style={styles.quickContainer}>

          {this.state.quick_reply.map(function(reply, index) {
            return (

              <TouchableHighlight
                onPress={() => {this.sendQuickPayload(reply)}}
                key={index} style={styles.quickBubble}>
                  <Text style={styles.footerText}>{reply.title}</Text>
                </TouchableHighlight>
            );
          }.bind(this))}

        </View>
      );
    }
    if(this.state.buttons){
      return (
        <View style={styles.quickContainer}>

          {this.state.buttons.map(function(reply, index) {
            return (

              <TouchableHighlight
                onPress={() => {this.sendPayload(reply)}}
                key={index} style={styles.quickBubble}>
                  <Text style={styles.footerText}>{reply.title}</Text>
                </TouchableHighlight>
            );
          }.bind(this))}

        </View>
      );
    }
    if(this.state.modalVisible){
      return(
        <View style={{height:this.state.keyboardHeight-30}}></View>
      )
    }
    return null;
  }

  render() {
    return (

        <Image source={{uri:'http://kahvefali.s3.amazonaws.com/images/wallpaper/splash4.png'}} style={styles.container}>
          <GiftedChat
            messages={this.state.messages}

            onSend={(message) => {
              this.sendMessageToBack(message)
            }}
            loadEarlier={false}
            user={{
              _id: Backend.getUid(),
              name: "user",
            }}
            renderActions={this.renderCustomActions}
            renderBubble={this.renderBubble}
            renderCustomView={this.renderCustomView}
            renderFooter={this.renderFooter}
            renderSend={this.renderSend}
            renderComposer={this.renderComposer}
            >

            </GiftedChat>

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

            <Elements
              transparent={true}
              modalVisible={this.state.modalVisible}
              keyboardHeight={this.state.keyboardHeight}
              setModalVisibility={(visible) =>{
                        this.setModalVisibility(visible)
              }}
              elements={this.state.modalElements}
              sendPayload={(payload) => {
                this.setModalVisibility(false)
                this.sendPayload(payload)
              }}
            />
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
    fontWeight:'bold'
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
