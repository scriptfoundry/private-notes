import React from 'react';
import PropTypes from 'prop-types';
import { classNames } from '../services/Utils';

const Search = ({ searchRef, searchResults=null, onChange, onDismiss, onSelect }) => {
    let rows = null;
    let empty = false;

    if (searchResults && searchResults.length === 0) {
        rows = <div className="advisory">Nothing found</div>;
        empty = true;
    } else if (searchResults && searchResults.length) {
        rows = searchResults.map(({ id, folder, name }) => <div key={id} className="row" onClick={ () => onSelect({id}) }><div>{ folder || 'Default' }</div><div>{ name || 'Unnamed note' }</div></div>);
    }

    let bodyClass = classNames({
        body: true,
        empty
    });

    return <div className="search dialog">
        <div className="close-button" onClick={ onDismiss }>✕</div>
        <h2>Find notes</h2>
        <input type="search" ref={ searchRef } onChange={ onChange } />
        <div className="table">
            <div className="header row"><div>Folder</div><div>Name</div></div>

            <div className={ bodyClass }>
                { rows }
            </div>
        </div>
    </div>;
};

Search.propTypes = {
    searchRef: PropTypes.object.isRequired,
    onDismiss: PropTypes.func.isRequired,
    onChange: PropTypes.func.isRequired,
    onSelect: PropTypes.func.isRequired,
    searchResults: PropTypes.arrayOf(PropTypes.shape({
        id: PropTypes.number,
        folder: PropTypes.string,
        name: PropTypes.string
    }))
};

export default Search;