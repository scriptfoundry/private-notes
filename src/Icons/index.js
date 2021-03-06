import React from 'react';
import PropTypes from 'prop-types';

export const TrashIcon = ({ color, height, width }) => <svg style={{ width:`${ width }px`, height: `${ height }px`}} viewBox={`0 0 ${width} ${height}`}>
        <path fill={ color } d="M19,4H15.5L14.5,3H9.5L8.5,4H5V6H19M6,19A2,2 0 0,0 8,21H16A2,2 0 0,0 18,19V7H6V19Z" />
    </svg>;

TrashIcon.propTypes = {
    width: PropTypes.number.isRequired,
    height: PropTypes.number.isRequired,
    color: PropTypes.string
};
TrashIcon.defaultProps = { height: 25, width: 25, color: '#990000' };

export const UndoIcon = ({ color, height, width }) => <svg style={{ width:`${ width }px`, height: `${ height }px`}} viewBox={ `0 0 ${ width } ${ height }` }>
        <path fill={ color } d="M13.5,7A6.5,6.5 0 0,1 20,13.5A6.5,6.5 0 0,1 13.5,20H10V18H13.5C16,18 18,16 18,13.5C18,11 16,9 13.5,9H7.83L10.91,12.09L9.5,13.5L4,8L9.5,2.5L10.92,3.91L7.83,7H13.5M6,18H8V20H6V18Z" />
    </svg>;

UndoIcon.propTypes = {
    width: PropTypes.number.isRequired,
    height: PropTypes.number.isRequired,
    color: PropTypes.string
};
UndoIcon.defaultProps = { height: 20, width: 20, color: '#666666' };

export const SaveIcon = ({ color, height, width }) => <svg style={{ width:`${ width }px`, height: `${ height }px`}} viewBox={ `0 0 ${ width } ${ height }` }>
        <path fill={ color } d="M15,9H5V5H15M12,19A3,3 0 0,1 9,16A3,3 0 0,1 12,13A3,3 0 0,1 15,16A3,3 0 0,1 12,19M17,3H5C3.89,3 3,3.9 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V7L17,3Z" />
    </svg>;

SaveIcon.propTypes = {
    width: PropTypes.number.isRequired,
    height: PropTypes.number.isRequired,
    color: PropTypes.string
};
SaveIcon.defaultProps = { height: 20, width: 20, color: '#666666' };

export const SearchIcon = ({ width=20, height=20, color='#666666'}) => <svg style={{ width:`${ width }px`, height: `${ height }px`}} viewBox={ '0 0 20 20' }>
        <path fill={ color } d="M9.5,3A6.5,6.5 0 0,1 16,9.5C16,11.11 15.41,12.59 14.44,13.73L14.71,14H15.5L20.5,19L19,20.5L14,15.5V14.71L13.73,14.44C12.59,15.41 11.11,16 9.5,16A6.5,6.5 0 0,1 3,9.5A6.5,6.5 0 0,1 9.5,3M9.5,5C7,5 5,7 5,9.5C5,12 7,14 9.5,14C12,14 14,12 14,9.5C14,7 12,5 9.5,5Z" />
    </svg>;
SearchIcon.propTypes = {
    width: PropTypes.number,
    height: PropTypes.number,
    color: PropTypes.string
};
