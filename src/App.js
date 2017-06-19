import React from 'react';
import {
  Platform,
  AppRegistry
} from 'react-native';


import codePush from "react-native-code-push";

import Login from './screens/Login';
import Chat from './screens/Chat';
import Home from './screens/Home';
import Odeme from './screens/Odeme';
import Greeting from './screens/Greeting';
import About from './screens/About';
import Kimiz from './screens/Kimiz';
import Swipers from './screens/Swipers';
import Profil from './screens/Profil';

import { StackNavigator, TabNavigator,addNavigationHelpers } from 'react-navigation';

const MainScreenNavigator = TabNavigator({
  Greeting: {screen:Greeting},
  Kimiz: { screen: Kimiz },
  Odeme: {screen:Odeme},
  About: {screen:About},
  Profil: {screen:Profil},
},{

});

let kahvefaliapp = StackNavigator({
    Home: {screen:Home},
  Login: { screen: Login },

  Greeting: { screen: MainScreenNavigator },

    Kimiz: { screen: Kimiz },
    Chat: {screen:Chat},
Swipers: {screen:Swipers},



});



kahvefaliapp = codePush(kahvefaliapp)

AppRegistry.registerComponent('kahvefaliios', () => kahvefaliapp);
