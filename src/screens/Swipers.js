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
  ActivityIndicator
} from 'react-native';


import { NavigationActions } from 'react-navigation'

import Swiper from 'react-native-swiper';

export default class Swipers extends React.Component {
  constructor(props) {
    super(props);
    this.state = {

  };
}

static navigationOptions = {
      header:null
  };

  _navigateTo = (routeName: string,params) => {
      const resetAction = NavigationActions.reset({
        index: 0,
        actions: [NavigationActions.navigate({ routeName,params: params })]
      })
      this.props.navigation.dispatch(resetAction)
    }

  componentDidMount() {

  }

  componentWillUnmount() {


  }


  render() {


    return (
      <Swiper style={styles.wrapper} loop={false} ref="sliderX" showsButtons={true}>
         <View style={styles.slide1}>
           <Image source={require('../static/images/swipe1.png')} resizeMode={'cover'} style={styles.covers}><TouchableHighlight style={{flex:1}} onPress={() => {this.refs.sliderX.scrollBy(1);}}><View></View></TouchableHighlight></Image>
         </View>
         <View style={styles.slide2}>
           <Image source={require('../static/images/swipe2.png')} resizeMode={'cover'} style={styles.covers}><TouchableHighlight style={{flex:1}} onPress={() => {this.refs.sliderX.scrollBy(1)}}><View></View></TouchableHighlight></Image>
         </View>
         <View style={styles.slide3}>
           <Image source={require('../static/images/swipe3.png')} resizeMode={'cover'} style={styles.covers}><TouchableHighlight style={{flex:1}} onPress={() => {this._navigateTo('Greeting');}}><View></View></TouchableHighlight></Image>
         </View>
       </Swiper>
    );
  }
}

const styles = StyleSheet.create({
  wrapper: {
  },
  covers:{
    flex: 1,
    alignSelf: 'stretch',
    width: null,
  },
  slide1: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#9DD6EB',
  },
  slide2: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#97CAE5',
  },
  slide3: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#92BBD9',
  },
  text: {
    color: '#fff',
    fontSize: 30,
    fontWeight: 'bold',
  }
})
