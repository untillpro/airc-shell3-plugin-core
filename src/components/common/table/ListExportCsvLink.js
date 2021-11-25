/*
 * Copyright (c) 2020-present unTill Pro, Ltd.
 */

import React from 'react';
import PropTypes from 'prop-types';
import * as FileSaver from 'file-saver';
import jsonexport from 'jsonexport';
import { buildExportData } from '../../../classes/helpers';

const ListExportXslxLink = ({ data, columns, filename, text }) => {
    const fileType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
    const fileExtension = '.csv';

    const doExport = (d, columns, filename) => {
        const data = buildExportData(d, columns, ".xlsl");
        jsonexport(data, (err, csv) => {
            if (err) return console.error(err);
            
            const exportData = new Blob([csv], { type: fileType });
            FileSaver.saveAs(exportData, filename + fileExtension);
        });
        
    }

    return (
        <a onClick={(_) => doExport(data, columns, filename)} href="#exportcsv">
            {text ? text : 'Export XLSX'}
        </a>
    );
}

ListExportXslxLink.propTypes = {
    data: PropTypes.object, 
    columns: PropTypes.array, 
    filename: PropTypes.string, 
    text: PropTypes.string
};

export default ListExportXslxLink;
