import React, { Component } from 'react';
import { Button,ScrollView,Animated, Dimensions, Image,Text,TouchableHighlight, TouchableOpacity, View , StyleSheet} from 'react-native';


class Element extends Component {


  constructor(props) {
    super(props);

  }

  render(){
    return(
      <TouchableOpacity style={{alignSelf:'stretch',padding:0, borderTopWidth:1, borderColor:'black'}} onPress={() => {this.props.sendPayload(this.props.payload)}}>
        <View style={{alignSelf:'stretch',padding:0,flexDirection:'row',justifyContent:'space-between'}}>
          <Image source={{ uri: this.props.image}} style={{height:75,width:75}} ></Image>
          <View style={{alignSelf:'stretch',padding:5,paddingTop:15,paddingBottom:15,flexDirection:'column',justifyContent:'space-around',flexGrow:2}}>
            <Text style={{fontWeight:'bold',fontSize:17}}>{this.props.title}</Text>
            <Text style={{}}>{this.props.subtitle}</Text>
          </View>
          <View style={{paddingTop:20,paddingRight:8}}>
            <Button title={"Seç"} onPress={() => {this.props.sendPayload(this.props.payload)}}/>
          </View>
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
      height: this.props.modalVisible ? this.props.keyboardHeight : 0,
     };

    return (


          <View style={[styles.container, containerHeight]}>
             <View style={[styles.innerContainer]}>
                 <ScrollView contentContainerStyle={styles.scrollcontainer}>
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
