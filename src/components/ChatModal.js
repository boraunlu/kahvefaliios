import React, { Component } from 'react';
import { Modal, Button,ScrollView, Image,Dimensions, Text,TouchableHighlight, TouchableOpacity, View , StyleSheet} from 'react-native';


class Element extends Component {


  constructor(props) {
    super(props);

  }

  render(){
    return(
      <TouchableOpacity style={{alignSelf:'stretch',padding:5, borderTopWidth:1, borderColor:'black'}} onPress={() => {this.props.sendPayload(this.props.payload)}}>
        <View style={{alignSelf:'stretch',padding:5,flexDirection:'row'}}>
          <Image source={{ uri: this.props.image}} style={{height:60,width:60}} ></Image>
          <Text style={{lineHeight:60}}>{this.props.title}</Text>
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

    var modalBackgroundStyle = {
      backgroundColor: this.props.transparent ? 'transparent' : 'blue',
     };
     var innerContainerTransparentStyle = this.props.transparent ? {backgroundColor: 'rgba(0, 0, 0, 0.5)', padding: 10} : null;
     var activeButtonStyle = {
       backgroundColor: '#ddd'
     };


    return (

        <Modal
          animationType={"fade"}
          transparent={true}
          visible={this.props.modalVisible}
          onRequestClose={() => {}}
          >
          <View style={[styles.container, modalBackgroundStyle]}>
             <View style={[styles.innerContainer, innerContainerTransparentStyle]}>
                <View style={{flexDirection: 'row-reverse', justifyContent: 'space-between',marginBottom:5}}>


                    <Button
                      onPress={() => {this.props.setModalVisibility(false)}}
                      title="X"
                      color="#841584"
                    />

                </View>
                 <ScrollView contentContainerStyle={styles.scrollcontainer}>
                   {this.props.elements.map(function(element, index) {
                     return (

                       <Element
                         //onScoreChange={function(delta) {this.onScoreChange(index ,delta)}.bind(this)}
                         //onRemove={function() {this.onRemovePlayer(index)}.bind(this)}
                         image={element.image_url}
                         title={element.title}
                         sendPayload={this.props.sendPayload}
                         payload={element.buttons[0]}
                         key={index} />
                     );
                   }.bind(this))}
                 </ScrollView>

             </View>
             <View style={{backgroundColor:'transparent',height:100}}>
             </View>
           </View>
        </Modal>


    );
  }
}

var styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 0,
    flexDirection: 'column-reverse',
    backgroundColor:'rgba(0, 0, 0, 1)'
  },
  innerContainer: {
    height: 300,

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
