/*
 * Copyright (c) 2020-present unTill Pro, Ltd.
 */

import _ from 'lodash';
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { KEY_LEFT, KEY_RIGHT } from 'keycode-js';

class ListPaginatorPages extends Component {
    componentDidMount() {
        document.addEventListener('keydown', this.hadleKeyPress.bind(this), false);
    }
    
    componentWillUnmount() {
        document.removeEventListener('keydown', this.hadleKeyPress.bind(this), false);
    }

    hadleKeyPress(event) {
        const { pages, page, selectPage } = this.props;

        if (selectPage && typeof selectPage === 'function') {
            switch (event.keyCode) {
                case KEY_LEFT: 
                    if (page > 0) selectPage(page - 1); 
                    break;
 
                case KEY_RIGHT: 
                    if (pages > 1 && page < pages - 1) selectPage(page + 1);
                    break;
                    
                default: break;
            }
        }
    }

    selectPage(n) {
        const { onSelect } = this.state;

        if (onSelect) {
            onSelect(n);
        }
    }   

    renderPages() {
        const { pages, page, selectPage, range } = this.props;

        if (pages && pages > 1) {
            return (
                <div className='-pages'>
                    {
                        _.times(pages, (n) => {
                            if (n < page - range || n > page + range) {
                                return null;
                            }
                            return (
                                <span 
                                    key={`page_${n}`}
                                    className={`-page ${page === n ? '-selected' : ''}`}
                                    href='#'
                                    onClick={() => selectPage(n)}
                                >
                                    {n + 1}
                                </span>
                            );
                        })
                    }
                </div>
            );
        }

        return null;
    }

    renderPrev() {
        const { pages, page, selectPage } = this.props;

        let disabled = true;

        if (pages && pages > 1 && page > 0) {
            disabled = false;
        }

        return (
            <span 
                className={`-pagesPrev ${disabled ? '-disabled' : ''}`}
                onClick={!disabled ? () => selectPage(page - 1) : null}
            />
        );
    }

    renderNext() {
        const { pages, page, selectPage } = this.props;

        let disabled = true;

        if (pages && pages > 1 && page < (pages - 1)) {
            disabled = false;
        }

        return (
            <span 
                className={`-pagesNext ${disabled ? '-disabled' : ''}`}
                onClick={!disabled ? () => selectPage(page + 1) : null}
            />
        );
    }

    renderBegin() {
        const { pages, page, selectPage } = this.props;

        let disabled = true;


        if (pages && pages > 1 && page > 0) {
            disabled = false;
        }

        return (
            <span 
                className={`-pagesBegin ${disabled ? '-disabled' : ''}`}
                onClick={!disabled ? () => selectPage(0) : null}
            />
        );
    }

    renderEnd() {
        const { pages, page, selectPage } = this.props;

        let disabled = true;


        if (pages && pages > 1 && page < (pages - 1)) {
            disabled = false;
        }

        return (
            <span 
                className={`-pagesEnd ${disabled ? '-disabled' : ''}`}
                onClick={!disabled ? () => selectPage(pages - 1) : null}
            />
        );
    }


    render() {
        const { pages } = this.props;

        if ( pages <= 1) {
            return null;
        }

        return (
            <div className='-pagesSelector'>
                {this.renderBegin()}
                {this.renderPrev()}
                {this.renderPages()}
                {this.renderNext()}
                {this.renderEnd()}
            </div>
        );
    }
}

ListPaginatorPages.propTypes = {
    pages: PropTypes.number,
    page: PropTypes.number,
    selectPage: PropTypes.func,
    range: PropTypes.number
};

export default ListPaginatorPages;
