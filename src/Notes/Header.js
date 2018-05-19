import React from 'react';
import PropTypes from 'prop-types';


const Header = ({ onCreateNote }) => (<div className="header">
    <button className="button" onClick={ onCreateNote }>New note</button>
</div>);

Header.propTypes = {
    onCreateNote: PropTypes.func.isRequired
};

export default Header;