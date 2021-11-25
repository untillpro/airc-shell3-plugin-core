/*
 * Copyright (c) 2020-present unTill Pro, Ltd.
 */

import { createSelector }  from 'reselect';

export const selectDefaultCurrency = (state) => {
    return state.options.defaultCurrency;
};

export const selectOptionCurrency = (state) => {
    return state.options.currency;
};

export const selectSystemCurrency = createSelector(
    [selectDefaultCurrency, selectOptionCurrency], 
    (defaultCur, optionCur) => {

        if (optionCur != null) {
            return optionCur;
        }

        return defaultCur;
});

export const selectLocations = (state) => {
    return state.locations.locationsOptions;
}