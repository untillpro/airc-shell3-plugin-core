/*
 * Copyright (c) 2020-present unTill Pro, Ltd.
 */

import _ from 'lodash';

test('test #1', () => {

    let A = 1;
    let B = 2;


    expect(A + B).toEqual(3);
});

test('test #2', () => {
    let arr = [1, 2, 3, 4, 5];

    expect(_.reduce(arr, (sum, v) => sum += v, 0)).toEqual(15);
});