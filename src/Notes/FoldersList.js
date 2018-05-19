import React from 'react';
import PropTypes from 'prop-types';
import NavList from './NavList';

const FoldersList = ({ folders, onSelect, selectedFolder }) => {
    let items = folders.map(folder => (<li key={folder} className={ folder === selectedFolder ? 'selected' : null } onClick={ () => onSelect(folder) }>{ folder || 'Default' }</li>));

    return <NavList className='folders-list'>{ items }</NavList>;
};

FoldersList.propTypes = {
    folders: PropTypes.arrayOf(PropTypes.string).isRequired,
    selectedFolder: PropTypes.string,
    onSelect: PropTypes.func.isRequired
};

export default FoldersList;