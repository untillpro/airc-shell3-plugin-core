/*
 * Copyright (c) 2020-present unTill Pro, Ltd.
 */

import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import {
    //NumberFilter,
    //RangeFilter,
    //SelectFilter,
    StringFilter,
    //GroupFilter,
    //DateTimeFilter,
    LocationFilter
} from './filter_types';

class ColumnFilter extends PureComponent {
    constructor(props) {
        super(props);

        this.state = {
            opened: false
        };
    }

    handleClick() {
        const { opened } = this.state;

        this.setState({ opened: !opened });
    }

    renderFitler() {
        //TODO - implement all filter types
        
        const { onChange, column } = this.props;
        const { type, filterType } = column;

        let checkType = filterType || type;

        switch (checkType) {
            //case "number": return <NumberFilter column={column} onChange={onChange} />;
            //case "select": return <SelectFilter column={column} onChange={onChange} />;
            //case "price": return <RangeFilter column={column} onChange={onChange} />;
            //case "range": return <RangeFilter column={column} onChange={onChange} />;
            //case "group": return <GroupFilter column={column} onChange={onChange} />;
            //case "date": 
            //case "time": 
            case "location": return <LocationFilter column={column} onChange={onChange} />;
            default: return <StringFilter column={column} onChange={onChange} />;
        }
    }

    render() {
        const { column: { filterable }} = this.props;

        if (filterable === false) return null;

        return (
            <div>
                {this.renderFitler()}
            </div>
        );
    }
}

ColumnFilter.propTypes = {
    column: PropTypes.object,
    onChange: PropTypes.func.isRequired
};

export default ColumnFilter;
