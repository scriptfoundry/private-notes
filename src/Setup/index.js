import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Form from './Form';
import './Setup.css';

class Setup extends Component {
    constructor(...args) {
        super(...args);

        this.state = {
            type: 'password',
            valid: false
        };

        this.inputRef = React.createRef();
        this.confirmRef = React.createRef();

        this.toggle = this.toggle.bind(this);
        this.onChange = this.onChange.bind(this);
        this.submit = this.submit.bind(this);
    }
    componentDidMount() {
        this.inputRef.current.focus();
    }
    toggle() {
        let type = this.state.type === 'password' ? 'text' : 'password';
        this.setState({ type });
    }
    getValidPassword() {
        let p1 = this.inputRef.current.value;
        let p2 = this.confirmRef.current.value;

        let valid = (p1 === p2) && p1.length > 3;
        if (valid) return p1;

        return null;
    }
    onChange({key, target}) {
        if (key === 'Enter') {
            if (target === this.inputRef.current) this.confirmRef.current.focus();
            else this.submit();
        }

        this.setState({ valid: this.getValidPassword() !== null });
    }
    submit() {
        let password = this.getValidPassword();
        if (password) this.props.onComplete(password);
    }
    render() {
        return <Form
            type={ this.state.type }
            valid={ this.state.valid }
            onChange={ this.onChange }
            inputRef={ this.inputRef }
            confirmRef={ this.confirmRef }
            toggle={ this.toggle }
            submit={ this.submit }
        />;
    }
}
Setup.propTypes = {
    onComplete: PropTypes.func.isRequired
};

export default Setup;
