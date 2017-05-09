import React from 'react';
import {
  Platform,
  AppRegistry
} from 'react-native';



import Login from './screens/Login';
import Chat from './screens/Chat';
import Home from './screens/Home';
import Odeme from './screens/Odeme';
import Greeting from './screens/Greeting';
import About from './screens/About';

import codePush from "react-native-code-push";


import { StackNavigator, addNavigationHelpers } from 'react-navigation';

let kahvefaliapp = StackNavigator({

  Home: {screen:Home},
  Greeting: {screen:Greeting},
  Login: { screen: Login },
    Chat: {screen:Chat},

  Odeme: {screen:Odeme},
  About: {screen:About},

});

kahvefaliapp = codePush(kahvefaliapp)

AppRegistry.registerComponent('kahvefaliios', () => kahvefaliapp);
