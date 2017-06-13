import React from 'react';
import {
  StyleSheet,
  Text,
  Button,
  TouchableOpacity,
  TouchableHighlight,
  View,
  Image,
  Modal,
  Dimensions,
  Animated,
  Easing,
  BackAndroid,
  ScrollView
} from 'react-native';



import firebase from 'firebase';
import UserData from '../components/UserData';
import { NavigationActions } from 'react-navigation'
import Icon from 'react-native-vector-icons/FontAwesome';


export default class Greeting extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      profPhoto:'http://www.omnovia.com/wp/wp-content/uploads/2015/04/analyst-placeholder-avatar.png',
      userName:'',
      user:null,
      userData:null,
      animatedButton: new Animated.Value(0),
      animatedBubble: new Animated.Value(0),
      buttonOpacity: new Animated.Value(0),
      greetingMessage:"...",

  };
  this.navigateto = this.navigateto.bind(this);
  this.greetingMounted = false;
  this.springValue = new Animated.Value(0.1)
}

  static navigationOptions = {
      title: 'Kahve Falı Sohbeti',
    };



  navigateto = (destination) => {
    this.greetingMounted=false;
    const { navigate } = this.props.navigation;
    if(destination=="Chat"){
      if(this.state.userData){
        if(this.state.userData.currentFalci==null){
          const resetAction = NavigationActions.reset({
            index: 0,
            actions: [
              NavigationActions.navigate({ routeName: 'Chat',params:{newFortune:true}})
            ]
          })
          this.props.navigation.dispatch(resetAction)
          //navigate('Chat',{newFortune:false})
        }
        else{
          const resetAction = NavigationActions.reset({
            index: 0,
            actions: [
              NavigationActions.navigate({ routeName: 'Chat',params:{newFortune:false}})
            ]
          })
          this.props.navigation.dispatch(resetAction)
        }
      }

    }
    else{
      navigate(destination)
    }
  }

  animateButtons = () => {

    this.state.animatedButton.setValue(0)
    Animated.timing(
      this.state.animatedButton,
      {
        toValue: 1,
        duration: 1000,
        easing: Easing.quad
      }
    ).start()

  }
  fadeButtons = () => {
    this.state.buttonOpacity.setValue(0)
    Animated.timing(
      this.state.buttonOpacity,
      {
        toValue: 1,
        duration: 1000,
      }
    ).start()
  }
  animateBubble = () => {

    this.state.animatedBubble.setValue(0)
    Animated.timing(
      this.state.animatedBubble,
      {
        toValue: 1,
        duration: 1000,
        easing: Easing.quad
      }
    ).start()
  }
  spring = () => {
    this.springValue.setValue(0)
    Animated.spring(
      this.springValue,
      {
        toValue: 1,
        friction: 2
      }
    ).start()
  }
  componentDidUpdate(){
    if(this.state.userData!==null){this.fadeButtons();}
  }

  componentDidMount() {
    const { params } = this.props.navigation.state;
    var greetingType='online';
    var greetingMessage="";


    var user = firebase.auth().currentUser;
    if(params){
      if(params.login){
        if(params.login=="eski"){  greetingMessage="Hoşgeldin "+user.displayName+". Seni burada da görmek ne kadar güzel. Yeni fal türlerine baktırmak istersen veya kredi almak istersen gelmen gereken yer burası."}
        else{greetingMessage="Hoşgeldin "+user.displayName+". Bambaşka bir fal deneyimine hazır mısın? Hemen 'Yeni Fal' tuşuna bas ve uygun durumda olan bir falcımızla sohbete başla!"}
        this.setState({greetingMessage:greetingMessage});
      }
    }
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
          this.setState({greetingMessage:responseJson.greeting,userData:responseJson});
         //alert(JSON.stringify(responseJson))

     })
  }

componentWillMount() {
  this.greetingMounted=true;

}
componentWillUnmount() {

  //
}


  render() {

    const buttonHeight = this.state.animatedButton.interpolate({
      inputRange: [0, 1],
      outputRange: [0, 40]
    })

    const bubbleWidth = this.state.animatedBubble.interpolate({
      inputRange: [0, 1],
      outputRange: [0, Dimensions.get('window').width-85]
    })


    return (

      <Image source={require('../static/images/splash4.png')} style={styles.container}>
        <ScrollView>
        <View style={{borderBottomWidth:0,borderColor:'#1194F7',marginBottom:20}}>
          <View style={{padding:Dimensions.get('window').height/50,flexDirection:'row',justifyContent:'space-between',paddingLeft:0,marginBottom:5,alignSelf:'stretch'}}>
            <Image style={{height:40,width:40, borderRadius:20,marginRight:10,marginLeft:10}} source={require('../static/images/anneLogo3.png')}>
            </Image>
            <Animated.View style={{borderRadius:10,backgroundColor:'rgba(0, 0, 0, 0.5)',padding:10,width:Dimensions.get('window').width-85}}>
              <Text style={{fontSize:16,color:'white'}}>
                {this.state.greetingMessage}
              </Text>

            </Animated.View>

          </View>

          <View style={[styles.buttonswrap]}>
            <Animated.View style={[styles.button1,{height:40,opacity:this.state.buttonOpacity}]} >
              <TouchableOpacity onPress={() => {this.navigateto('Chat')}}>
                <View style={{flexDirection:'row',justifyContent:'center'}}>
                  <Text style={styles.buttontext1}>Fal Baktır </Text>
                  <Icon name="comments" size={24} color="salmon" />
                </View>
              </TouchableOpacity>
            </Animated.View>
            <Animated.View style={[styles.button2,{height:40,opacity:this.state.buttonOpacity}]} >
              <TouchableOpacity onPress={() => {this.navigateto('Odeme')}}>
                <View style={{flexDirection:'row',justifyContent:'center'}}>
                  <Text style={styles.buttontext2}>Kredi al  </Text>
                  <Image source={require('../static/images/coins.png')} style={{width:20, height: 20}}/>
                </View>
              </TouchableOpacity>
            </Animated.View>


          </View>
        </View>
        <View style={{elevation:3,paddingTop:15,backgroundColor:'white',flexDirection:'column'}}>
          <View style={{alignSelf:'center',marginBottom:3,width:64,height:64,borderRadius:32,borderColor:'#1194F7',borderWidth:1,paddingTop:1,alignItems:'center'}}>
            <Image style={{height:60,width:60, borderRadius:30}} source={{uri:this.state.profPhoto}}></Image>
          </View>
          <Text style={{alignSelf:'center',marginBottom:5,fontWeight:'bold',color:'black',fontSize:16}}>{this.state.userName}</Text>

          <UserData userData={this.state.userData} setDestination={(destination) =>{this.navigateto(destination)}}/>

        </View>
        {this.state.userData!==null ? (
          <View style={{padding:5,alignSelf:'stretch',flexDirection:'row',marginBottom:5,height:30,backgroundColor:'rgba(0, 0, 0, 0.5)'}}>
            <TouchableHighlight onPress={() => {this.navigateto("About")}} style={{flex:1,borderColor:'white',borderRightWidth:3}}><Text style={{textAlign:'center',fontSize:16,color:'white'}}>Hakkında & Ayarlar</Text></TouchableHighlight>
              <TouchableHighlight onPress={() => {this.navigateto("Kimiz")}} style={{flex:1}}><Text style={{textAlign:'center',fontSize:16,color:'white'}}>Biz Kimiz?</Text></TouchableHighlight>
          </View>
        ) : (<View/>)}

        </ScrollView>
      </Image>

    );
  }
}




const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems:'center',
    alignSelf: 'stretch',
    width: null,
    padding:5,
    paddingBottom:0,
    paddingTop:0,
  },
  fbloginbutton:{
    justifyContent:'center',
  },
  button1:{
    backgroundColor:'#1194F7',

    width:Dimensions.get('window').width/2,
    justifyContent:'center',
    elevation:6,
    marginBottom:15
  },
  button2:{
    backgroundColor:'#1194F7',
    width:Dimensions.get('window').width/3,
    justifyContent:'center',
    elevation:6
  },
  buttonswrap:{
    justifyContent:'center',
    alignItems:'center',
    flexDirection:'column',
  },
  buttontext1:{
    color:'white',
    fontWeight:'bold',
    textAlign:'center',
    fontSize:22
  },
  buttontext2:{
    color:'white',
    fontWeight:'bold',
    textAlign:'center',
    fontSize:16
  }
});
