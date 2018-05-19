import React from 'react';
import PropTypes from 'prop-types';

const SetupForm = ({ confirmRef, inputRef, type, toggle, onChange, submit, valid }) => {
    return <div className="container setup">
        <h1>Set a password</h1>
        <div className="button-group">
            <input ref={ inputRef } type={ type } tabIndex={1} onKeyUp={ onChange } />
            <button type="button" onClick={ toggle }>👁</button>
        </div>
        <div className="button-group">
            <input ref={ confirmRef } type={ type } tabIndex={2} onKeyUp={ onChange } />
            <button type="button" onClick={ submit } disabled={ !valid }>✓</button>
        </div>
        <p>You can set your password to anything with more than three characters. Be sensible. It should be easy to remember but very hard for someone to guess.</p>
    </div>;
};

SetupForm.propTypes = {
    confirmRef: PropTypes.object,
    inputRef: PropTypes.object,
    type: PropTypes.oneOf(['password', 'text']).isRequired,
    toggle: PropTypes.func.isRequired,
    onChange: PropTypes.func.isRequired,
    submit: PropTypes.func.isRequired,
    valid: PropTypes.bool.isRequired
};

export default SetupForm;