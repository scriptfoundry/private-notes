import React from 'react';
import PropTypes from 'prop-types';
import { SearchIcon } from '../Icons';


const Header = ({ onCreateNote, onShowSearch }) => (<div className="header">
    <div className="search-icon" onClick={ onShowSearch } ><SearchIcon width={20} height={20} color={ '#ffffff' } /></div>
    <button className="button" onClick={ onCreateNote }>New note</button>
</div>);

Header.propTypes = {
    onCreateNote: PropTypes.func.isRequired,
    onShowSearch: PropTypes.func.isRequired
};

export default Header;