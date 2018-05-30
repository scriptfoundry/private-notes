import React from 'react';
import PropTypes from 'prop-types';
import { classNames } from '../services/Utils';

const ErrorDialog = ({ error }) => {
    if (!error) return null;

    let { message, handlers } = error;
    let buttons = Object.keys(handlers).map((label) => <button key={label} onClick={ handlers[label] }>{ label }</button>);
    return (<div className="error-dialog dialog">
        <div className="box">
            <h1>Error</h1>
            <p>{ message }</p>
            { buttons }
        </div>
    </div>);
};

ErrorDialog.propTypes = {
    error: PropTypes.shape({
        message: PropTypes.string.isRequired,
        handlers: PropTypes.object.isRequired
    })
};

export default ErrorDialog;