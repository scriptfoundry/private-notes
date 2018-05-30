import React from 'react';
import PropTypes from 'prop-types';

const SetupForm = ({ classNames, entropyLabel, confirmRef, inputRef, type, toggle, onChange, submit, valid, onCancel }) => {
    return <div className={`setup ${ classNames }`}>
        <div className="box">
            <h1>Set a password</h1>
            { onCancel ? <div className="close-button" onClick={ onCancel }>✕</div> : null }
            <div className="button-group">
                <input ref={ inputRef } type={ type } tabIndex={1} onKeyUp={ onChange } />
                <button type="button" onClick={ toggle }>👁</button>
            </div>
            <div className="button-group">
                <input ref={ confirmRef } type={ type } tabIndex={2} onKeyUp={ onChange } />
                <button type="button" onClick={ submit } disabled={ !valid }>✓</button>
            </div>
            <p>You can set your password to anything with more than three characters. Be sensible. It should be easy to remember but very hard for someone to guess.</p>
            <p>{ entropyLabel ? `Right now, your password is ${ entropyLabel }` : 'Start typing a password' }</p>
        </div>
    </div>;
};

SetupForm.propTypes = {
    classNames: PropTypes.string,
    entropyLabel: PropTypes.string,
    confirmRef: PropTypes.object,
    inputRef: PropTypes.object,
    type: PropTypes.oneOf(['password', 'text']).isRequired,
    toggle: PropTypes.func.isRequired,
    onChange: PropTypes.func.isRequired,
    onCancel: PropTypes.func,
    submit: PropTypes.func.isRequired,
    valid: PropTypes.bool.isRequired
};
SetupForm.defaultProps = {
    classNames: ''
};

export default SetupForm;