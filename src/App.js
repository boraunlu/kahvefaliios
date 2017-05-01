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

import { StackNavigator, addNavigationHelpers } from 'react-navigation';

const kahvefaliapp = StackNavigator({

  Home: {screen:Home},
  Greeting: {screen:Greeting},
  Login: { screen: Login },
    Chat: {screen:Chat},
  Odeme: {screen:Odeme},
  About: {screen:About},

},{ headerMode: 'screen' });



AppRegistry.registerComponent('kahvefaliios', () => kahvefaliapp);
