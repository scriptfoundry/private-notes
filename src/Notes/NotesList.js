import React from 'react';
import PropTypes from 'prop-types';
import NavList from './NavList';
import NoteListItem from './NoteListItem';

const NotesList = ({ notes, selectedNote, onSelect }) => {
    let items = notes.map(note => <NoteListItem key={note.id} note={note} selected={ selectedNote && selectedNote.id === note.id } onSelect={ () => onSelect(note) } />);

    return <NavList className="notes-list">{ items }</NavList>;
};

NotesList.propTypes = {
    notes: PropTypes.array.isRequired,
    selectedNote: PropTypes.object,
    onSelect: PropTypes.func.isRequired
};

export default NotesList;