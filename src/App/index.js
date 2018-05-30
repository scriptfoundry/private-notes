import React, { Component } from 'react';
import { init, notesExist } from '../services/Db';
import Setup from '../Setup';
import Password from '../Password';
import Notes from '../Notes';
import './App.css';

const initialState = {
  loaded: false,
  setupRequired: false,
  password: null
};

class App extends Component {
  constructor(...args) {
    super(...args);

    this.state = {...initialState};

    this.setPassword = this.setPassword.bind(this);
    this.unsetPassword = this.unsetPassword.bind(this);
    this.resetApp = this.resetApp.bind(this);
  }
  async componentDidMount() {
    await init();
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
  resetApp() {
    this.setState({...initialState}, () => this.componentDidMount());
  }
  render() {
    let { setupRequired, requestPassword, password, loaded } = this.state;

    if (!loaded) return <div>Loading</div>;

    return (
      <div className="App">
        { setupRequired ? <Setup classNames='container' onComplete={ this.setPassword } /> : null }
        { requestPassword ? <Password onComplete={ this.setPassword } /> : null }
        { password ? <Notes password={password} onAuthenticationError={ this.unsetPassword } onChangePassword={ this.setPassword } onLogout={ this.resetApp } /> : null }
      </div>
    );
  }
}

export default App;
