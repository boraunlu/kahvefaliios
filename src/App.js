import React from 'react';
import {
  Platform,
  AppRegistry
} from 'react-native';


import codePush from "react-native-code-push";

import Login from './screens/Login';
import Chat from './screens/Chat';
import ChatOld from './screens/ChatOld';
import ChatBizden from './screens/ChatBizden';
import Home from './screens/Home';
import Odeme from './screens/Odeme';
import Greeting from './screens/Greeting';
import Kimiz from './screens/Kimiz';
import Mesajlar from './screens/Mesajlar';
import Swipers from './screens/Swipers';
import Profil from './screens/Profil';

import { StackNavigator, TabNavigator,addNavigationHelpers } from 'react-navigation';

const MainScreenNavigator = TabNavigator({
  Greeting: {screen:Greeting},
  Mesajlar: {screen:Mesajlar},
  Odeme: {screen:Odeme},
  Profil: {screen:Profil},
},{
  lazy:true
});

let kahvefaliapp = StackNavigator({
    Home: {screen:Home},
    Login: { screen: Login },
    Greeting: { screen: MainScreenNavigator },
    Kimiz: { screen: Kimiz },
    Chat: {screen:Chat},
    ChatOld: {screen:ChatOld},
    ChatBizden: {screen:ChatBizden},
    Swipers: {screen:Swipers},
});



kahvefaliapp = codePush(kahvefaliapp)

AppRegistry.registerComponent('kahvefaliios', () => kahvefaliapp);
