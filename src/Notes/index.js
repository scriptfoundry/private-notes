import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { updateNote, createNote, deleteNoteById, getNoteById, getNotes } from '../services/Db';
import { ERR_COULD_NOT_DECRYPT } from '../services/Crypto';
import { memoize, buildComparator, sortByDate } from '../services/Utils';
import Header from './Header';
import FoldersList from './FoldersList';
import NotesList from './NotesList';
import NoteEditorForm from './NoteEditorForm';

import './Notes.css';

const { confirm } = window;

const emptyNote = {
    id: null,
    name: '',
    folder: '',
    content: ''
};

const getFolderNames = memoize(notes =>
    sortByDate(notes)
    .reduce((folderNames, {folder}) => {
        if (folderNames.indexOf(folder) === -1) return [...folderNames, folder];
        return folderNames;
    }, [])
);

const getNoteNames = memoize((folder, notes) =>
    sortByDate(notes)
    .filter(note => note.folder === folder)
);
const buildSuggestionListFromCueAndNotes = memoize((cue, notes) => {
    let rx = new RegExp(cue, 'i');
    let folderNames = getFolderNames(notes);
    return folderNames.filter(folder => rx.test(folder)).map(folder => <option key={folder} value={folder} />);
}, 10);

const compare = memoize(buildComparator(['folder', 'name', 'content']), 1);

class Notes extends Component {
    constructor(...args) {
        super(...args);

        this.state = {
            selectedFolder: null,
            selectedNote: null,
            originalNote: null,
            notes: [],
            suggestions: null
        };

        this.nameRef = React.createRef();
        this.folderRef = React.createRef();
        this.contentRef = React.createRef();

        this.getFolderSuggestions = this.getFolderSuggestionsList.bind(this);
        this.selectFolder = this.selectFolder.bind(this);
        this.selectNote = this.selectNote.bind(this);
        this.change = this.change.bind(this);
        this.advance = this.advance.bind(this);
        this.create = this.create.bind(this);
        this.save = this.save.bind(this);
        this.delete = this.delete.bind(this);
    }
    async componentDidMount() {
        try {
            this.setState({ notes: await getNotes(this.props.password) });
        } catch (err) {
            if (err.message === ERR_COULD_NOT_DECRYPT) this.props.onAuthenticationError();
        }
    }
    requiresWarning() {
        let { selectedNote, originalNote } = this.state;
        return selectedNote !== null && !compare(selectedNote, originalNote) && !confirm('Abandon your changes?');
    }
    selectFolder(selectedFolder) {
        if (this.requiresWarning()) return;

        if (selectedFolder === this.state.selectedFolder) return;
        this.setState({ selectedFolder, selectedNote: null });
    }
    async selectNote({ id }) {
        if (this.requiresWarning()) return;
        let selectedNote = await getNoteById(id, this.props.password);
        let originalNote = { ...selectedNote };
        this.setState({ selectedNote, originalNote }, () => this.nameRef.current.select());
    }
    getFolderSuggestionsList(cue) {
        return buildSuggestionListFromCueAndNotes(cue, this.state.notes);

    }
    advance({key, target}) {
        if (key !== 'Enter') return;

        if (target === this.nameRef.current) this.folderRef.current.select();
        else if (target === this.folderRef.current) this.contentRef.current.select();
    }

    create() {
        if (this.requiresWarning()) return;
        let selectedNote = {...emptyNote, folder: this.state.selectedFolder || ''};
        this.setState({
            selectedNote,
            originalNote: {...selectedNote}
        }, () => this.nameRef.current.select());
    }
    async save() {
        let { password } = this.props;
        let { selectedNote } = this.state;
        let { id } = selectedNote;


        if (id === null) id = await createNote(selectedNote, password);
        else await updateNote(selectedNote, password);
        let notes = await getNotes(password);
        let selectedFolder = selectedNote.folder;

        selectedNote = await getNoteById(id, password);
        let originalNote = { ...selectedNote };

        this.setState({ selectedNote, originalNote, notes, selectedFolder });
    }
    change(evt) {
        let { selectedNote } = this.state;

        let target = evt.target;
        let value = target.value;
        let suggestions = null;

        if (target === this.contentRef.current) selectedNote = {...selectedNote, content: value };
        else if (target === this.nameRef.current) selectedNote = {...selectedNote, name: value };
        else if (target === this.folderRef.current) {
            selectedNote = {...selectedNote, folder: value };
            suggestions = this.getFolderSuggestionsList(value);
        }

        this.setState({ selectedNote, suggestions });
    }
    async delete() {
        let { password } = this.props;
        let id = this.state.selectedNote.id;
        if (!id) return;
        await deleteNoteById(id, password);
        let notes = await getNotes(password);

        this.setState({
            notes,
            selectedNote: null,
            originalNote: null,
            suggestions: null
        });
    }
    render() {
        let { notes, selectedFolder, selectedNote, originalNote, suggestions } = this.state;
        let folders = getFolderNames(notes);
        let folderNotes = getNoteNames(selectedFolder, notes);

        let noteEditorForm = null;
        if (selectedNote) {
            noteEditorForm = <NoteEditorForm
                folderRef={ this.folderRef }
                nameRef={ this.nameRef }
                contentRef={ this.contentRef }
                note={ selectedNote }
                onChange={ this.change }
                onSave={ this.save }
                onDelete={ this.delete }
                onKeyUp={ this.advance }
                isChanged={ !compare(selectedNote, originalNote) }
                suggestedOptions={ suggestions }
            />;
        }

        return (<div className="notes">
            <Header onCreateNote={ this.create } />
            <div className="body">
                <FoldersList folders={ folders } selectedFolder={ selectedFolder } onSelect={ this.selectFolder } />
                <NotesList notes={ folderNotes } selectedNote={ selectedNote } onSelect={ this.selectNote } />
                { noteEditorForm }
            </div>
        </div>);
    }
}

Notes.propTypes = {
    password: PropTypes.string.isRequired,
    onAuthenticationError: PropTypes.func.isRequired
};

export default Notes;