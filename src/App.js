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

import { StackNavigator, addNavigationHelpers } from 'react-navigation';

let kahvefaliapp = StackNavigator({

  Login: { screen: Login },
  Home: {screen:Home},
  Greeting: {screen:Greeting},

    Kimiz: { screen: Kimiz },
    Chat: {screen:Chat},
Swipers: {screen:Swipers},
  Odeme: {screen:Odeme},
  About: {screen:About},

});

kahvefaliapp = codePush(kahvefaliapp)

AppRegistry.registerComponent('kahvefaliios', () => kahvefaliapp);
