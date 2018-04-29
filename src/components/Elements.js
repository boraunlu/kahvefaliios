import React, { Component } from 'react';
import { Button,ScrollView,Animated, Dimensions, Image,Text,TouchableHighlight, TouchableOpacity, View , StyleSheet} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import PropTypes from 'prop-types';

class Element extends Component {


  constructor(props) {
    super(props);

  }

  render(){
    return(
      <TouchableOpacity style={{alignSelf:'stretch',padding:0, width:200,borderWidth:1, borderColor:'black'}} onPress={() => {this.props.sendPayload(this.props.payload,this.props.image)}}>
        <View style={{height:230,justifyContent:'space-between'}}>
          <Image source={{ uri: this.props.image}} style={{height:120,width:198}} ></Image>
          <View style={{padding:5,flexDirection:'column'}}>
            <Text style={{textAlign:'center',fontWeight:'bold',fontSize:17}}>{this.props.title}</Text>
            <Text style={{textAlign:'center'}}>{this.props.subtitle}</Text>
          </View>

          <Button title={"Seç"} onPress={() => {this.props.sendPayload(this.props.payload,this.props.image)}}/>

        </View>
      </TouchableOpacity>
    )
  }
}


export default class ChatModal extends Component {


  constructor(props) {
    super(props);

  }



  render() {

    var containerHeight = {
      height: this.props.modalVisible ? 270 : 0,
     };

    return (


          <View style={[styles.container, containerHeight]}>
             <View style={[styles.innerContainer]}>
                <View style={{height:20,alignItems:'center'}}>
                  <Text><Icon name="chevron-left" size={18} color="#1194F7" />  Sağa Sola Kaydırabilirsin  <Icon name="chevron-right" size={18} color="#1194F7" /></Text>
                </View>
                 <ScrollView horizontal={true} contentContainerStyle={styles.scrollcontainer}>

                   {this.props.elements.map(function(element, index) {
                     return (

                       <Element
                         //onScoreChange={function(delta) {this.onScoreChange(index ,delta)}.bind(this)}
                         //onRemove={function() {this.onRemovePlayer(index)}.bind(this)}
                         image={element.image_url}
                         title={element.title}
                         subtitle={element.subtitle}
                         sendPayload={this.props.sendPayload}
                         payload={element.buttons[0]}
                         key={index} />
                     );
                   }.bind(this))}
                 </ScrollView>
             </View>
           </View>

    );
  }
}

var styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 0,
    flexDirection: 'column-reverse',
    width: Dimensions.get('window').width,
    position:'absolute',
    bottom:0

  },
  innerContainer: {
    borderTopWidth:1,
    borderColor:'black',
    backgroundColor:'white',
    flexDirection:'column',
  },
  row: {
    alignSelf:'stretch',
    flex: 1,
    flexDirection: 'row',
    justifyContent:'space-around',
    marginBottom: 20,
  },
  rowTitle: {
    flex: 1,
    fontWeight: 'bold',
  },
  buttonText: {
    fontSize: 18,
    margin: 5,
    textAlign: 'center',
  },
  scrollcontainer:{

  },
  modalButton: {
    marginTop: 5,
    width:15,
    height:15,
  },
  pickerItem: {
    fontSize: 16,
  },
});
