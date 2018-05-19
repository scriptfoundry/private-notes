import React from 'react';
import PropTypes from 'prop-types';
import { timestampToDate } from '../services/Utils';

const NoteListItem = ({ note, onSelect, selected }) => <li className={ selected ? 'selected' : null } onClick={ onSelect }>
    <div className="name">{ note.name || 'untitled note' }</div>
    { note.created ? <div className="meta">Created { timestampToDate(note.created) }</div> : null }
    { note.updated ? <div className="meta">Updated { timestampToDate(note.updated) }</div> : null }
</li>;

NoteListItem.propTypes = {
    note: PropTypes.shape({
        id: PropTypes.number,
        name: PropTypes.string,
        folder: PropTypes.string
    }).isRequired,
    selected: PropTypes.bool,
    onSelect: PropTypes.func.isRequired
};

export default NoteListItem;