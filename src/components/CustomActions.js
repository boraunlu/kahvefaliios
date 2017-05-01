import React from 'react';
import {
  Modal,
  StyleSheet,
  TouchableOpacity,
  View,
  Text,
} from 'react-native';

import CameraRollPicker from 'react-native-camera-roll-picker';
import Camera from './CameraPick';
import NavBar, { NavButton, NavButtonText, NavTitle } from 'react-native-nav';
import Icon from 'react-native-vector-icons/FontAwesome';

export default class CustomActions extends React.Component {
  constructor(props) {
    super(props);
    this._images = [];
    this.state = {
      pickerVisible: false,
      cameraVisible: false,
    };
    this.onActionsPress = this.onActionsPress.bind(this);
    this.selectImages = this.selectImages.bind(this);
  }

  setImages(images) {
    this._images = images;
  }

  getImages() {
    return this._images;
  }

  setPickerVisible(visible = false) {
    this.setState({pickerVisible: visible});
  }

  setCameraVisible(visible = false) {
    this.setState({cameraVisible: visible});
  }

  onActionsPress() {
    const options = ['Çekilmiş Fotoğraflarından Seç', 'Yeni Fotoğraf Çek', 'İptal'];
    const cancelButtonIndex = options.length - 1;
    this.context.actionSheet().showActionSheetWithOptions({
      options,
      cancelButtonIndex,
    },
    (buttonIndex) => {
      switch (buttonIndex) {
        case 0:
          this.setPickerVisible(true);
          break;
        case 1:
          this.setCameraVisible(true);
          break;
        default:
      }
    });
  }

  selectImages(images) {
    this.setImages(images);
  }
  sendCapturedImage(image){
    var imageobj ={"image":image.path}
    var imagearray=[imageobj];
    this.props.onSend(imagearray)
    this.setCameraVisible(false);
  }

  renderNavBar() {
    return (
      <NavBar style={{
        statusBar: {
          backgroundColor: '#FFF',
          height:30
        },
        navBar: {
          backgroundColor: '#FFF',

        },
      }}>
        <NavButton onPress={() => {
          this.setPickerVisible(false);
        }}>
          <NavButtonText style={{
            color: '#000',
            fontSize:26
          }}>
            {'<'}
          </NavButtonText>
        </NavButton>
        <NavTitle style={{
          color: '#000',
        }}>
          {'Fotoğraflarım'}
        </NavTitle>
        <NavButton onPress={() => {
          this.setPickerVisible(false);

          const images = this.getImages().map((image) => {
            return {
              image: image.uri,
            };
          });
          this.props.onSend(images);
          console.log("imajlar"+JSON.stringify(images))
          this.setImages([]);
        }}>
          <NavButtonText style={{
            color: '#000',
          }}>
            {'Gönder'}
          </NavButtonText>
        </NavButton>
      </NavBar>
    );
  }

  renderIcon() {


    /*if (this.props.icon) {
      return this.props.icon();
    }*/
    return (
      <View
        style={[styles.wrapper, this.props.wrapperStyle]}
      >
      <Icon name="camera" color="#b2b2b2" size={15} />

      </View>
    );
  }

  render() {
    return (
      <TouchableOpacity
        style={[styles.container, this.props.containerStyle]}
        onPress={this.onActionsPress}
      >
        <Modal
          animationType={'slide'}
          transparent={false}
          visible={this.state.pickerVisible}
          onRequestClose={() => {
            this.setPickerVisible(false);
          }}
        >
          {this.renderNavBar()}
          <CameraRollPicker
            maximum={10}
            imagesPerRow={4}
            callback={this.selectImages}
            selected={[]}
          />
        </Modal>
        <Modal
          animationType={'slide'}
          transparent={false}
          visible={this.state.cameraVisible}
          onRequestClose={() => {
            this.setCameraVisible(false);
          }}
        >
           <Camera
            sendCapturedImage={(image) => { this.sendCapturedImage(image)}}
          />
        </Modal>
        {this.renderIcon()}
      </TouchableOpacity>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    width: 26,
    height: 26,
    marginLeft: 10,
    marginBottom: 10,
  },
  wrapper: {
    borderRadius: 13,
    borderColor: '#b2b2b2',
    borderWidth: 2,
    flex: 1,
    alignItems:'center',
    paddingTop:3
  },
  iconText: {
    color: '#b2b2b2',
    fontWeight: 'bold',
    fontSize: 16,
    backgroundColor: 'transparent',
    textAlign: 'center',
  },
});

CustomActions.contextTypes = {
  actionSheet: React.PropTypes.func,
};

CustomActions.defaultProps = {
  onSend: () => {},
  options: {},
  icon: null,
  containerStyle: {},
  wrapperStyle: {},
  iconTextStyle: {},
};

CustomActions.propTypes = {
  onSend: React.PropTypes.func,
  options: React.PropTypes.object,
  icon: React.PropTypes.func,
  containerStyle: View.propTypes.style,
  wrapperStyle: View.propTypes.style,
  iconTextStyle: Text.propTypes.style,
};
