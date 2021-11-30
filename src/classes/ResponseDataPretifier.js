const _ = require('lodash');

function pretifyData(fields, responseData) {
    const builder = new ResponseDataPretifier();
    builder.prepare(fields);
    return builder.build(responseData);
};

class ResponseDataPretifier {
    constructor() {
        this.builders = [];
    }

    prepare(elements) {
        _.forEach(elements, (element) => {
            if ("fields" in element) {
                this.builders.push(new ElementBuilder(element));
            }
        });
    }

    build(rows) {
        let result = [];
        // больше проверок королю проверок
        if (this.builders.length === 0) {
            throw new Error("No fields descriptions specified");
        }
        for (let row of rows) {
            result.push(this._buildRow(row));
        }
        return result;
    }

    _buildRow(rowData) {
        let result = {};
        if (rowData.length !== this.builders.length) {
            throw new Error("Uncosistent data");
        }

        for (let i = 0; i < rowData.length; i++) {
            let builder = this.builders[i];
            let data = rowData[i];
            let o = builder.build(data);
            result = Object.assign(Object.assign({}, result), o);
        }
        return result;
    }
}

class ElementBuilder {
    constructor(element) {
        const { path, fields, refs } = element;

        this.path = path && path.length > 0 ? path.split('/') : [];
        this.fields = fields || [];
        this.refs = refs || [];
    }

    build(data) {
        if (this.path.length === 0 && data.length > 0) {
            let o = this._buildRow(data[0]);
            return o;
        }
        let key = _.last(this.path);
        let result = {
            [key]: []
        };
        //result[key] = {};
        for (let i = 0; i < data.length; i++) {
            result[key].push(this._buildRow(data[i]));
        }
        return result;
    }

    _buildRow(row) {
        let valuesCount = this.fields.length + this.refs.length;
        let result = {};
        let valuePointer = 0;

        if (row.length !== valuesCount) {
            throw new Error("incompatible row data");
        }

        if (this.fields.length > 0) {
            for (let i = 0; i < this.fields.length; i++) {
                result[this.fields[i]] = row[valuePointer++];
            }
        }

        if (this.refs.length > 0) {
            for (let i = 0; i < this.refs.length; i++) {
                let [ refKey, refField ] = this.refs[i];

                if (!result[refKey]) result[refKey] = {};

                result[refKey][refField] = row[valuePointer++];
            }
        }

        return result;
    }

    // _buildField(descr, value) {
    //     let name = '';
    //     let val;
    //     if (!descr.type || descr.type === 'result') {
    //         name = descr.field;
    //         val = value;
    //     }
    //     else if (descr.type === 'ref') {
    //         if (descr.alias) {
    //             name = descr.alias;
    //             val = value;
    //         }
    //         else {
    //             name = descr.field;
    //             val = {
    //                 [descr.ref_field]: value,
    //             };
    //         }
    //     }
    //     return [name, val];
    // }
}

module.exports = pretifyData;
