
import React, { Component } from 'react';
import {
  Dimensions,
  StyleSheet,
  Text,
  TouchableHighlight,
  Image,
  View
} from 'react-native';
import PropTypes from 'prop-types';
import Camera from 'react-native-camera';
import Icon from 'react-native-vector-icons/FontAwesome';

export default class CameraPick extends Component {
  constructor(props) {
    super(props);
    this.state = {
      cameratype:"back",
    };
  }

  render() {
    return (
      <View style={styles.container}>
        <Camera
          ref={(cam) => {
            this.camera = cam;
          }}
          captureQuality={"medium"}
          style={styles.preview}
          captureTarget={Camera.constants.CaptureTarget.disk}
          aspect={Camera.constants.Aspect.fill}
          type={this.state.cameratype}
          >
          <TouchableHighlight onPress={this.switchCamera.bind(this)} style={{backgroundColor:'white',height:60,width:60,position:'absolute',top:25,right:25}}><Image source={require('../static/images/front_camera.png')} style={{resizeMode:'stretch',height:60,width:60}}></Image></TouchableHighlight>
          <Text style={styles.capture} onPress={this.takePicture.bind(this)}><Icon name="camera" color="black" size={30} /></Text>
        </Camera>
      </View>
    );
  }

  takePicture() {
    this.camera.capture()
      .then((data) =>this.props.sendCapturedImage(data))
      .catch(err => console.error(err));
  }
  switchCamera() {
    if(this.state.cameratype=='back'){
      this.setState({cameratype:'front'})
    }
    else {
      this.setState({cameratype:'back'})
    }


  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  preview: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    height: Dimensions.get('window').height,
    width: Dimensions.get('window').width
  },
  capture: {
    flex: 0,

    backgroundColor: '#fff',
    borderRadius: 5,
    padding: 15,
    margin: 40
  }
});
