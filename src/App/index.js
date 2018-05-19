import React, { Component } from 'react';
import { init, createTables, notesExist } from '../services/Db';
import Setup from '../Setup';
import Password from '../Password';
import Notes from '../Notes';
import './App.css';

class App extends Component {
  constructor(...args) {
    super(...args);

    this.state = {
      loaded: false,
      setupRequired: false,
      password: null
    };

    this.setPassword = this.setPassword.bind(this);
    this.unsetPassword = this.unsetPassword.bind(this);
  }
  async componentDidMount() {
    init();
    await createTables();
    let setupRequired = await notesExist() === false;
    let requestPassword = !setupRequired;
    this.setState({
      loaded: true,
      setupRequired,
      requestPassword
    });
  }

  setPassword(password) {
    this.setState({
      setupRequired: false,
      requestPassword: false,
      password
    });
  }
  unsetPassword() {
    this.setState({
      requestPassword: true,
      password: null
    });
  }
  render() {
    let { setupRequired, requestPassword, password, loaded } = this.state;

    if (!loaded) return <div>Loading</div>;

    return (
      <div className="App">
        { setupRequired ? <Setup onComplete={ this.setPassword } /> : null }
        { requestPassword ? <Password onComplete={ this.setPassword } /> : null }
        { password ? <Notes password={password} onAuthenticationError={ this.unsetPassword } /> : null }
      </div>
    );
  }
}

export default App;
