// NotificationIcon.js
import React from 'react';
import { Text, Image, View } from 'react-native';
import { observable } from 'mobx';
import { observer, inject } from 'mobx-react';
import Icon from 'react-native-vector-icons/FontAwesome';
import PropTypes from 'prop-types';

@inject("socialStore")
@inject("userStore")
@observer
export default class NotificationIcon extends React.Component {
  constructor(props) {
    // anything you need in the constructor
    super(props);
  }

  render() {
    let  totalNoti  = this.props.socialStore.totalNoti+this.props.userStore.aktifUnread;

   // below is an example notification icon absolutely positioned
    return (
      <View style={{
        zIndex: 0,
        flex: 1,
        alignSelf: 'stretch',
        justifyContent: 'space-around',
        alignItems: 'center'}}>
       <Icon name="comments" color={this.props.tintColor} size={25} />
       {totalNoti > 0 ?
        <View style={{
          position: "absolute",
          alignItems:'center',
          justifyContent:'center',
          top: 5,
          right: 15,
          height:16,
          width:16,
          borderRadius: 8,
          backgroundColor: 'red',
          zIndex: 2}}>
          <Text style={{color:'white',fontWeight:'bold',fontSize:9,textAlign:'center',backgroundColor:'transparent'}}>{totalNoti}</Text>
        </View>
        : undefined}
      </View>
    );
}
}
