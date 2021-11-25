/*
 * Copyright (c) 2020-present unTill Pro, Ltd.
 */

const maxTail = 1000;

var actionsStore = []

export default store => next => action => {
    if (action.logger && action.logger.print === true) {
        console.group("actionLogger:");
        console.log(actionsStore);
        console.groupEnd();
    }

    if (action.logger && action.logger.flush === true) {
        actionsStore = [];
    }

    if (actionsStore.length > (maxTail * 2)) {
        actionsStore.splice(0, maxTail);
    }

    actionsStore.push(JSON.stringify(action));

    return next(action);
}
