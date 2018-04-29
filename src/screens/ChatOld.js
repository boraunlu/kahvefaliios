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
import Sound from 'react-native-sound'
//import Toast from 'react-native-root-toast';

import PropTypes from 'prop-types';
import { ShareDialog, ShareButton } from 'react-native-fbsdk';
import { NavigationActions } from 'react-navigation'
import {GiftedChat, Actions,Bubble,Send,Composer,InputToolbar,Avatar,Message} from 'react-native-gifted-chat';
import CustomActions from '../components/CustomActions';

import Backend from '../Backend';
import ChatModal from '../components/ChatModal';
import Elements from '../components/Elements';

require('../components/data/falcilar.js');


const shareModel = {
         contentType: 'link',
          contentUrl: "https://facebook.com/kahvefalisohbeti",
  contentDescription: 'Kahve Falı Sohbeti!',
};
const shareLinkContent = {
  contentType: 'link',
  contentUrl: "https://facebook.com/kahvefalisohbeti",
  contentDescription: 'Hemen mesaj atın, sohbet ederek falınıza bakalım !',
};

var whoosh = new Sound('yourturn.mp3', Sound.MAIN_BUNDLE, (error) => {
  if (error) {
    //console.log('failed to load the sound', error);
    return;
  }
  // loaded successfully
});

class CustomMessage extends Message {
  renderAvatar() {
    return (
      <Avatar {...this.getInnerComponentProps()} />
    );
  }
}

export default class ChatOld extends React.Component {
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
      falciNo:this.props.navigation.state.params.falciNo,
      shareLinkContent: shareLinkContent,
      keyboardHeight:300,
      inputVisible:false,
      buttonOpacity: new Animated.Value(0),
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
    this.delete = this.delete.bind(this);

    this._isAlright = null;
  }
  static navigationOptions = ({ navigation }) => ({

    headerTitle:falcilar[navigation.state.params.falciNo].name+" (Ayrıldı)",

  })



  delete(){

    Alert.alert(
      'Konuşmayı Sil',
      'Bu konuşmayı kalıcı olarak silmek istediğine emin misin?',
      [

        {text: 'Hayır', onPress: () => {}, style: 'cancel'},
        {text: 'Evet', onPress: () => {Backend.deleteThread(this.state.falciNo); this.navigateto('Mesajlar')}},
      ],
    )

  }



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
    this.props.navigation.setParams({ delete: this.delete })
      Backend.loadOldMessages(this.state.falciNo).then((messages) => {
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
                    if(lastMessage.buttons[0].payload=="hizlibak"||lastMessage.buttons[0].payload.includes("odeme")){

                    }

                      this.setState({quick_reply:lastMessage.buttons})
                  }
                  else if (lastMessage.type=="generic") {
                      this.setState({modalElements:lastMessage.elements,modalVisible:true})
                  }

            }
          }

      });



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


  renderCustomActions(props) {

      return (
        <CustomActions
          {...props}
          ref={instance => { this.child = instance; }}
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

    if (this.state.typingText) {
      return (
        <View style={styles.footerContainer}>
          <Text style={styles.footerText1}>
            {this.state.typingText}
          </Text>
        </View>
      );
    }
    if(this.state.quick_reply){
      let bubblewidth = (Dimensions.get('window').width-25)/3
      if(this.state.quick_reply.length>2){bubblewidth = (Dimensions.get('window').width-25)/4}

      return (
        <View style={styles.quickContainer}>

          {this.state.quick_reply.map(function(reply, index) {
            return (
              <View key={index} >
                <TouchableHighlight
                  onPress={() => {}}
                  style={[styles.quickBubble,{maxWidth:bubblewidth}]}>
                    <Text style={styles.footerText}>{reply.title}</Text>
                </TouchableHighlight>
              </View>
            );
          }.bind(this))}

        </View>
      );


    }
    if(this.state.buttons){
      let bubblewidth = (Dimensions.get('window').width-25)/3
      if(this.state.buttons.length>2){bubblewidth = (Dimensions.get('window').width-25)/4}
        return (
          <View style={styles.quickContainer}>

            {this.state.buttons.map(function(reply, index) {
                return (
                <View  key={index} >
                  <TouchableHighlight
                    onPress={() => {}}
                     style={[styles.quickBubble,{maxWidth:bubblewidth}]}>
                      <Text style={styles.footerText}>{reply.title}</Text>
                  </TouchableHighlight>
                </View>
                );
            }.bind(this))}

          </View>
        );

    }

    return null;
  }

  render() {
    return (

        <ImageBackground source={require('../static/images/splash4.png')}  style={styles.containerimage}>


          <GiftedChat
            messages={this.state.messages}

            onSend={(message) => {

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
            minInputToolbarHeight={0}
            renderMessage={props => <CustomMessage {...props} />}
            >

            </GiftedChat>

          </ImageBackground>

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
