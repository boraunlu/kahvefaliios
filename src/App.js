import React, { Component } from 'react';
import {
  Platform,
  AppRegistry,

} from 'react-native';


import codePush from "react-native-code-push";
import firebase from 'react-native-firebase';

import Login from './screens/Login';
import Chat from './screens/Chat';
import ChatOld from './screens/ChatOld';
import ChatBizden from './screens/ChatBizden';
import ChatAgent from './screens/ChatAgent';
import ChatFalsever from './screens/ChatFalsever';
import Social from './screens/Social';
import SocialFal from './screens/SocialFal';
import GunlukFal from './screens/GunlukFal';
import Home from './screens/Home';
import Odeme from './screens/Odeme';
import Greeting from './screens/Greeting';
import Kimiz from './screens/Kimiz';
import Mesajlar from './screens/Mesajlar';
import Swipers from './screens/Swipers';
import Profil from './screens/Profil';
import FalPuan from './screens/FalPuan';
import FalPaylas from './screens/FalPaylas';
import Leader from './screens/Leader';

import { StackNavigator, TabNavigator,addNavigationHelpers } from 'react-navigation';
import { Provider } from 'mobx-react';
import stores from './stores';

function getCurrentRouteName(navigationState) {
  if (!navigationState) {
    return null;
  }
  const route = navigationState.routes[navigationState.index];
  // dive into nested navigators
  if (route.routes) {
    return getCurrentRouteName(route);
  }
  return route.routeName;
}

const MainScreenNavigator = TabNavigator({
  Greeting: {screen:Greeting},
  Social: {screen:Social},
  Mesajlar: {screen:Mesajlar},
  Odeme: {screen:Odeme},
  Profil: {screen:Profil},

},{
  tabBarOptions: {
   activeTintColor: 'rgb(36, 20, 102)',
 },

});

let KahvefaliappNav = StackNavigator({
    Home: {screen:Home},
    Login: { screen: Login },
    Greeting: { screen: MainScreenNavigator },
    Kimiz: { screen: Kimiz },
    Chat: {screen:Chat},
    ChatOld: {screen:ChatOld},
    ChatBizden: {screen:ChatBizden},
    ChatAgent: {screen:ChatAgent},
    ChatFalsever: {screen:ChatFalsever},
    SocialFal: {screen:SocialFal},
    GunlukFal: {screen:GunlukFal},
    Swipers: {screen:Swipers},
    FalPuan: {screen:FalPuan},
    FalPaylas: {screen:FalPaylas},
    Leader: {screen:Leader},
});

export default class Kahvefaliapp extends Component {
  render() {
    return (
      <Provider {...stores}>
        <KahvefaliappNav       onNavigationStateChange={(prevState, currentState) => {
                 const currentScreen = getCurrentRouteName(currentState);
                 const prevScreen = getCurrentRouteName(prevState);

                 if (prevScreen !== currentScreen) {
                   // the line below uses the Google Analytics tracker
                   // change the tracker here to use other Mobile analytics SDK.
                   firebase.analytics().setCurrentScreen(currentScreen);
                 }
               }}
               />
      </Provider>
    );
  }
}

Kahvefaliapp = codePush(Kahvefaliapp)

AppRegistry.registerComponent('kahvefaliios', () => Kahvefaliapp);
