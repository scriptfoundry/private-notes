import React from 'react';
import PropTypes from 'prop-types';

const NavList = ({ className, children }) => {
    return <div className={className}>
        <nav>
            <ul>
                { children }
            </ul>
        </nav>
    </div>;
};

NavList.propTypes = {
    className: PropTypes.string,
    children: PropTypes.array

};

export default NavList;
