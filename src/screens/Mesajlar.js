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



export default class Mesajlar extends React.Component {
  constructor(props) {
    super(props);
    this.state = {

  };
}

  static navigationOptions = {
      title: 'Mesajların',
      tabBarLabel: 'Mesajlar',
       tabBarIcon: ({ tintColor }) => (
         <Icon name="comments" color={tintColor} size={25} />
       ),
    };


  componentDidMount() {

  }

  componentWillUnmount() {


  }


  render() {


    return (
      <Image source={require('../static/images/splash4.png')} style={styles.container}>

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
