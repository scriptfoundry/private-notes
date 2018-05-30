import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import registerServiceWorker from './registerServiceWorker';
import { getUrl, load } from './services/File';

ReactDOM.render(<App />, document.getElementById('root'));
registerServiceWorker();
