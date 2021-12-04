/*
 * Copyright (c) 2020-present unTill Pro, Ltd.
 */

import _ from 'lodash';

class CUDBuilder {
    _cud(operation) {
        const { _create, _data, _id, _parent_id, _scheme } = operation
        let o = {};
        let fields = {}

        if (!_.isNumber(_id) || _id < 1) {
            throw new Error('wrong operation param "_id": positive integer expected');
        } else {
            if (_create) {
                fields["sys.ID"] = _id;
            } else {
                o["sys.ID"] = _id;
            }
        }

        if (!_.isNil(_parent_id) && (!_.isNumber(_parent_id) || _parent_id < 1)) {
            throw new Error('wrong operation param "_parent_id": positive integer expected or null');
        }

        if (_create) {
            if (_.isNil(_parent_id)) {
                fields["sys.ParentID"] = null;
            } else {
                fields["sys.ParentID"] = _parent_id;
                fields["sys.Container"] = _scheme;
            }
        }

        if (_.isNil(_scheme) || !_.isString(_scheme)) {
            throw new Error('wrong operation param "_scheme": string expected');
        } else {
            if (_create) {
                fields["sys.QName"] = _scheme;
            }
        }

        if (_.isPlainObject(_data)) {
            fields = { ...fields, ..._data };
        }

        o["fields"] = fields;

        return o;
    };

    build(operations) {
        const cuds = [];

        if (operations) {
            if (_.isArray(operations)) {
                _.forEach(operations, (operation, i) => {
                    try {
                        cuds.push(this._cud(operation));
                    } catch (e) {
                        console.error(e);
                        throw new Error(`Operation ${i} error: ${e}`);
                    }
                });
            } else {
                throw new Error('Operations must be an array'); // операции должны быть массивом
            }
        } else {
            throw new Error('Operations are not specified.'); // операции пустые
        }

        return cuds;
    };
}

export default CUDBuilder;