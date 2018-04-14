import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  Image,
  ScrollView,
} from 'react-native';

import firebase from 'firebase';
import Backend from '../Backend';
import { NavigationActions } from 'react-navigation'


export default class FalPuan extends React.Component {
  constructor(props) {
      super(props);
      this.state = {
        timer:null,
    };
  }

  static navigationOptions = {
      header:null
  };





  componentDidMount() {
    
  }
  componentDidUpdate() {

  }

  componentWillUnmount() {


  }


  render() {


    return (
      <ImageBackground source={require('../static/images/splashscreenfinal.jpg')} style={{ flex:1,justifyContent:'center' }}>
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
       </ImageBackground>

    );
  }
}




const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignSelf: 'stretch',
    width: null,
    alignItems:'center',
    paddingRight:10,
    paddingLeft:10,

  },

});
