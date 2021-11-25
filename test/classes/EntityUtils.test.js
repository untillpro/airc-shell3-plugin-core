/*
 * Copyright (c) 2020-present unTill Pro, Ltd.
 */

import { applyClassifiers } from "../../src/classes/helpers";
import Data from '../data/department_data.json';

test('applyClassifiers test #1', () => {
    let res = applyClassifiers(Data, 'department');
});
