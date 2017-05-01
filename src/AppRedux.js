import React from 'react';
import {
  Platform,
  AppRegistry
} from 'react-native';

import { createStore, applyMiddleware, combineReducers } from 'redux';
import { Provider } from 'react-redux';
import thunk from 'redux-thunk';
import { connect } from 'react-redux';


import Login from './screens/Login';
import Chat from './screens/Chat';
import Home from './screens/Home';
import Odeme from './screens/Odeme';
import Greeting from './screens/Greeting';
import About from './screens/About';

import { StackNavigator, addNavigationHelpers } from 'react-navigation';

const AppNavigator = StackNavigator({

  Home: {screen:Home},
  Login: { screen: Login },
    Chat: {screen:Chat},
  Greeting: {screen:Greeting},
  Odeme: {screen:Odeme},
  About: {screen:About},

});

const navReducer = (state, action) => {
  const newState = AppNavigator.router.getStateForAction(action, state);
  return newState || state;
};

const appReducer = combineReducers({
  nav: navReducer,
});


class AppWithNavigationState extends React.Component {
  render() {
    return (
      <AppNavigator navigation={addNavigationHelpers({
        dispatch: this.props.dispatch,
        state: this.props.nav,
      })} />
    );
  }
}

const store = createStore(appReducer);
const mapStateToProps = (state) => {
  return {
   nav: state.nav,
 }
}


const AppWithNavigationStateConnected = connect(mapStateToProps)(AppWithNavigationState);

class kahvefaliapp extends React.Component {
  render() {
    return (
      <Provider store={store}>
        <AppWithNavigationStateConnected />
      </Provider>
    );
  }
}

AppRegistry.registerComponent('kahvefaliapp', () => kahvefaliapp);
