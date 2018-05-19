import React, { Component, createRef } from 'react';
import PropTypes from 'prop-types';

import './Password.css';

class Password extends Component {
    constructor(...args) {
        super(...args);
        this.inputRef = createRef();

        this.onKeyUp = this.onKeyUp.bind(this);
        this.login = this.login.bind(this);
    }
    componentDidMount() {
        this.inputRef.current.focus();
    }
    onKeyUp({key}) {
        if (key === 'Enter') this.login();
    }
    login() {
        this.props.onComplete(this.inputRef.current.value);
    }
    render() {
        return <div className="password">
            <input ref={ this.inputRef } type="password" onKeyUp={this.onKeyUp} />
            <button onClick={ this.login }>Login</button>
        </div>;
    }
}

Password.propTypes = {
    onComplete:PropTypes.func.isRequired
};

export default Password;