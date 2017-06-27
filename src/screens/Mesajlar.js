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


export default class Mesajlar extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      messages: null
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

  componentDidMount() {
    Backend.getLastMessages().then((snapshot) => {

        this.setState({messages:snapshot})

    })
  }

  componentWillUnmount() {


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
    else{
      var messages = this.state.messages
      return (
         Object.keys(messages).map(function (key) {
           console.log('key: ', key);  // Returns key: 1 and key: 2
           return (
             <TouchableHighlight key={key} onPress={() => {this.navigateto('ChatOld',key)}}>
               <Text>
                {falcilar[key].name+" "+messages[key].text}
               </Text>
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
  }
});
