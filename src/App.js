import React, { Component } from 'react';
import {
  Platform,
  AppRegistry,

} from 'react-native';


import codePush from "react-native-code-push";

import Login from './screens/Login';
import Chat from './screens/Chat';
import ChatOld from './screens/ChatOld';
import ChatBizden from './screens/ChatBizden';
import ChatAgent from './screens/ChatAgent';
import ChatFalsever from './screens/ChatFalsever';
import Social from './screens/Social';
import SocialFal from './screens/SocialFal';
import Home from './screens/Home';
import Odeme from './screens/Odeme';
import Greeting from './screens/Greeting';
import Kimiz from './screens/Kimiz';
import Mesajlar from './screens/Mesajlar';
import Swipers from './screens/Swipers';
import Profil from './screens/Profil';
import FalPuan from './screens/FalPuan';
import Leader from './screens/Leader';

import { StackNavigator, TabNavigator,addNavigationHelpers } from 'react-navigation';
import { Provider } from 'mobx-react';
import stores from './stores';

const MainScreenNavigator = TabNavigator({
  Greeting: {screen:Greeting},
  Social: {screen:Social},
  Mesajlar: {screen:Mesajlar},
  Odeme: {screen:Odeme},
  Profil: {screen:Profil},

},{
  tabBarOptions: {
   activeTintColor: 'teal',
 },

});

let KahvefaliappNav = StackNavigator({
    Home: {screen:Home},
    Login: { screen: Login },
    Greeting: { screen: MainScreenNavigator },
    Kimiz: { screen: Kimiz },
    Chat: {screen:Chat},
    ChatOld: {screen:ChatOld},
    SocialFal: {screen:SocialFal},
    ChatBizden: {screen:ChatBizden},
    ChatAgent: {screen:ChatAgent},
    ChatFalsever: {screen:ChatFalsever},
    Swipers: {screen:Swipers},
    FalPuan: {screen:FalPuan},
    Leader: {screen:Leader},
});

export default class Kahvefaliapp extends Component {
  render() {
    return (
      <Provider {...stores}>
        <KahvefaliappNav />
      </Provider>
    );
  }
}

Kahvefaliapp = codePush(Kahvefaliapp)

AppRegistry.registerComponent('kahvefaliios', () => Kahvefaliapp);
