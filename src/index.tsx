import * as React from 'react';
import * as ReactDOM from 'react-dom';
import App from './App';
import {Store} from './Store';
import './index.css';

const store = new Store();

ReactDOM.render(
  <App store={store}/>,
  document.getElementById('root') as HTMLElement
);
