import React from 'react';
import PropTypes from 'prop-types';

const NoteEditorForm = ({ note: {folder, name, content}, contentRef, nameRef, folderRef, isChanged, onKeyUp, suggestedOptions, onChange, onDelete, onSave }) => (<div className="entry-form">
    <input tabIndex={1} ref={ nameRef } onChange={ onChange } onKeyUp={ onKeyUp } type="text" value={ name } placeholder="Name..." />
    <input tabIndex={2} ref={folderRef} onChange={ onChange } onKeyUp={ onKeyUp } type="text" value={ folder } placeholder="Folder..." list="filter_suggestions" />
    <datalist id="filter_suggestions">{ suggestedOptions }</datalist>
    <textarea tabIndex={3} ref={ contentRef } onChange={ onChange } value={ content } placeholder="Private note..."></textarea>
    <div>
        <button tabIndex={-1} onClick={ onDelete } className="delete">Delete note</button>
        <button tabIndex={4} onClick={ onSave } disabled={ !isChanged }>Save changes</button>
    </div>

</div>);

NoteEditorForm.propTypes = {
    folderRef: PropTypes.object.isRequired,
    nameRef: PropTypes.object.isRequired,
    contentRef: PropTypes.object.isRequired,

    note: PropTypes.shape({
        folder: PropTypes.string,
        name: PropTypes.string,
        content: PropTypes.string
    }).isRequired,

    onKeyUp: PropTypes.func.isRequired,
    isChanged: PropTypes.bool.isRequired,
    suggestedOptions: PropTypes.array,

    onChange: PropTypes.func.isRequired,
    onSave: PropTypes.func.isRequired,
    onDelete: PropTypes.func.isRequired
};
export default NoteEditorForm;
