/*
 * Copyright (c) 2020-present unTill Pro, Ltd.
 */

function condition(attrs, fn) {
    let prop = attrs[0]; 
    let value = attrs[1];

    if (this.settings && this.settings[prop] === value) {
        return fn(this);
    }

    return '';
};

function attribute(attrs) {
    let prop = attrs[0];
    let name = attrs[1]
    
    if (this.settings && this.settings[prop]) {
        return `${name}="${this.settings[prop]}"`;
    }
        

    return '';
};

function value(attrs) {
    let prop = attrs[0];
    let dflt = attrs[1] || null

    if (this.settings && this.settings[prop]) {
        return this.settings[prop];
    } else if (dflt && typeof dflt !== 'object') {
        return dflt;
    }

    return '';
};

const DefaultHelpers = {
    condition,
    attribute,
    value
};

export default DefaultHelpers;