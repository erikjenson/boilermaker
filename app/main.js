import React from 'react';
import ReactDOM from 'react-dom';
import store from './store';
import { Provider } from 'react-redux';
import '../public/index.css';
//this allows webpack to include index.css and add
//it to a file that will place it on the dom

ReactDOM.render(
  <Provider store={store}>{/* your app goes here! */}</Provider>,
  document.getElementById('app')
);
