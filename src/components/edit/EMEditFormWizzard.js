import React from 'react';
import PropTypes from 'prop-types';
import { useSelector, useDispatch } from 'react-redux';

import {
    DEVICE_CREATION_WIZZARD
} from '../../const/Wizzards';

import {
    AddNewDeviceWizzard,
    NoWizzardDefineError
} from './wizzards';

const EMEditFormWizzard = (props) => {

    const state = useSelector((state) => state.wizzard);
    const dispatch = useDispatch();

    const { wizzard } = props;

    let WizzardComponent = null;

    switch(wizzard) {
        case DEVICE_CREATION_WIZZARD: 
            WizzardComponent = AddNewDeviceWizzard; 
            break;
            
        default: WizzardComponent = NoWizzardDefineError;
    }


    return <WizzardComponent {...props} state={state} dispatch={dispatch}/>;
}

EMEditFormWizzard.propTypes = {
    entity: PropTypes.string.isRequired,
    data: PropTypes.object,
    classifiers: PropTypes.object,
    wizzard: PropTypes.string.isRequired
};

export default EMEditFormWizzard;