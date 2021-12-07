/*
 * Copyright (c) 2020-present unTill Pro, Ltd.
 */
import i18next from 'i18next';
import { Logger } from 'airc-shell-core';
import { makeValidator } from '../../src/classes/helpers';

const CURRENT_VALUE_NOT_NUMBER_ERROR = 'Enter valid number';
const CURRENT_VALUE_NOT_EMAIL_ERROR = 'Enter valid email';
const MIN_VALUE_ERROR = 'Value should be more than {{value}}';
const MIN_WRONG_VALUE_ERROR = 'Incorect minimum value declared';
const MAX_VALUE_ERROR = 'Value should be less than {{value}}';
const MAX_WRONG_VALUE_ERROR = 'Incorect maximum value declared';
const NUMBER_VALUE_ERROR = 'Value must be a number';
const EMAIL_VALUE_ERROR = 'Value must be an email';
const REQUIRED_VALUE_ERROR = 'Required field';
const REGEXP_VALUE_ERROR = 'Not a valid value';
const MIN_LENGTH_WRONG_VALUE_ERROR = 'Incorect min length value declared';
const MIN_LENGTH_ERROR = 'String length should be more than {{value}}';
const MAX_LENGTH_WRONG_VALUE_ERROR = 'Incorect max length value declared';
const MAX_LENGTH_ERROR = 'String length should be less than {{value}}';
const WRONG_REGEXP_ERROR = 'Invalid regexp declared';
const NOT_VALID_VALUE_ERROR = 'Not a valid value';

const validator = makeValidator()

test("i18next initialization", async () => {
    i18next.init({
        debug: true,
        fallbackLng: "en",
        defaultNS: 'translate',
        lng: "en",
        resources: {
            "en": {
                "translate": {
                    [CURRENT_VALUE_NOT_NUMBER_ERROR]: CURRENT_VALUE_NOT_NUMBER_ERROR,
                    [CURRENT_VALUE_NOT_EMAIL_ERROR]: CURRENT_VALUE_NOT_EMAIL_ERROR,
                    [MIN_VALUE_ERROR]: MIN_VALUE_ERROR,
                    [MIN_WRONG_VALUE_ERROR]: MIN_WRONG_VALUE_ERROR,
                    [MAX_VALUE_ERROR]: MAX_VALUE_ERROR,
                    [MAX_WRONG_VALUE_ERROR]: MAX_WRONG_VALUE_ERROR,
                    [NUMBER_VALUE_ERROR]: NUMBER_VALUE_ERROR,
                    [EMAIL_VALUE_ERROR]: EMAIL_VALUE_ERROR,
                    [REQUIRED_VALUE_ERROR]: REQUIRED_VALUE_ERROR,
                    [REGEXP_VALUE_ERROR]: REGEXP_VALUE_ERROR,
                    [MIN_LENGTH_WRONG_VALUE_ERROR]: MIN_LENGTH_WRONG_VALUE_ERROR,
                    [MIN_LENGTH_ERROR]: MIN_LENGTH_ERROR,
                    [MAX_LENGTH_WRONG_VALUE_ERROR]: MAX_LENGTH_WRONG_VALUE_ERROR,
                    [MAX_LENGTH_ERROR]: MAX_LENGTH_ERROR,
                    [WRONG_REGEXP_ERROR]: WRONG_REGEXP_ERROR,
                    [NOT_VALID_VALUE_ERROR]: NOT_VALID_VALUE_ERROR,
                }
            }
        },
        interpolation: {
            escapeValue: false,
        }
    }, (err, t) => {
        if (err) {
            Logger.error(err, "Validation error");
            throw new Error(err);
        }
    });
});

test('Required field test #1 - value not specified', () => {

    const field = {
        required: true,
        accessor: 'name'
    };

    const data = {};

    const errors = validator.validate(field, data);

    expect(errors).toEqual(["Required field"]);
});

test('Required field test #2 - value specified but empty', () => {

    const field = {
        required: true,
        accessor: 'name'
    };

    const data = {
        name: ''
    };

    const errors = validator.validate(field, data);

    expect(errors).toEqual(
        [
            REQUIRED_VALUE_ERROR
        ]
    );
});

test('Required field test #3 - value specified correctly', () => {

    const field = {
        required: true,
        accessor: 'name'
    };

    const data = {
        name: 'john'
    };

    const errors = validator.validate(field, data);

    expect(errors).toEqual([]);
});

test('Required field test #4 - 2 level depth of accessor; field specified', () => {

    const field = {
        required: true,
        accessor: 'person.age'
    };

    const data = {
        person: {
            name: 'john',
            age: 12
        }
    };

    const errors = validator.validate(field, data);

    expect(errors).toEqual([]);
});


test('Required field test #4 - 2 level depth of accessor; field not specified', () => {

    const field = {
        required: true,
        accessor: 'person.duty'
    };

    const data = {
        person: {
            name: 'john',
            age: 12
        }
    };

    const errors = validator.validate(field, data);

    expect(errors).toEqual([
        REQUIRED_VALUE_ERROR
    ]);
});

test('Validate number field test #1 - wrong value is given (string)', () => {

    const field = {
        type: 'number',
        required: true,
        accessor: 'value'
    };

    const data = {
        value: 'john'
    };

    const errors = validator.validate(field, data);

    expect(errors).toEqual(
        [
            NUMBER_VALUE_ERROR
        ]
    );
});

test('Validate number field test #2 - correct value is given (3)', () => {

    const field = {
        type: 'number',
        required: true,
        accessor: 'value'
    };

    const data = {
        value: 3
    };

    const errors = validator.validate(field, data);

    expect(errors).toEqual([]);
});

test('Validate number field test #3 - correct value is given (3.15)', () => {

    const field = {
        type: 'number',
        required: true,
        accessor: 'value'
    };

    const data = {
        value: 3.15
    };

    const errors = validator.validate(field, data);

    expect(errors).toEqual([]);
});

test('Validate number field test #4 - correct value is given ("3.15" <string>)', () => {

    const field = {
        type: 'number',
        required: true,
        accessor: 'value'
    };

    const data = {
        value: '3.15'
    };

    const errors = validator.validate(field, data);

    expect(errors).toEqual([]);
});

test('Validate number field test #5 - wring value is given (3,15); should be in dot notation', () => {

    const field = {
        type: 'number',
        required: true,
        accessor: 'value'
    };

    const data = {
        value: '3,15'
    };

    const errors = validator.validate(field, data);

    expect(errors).toEqual(
        [
            NUMBER_VALUE_ERROR
        ]
    );
});

test('Validate email field test #1 - wrong value; empty email;', () => {

    const field = {
        type: 'email',
        required: true,
        accessor: 'mail'
    };

    const data = {
        mail: ''
    };

    const errors = validator.validate(field, data);

    expect(errors).toEqual(
        [
            REQUIRED_VALUE_ERROR,
            CURRENT_VALUE_NOT_EMAIL_ERROR
        ]
    );
});

test('Validate email field test #2 - wrong value ("abscf"); not an email', () => {

    const field = {
        type: 'email',
        required: true,
        accessor: 'mail'
    };

    const data = {
        mail: 'abscf'
    };

    const errors = validator.validate(field, data);

    expect(errors).toEqual(
        [
            CURRENT_VALUE_NOT_EMAIL_ERROR
        ]
    );
});

test('Validate email field test #3 - wrong value ("abscf@..."); not an email.', () => {

    const field = {
        type: 'email',
        required: true,
        accessor: 'mail'
    };

    const data = {
        mail: 'abscf@...'
    };

    const errors = validator.validate(field, data);

    expect(errors).toEqual([
        CURRENT_VALUE_NOT_EMAIL_ERROR
    ]);
});

test('Validate email field test #3 - wrong value ("abscf@index."); not an email.', () => {

    const field = {
        type: 'email',
        required: true,
        accessor: 'mail'
    };

    const data = {
        mail: 'abscf@index.'
    };

    const errors = validator.validate(field, data);

    expect(errors).toEqual(
        [
            CURRENT_VALUE_NOT_EMAIL_ERROR
        ]
    );
});

test('Validate email field test #4 - wrong value; number is given', () => {

    const field = {
        type: 'email',
        required: true,
        accessor: 'mail'
    };

    const data = {
        mail: 123.43
    };

    const errors = validator.validate(field, data);

    expect(errors).toEqual(
        [
            CURRENT_VALUE_NOT_EMAIL_ERROR
        ]
    );
});

test('Validate email field test #5 - wrong value; boolean is given', () => {

    const field = {
        type: 'email',
        required: true,
        accessor: 'mail'
    };

    const data = {
        mail: true
    };

    const errors = validator.validate(field, data);

    expect(errors).toEqual(
        [
            CURRENT_VALUE_NOT_EMAIL_ERROR
        ]
    );
});


test('Validate email field test #6 - correct email is given', () => {

    const field = {
        type: 'email',
        required: true,
        accessor: 'mail'
    };

    const data = {
        mail: 'abscf@index.com'
    };

    const errors = validator.validate(field, data);

    expect(errors).toEqual([]);
});

test('Validate min value field test #1 - wrong value is given; string', () => {

    const field = {
        required: true,
        accessor: 'num',
        min: 5
    };

    const data = {
        num: 'some string'
    };

    const errors = validator.validate(field, data);

    expect(errors).toEqual([
        CURRENT_VALUE_NOT_NUMBER_ERROR
    ]);
});

test('Validate min value field test #2 - wrong value; boolean; converts to 1; less than min value', () => {

    const field = {
        required: true,
        accessor: 'num',
        min: 5
    };

    const data = {
        num: true
    };

    const errors = validator.validate(field, data);

    expect(errors).toEqual([
        CURRENT_VALUE_NOT_NUMBER_ERROR
    ]);
});

test('Validate min value field test #3 - wrong value; less than min value', () => {

    const field = {
        type: 'number',
        required: true,
        accessor: 'num',
        min: 5
    };

    const data = {
        num: 3
    };

    const errors = validator.validate(field, data);

    expect(errors).toEqual([
        MIN_VALUE_ERROR.replace("{{value}}", 5)
    ]);
});

test('Validate min value field test #4 - correct value; more than min value', () => {

    const field = {
        required: true,
        accessor: 'num',
        min: 5
    };

    const data = {
        num: 7
    };

    const errors = validator.validate(field, data);

    expect(errors).toEqual([]);
});

test('Validate min value field test #5 - correct value; float is given;', () => {

    const field = {
        required: true,
        accessor: 'num',
        min: 5
    };

    const data = {
        num: 7.123
    };

    const errors = validator.validate(field, data);

    expect(errors).toEqual([]);
});

test('Validate min value field test #6 - correct value; big float is given;', () => {

    const field = {
        required: true,
        accessor: 'num',
        min: 5
    };

    const data = {
        num: 12345.343234
    };

    const errors = validator.validate(field, data);

    expect(errors).toEqual([]);
});

test('Validate min value field test #7 - correct value; string with number is given;', () => {

    const field = {
        required: true,
        accessor: 'num',
        min: 5
    };

    const data = {
        num: '8'
    };

    const errors = validator.validate(field, data);

    expect(errors).toEqual([]);
});

test('Validate min value field test #8 - correct value; min prop is given like string;', () => {

    const field = {
        required: true,
        accessor: 'num',
        min: '5'
    };

    const data = {
        num: 8
    };

    const errors = validator.validate(field, data);

    expect(errors).toEqual([]);
});

/* max value */

test('Validate max value field test #1 - wrong value is given; string', () => {

    const field = {
        required: true,
        accessor: 'num',
        max: 5
    };

    const data = {
        num: 'some string'
    };

    const errors = validator.validate(field, data);

    expect(errors).toEqual([
        CURRENT_VALUE_NOT_NUMBER_ERROR
    ]);
});

test('Validate max value field test #2 - wrong value; boolean; converts to 1; more than max value', () => {

    const field = {
        required: true,
        accessor: 'num',
        max: 0
    };

    const data = {
        num: true
    };

    const errors = validator.validate(field, data);

    expect(errors).toEqual([
        CURRENT_VALUE_NOT_NUMBER_ERROR
    ]);
});

test('Validate max value field test #3 - wrong value; more than max value', () => {

    const field = {
        required: true,
        accessor: 'num',
        max: 5
    };

    const data = {
        num: 10
    };

    const errors = validator.validate(field, data);

    expect(errors).toEqual([
        MAX_VALUE_ERROR.replace("{{value}}", 5)
    ]);
});

test('Validate max value field test #4 - correct value; less than max value', () => {

    const field = {
        required: true,
        accessor: 'num',
        max: 5
    };

    const data = {
        num: 3
    };

    const errors = validator.validate(field, data);

    expect(errors).toEqual([]);
});

test('Validate max value field test #5 - correct value; float is given;', () => {

    const field = {
        required: true,
        accessor: 'num',
        max: 5
    };

    const data = {
        num: 3.123
    };

    const errors = validator.validate(field, data);

    expect(errors).toEqual([]);
});

test('Validate max value field test #6 - wrong value; big float is given;', () => {

    const field = {
        required: true,
        accessor: 'num',
        max: 100
    };

    const data = {
        num: 12345.343234
    };

    const errors = validator.validate(field, data);

    expect(errors).toEqual([
        MAX_VALUE_ERROR.replace("{{value}}", 100)
    ]);
});

test('Validate max value field test #7 - correct value; string with number is given;', () => {

    const field = {
        required: true,
        accessor: 'num',
        max: 10
    };

    const data = {
        num: '8'
    };

    const errors = validator.validate(field, data);

    expect(errors).toEqual([]);
});

test('Validate max value field test #8 - correct value; max prop is given like string;', () => {

    const field = {
        required: true,
        accessor: 'num',
        max: '10'
    };

    const data = {
        num: 8
    };

    const errors = validator.validate(field, data);

    expect(errors).toEqual([]);
});

test('Validate both min and max value field test #1 - correct value', () => {

    const field = {
        required: true,
        accessor: 'num',
        min: 5,
        max: 10
    };

    const data = {
        num: 8
    };

    const errors = validator.validate(field, data);

    expect(errors).toEqual([]);
});

test('Validate both min and max value field test #2 - more', () => {

    const field = {
        required: true,
        accessor: 'num',
        min: 5,
        max: 10
    };

    const data = {
        num: 11
    };

    const errors = validator.validate(field, data);

    expect(errors).toEqual([
        MAX_VALUE_ERROR.replace("{{value}}", 10)
    ]);
});

test('Validate both min and max value field test #3 - less', () => {

    const field = {
        required: true,
        accessor: 'num',
        min: 5,
        max: 10
    };

    const data = {
        num: 3
    };

    const errors = validator.validate(field, data);

    expect(errors).toEqual([
        MIN_VALUE_ERROR.replace("{{value}}", 5)
    ]);
});

test('Validate min length field test #1 - null value', () => {

    const field = {
        accessor: 'str',
        minLength: 5
    };

    const data = {
        str: null
    };

    const errors = validator.validate(field, data);

    expect(errors).toEqual([]);
});

test('Validate min length field test #2 - empty string', () => {

    const field = {
        accessor: 'str',
        minLength: 5,
    };

    const data = {
        str: ''
    };

    const errors = validator.validate(field, data);

    expect(errors).toEqual([
        MIN_LENGTH_ERROR.replace("{{value}}", 5)
    ]);
});

test('Validate min length field test #3 - short string', () => {

    const field = {
        accessor: 'str',
        minLength: 5
    };

    const data = {
        str: 'abc'
    };

    const errors = validator.validate(field, data);

    expect(errors).toEqual([
        MIN_LENGTH_ERROR.replace("{{value}}", 5)
    ]);
});

test('Validate min length field test #4 - normal string', () => {

    const field = {
        accessor: 'str',
        minLength: 5
    };

    const data = {
        str: 'normal string'
    };

    const errors = validator.validate(field, data);

    expect(errors).toEqual([]);
});

/* max length */

test('Validate max length field test #1 - null value', () => {

    const field = {
        accessor: 'str',
        maxLength: 5
    };

    const data = {
        str: null
    };

    const errors = validator.validate(field, data);

    expect(errors).toEqual([]);
});

test('Validate max length field test #2 - empty string', () => {

    const field = {
        accessor: 'str',
        maxLength: 5
    };

    const data = {
        str: ''
    };

    const errors = validator.validate(field, data);

    expect(errors).toEqual([]);
});

test('Validate max length field test #3 - short string', () => {

    const field = {
        accessor: 'str',
        maxLength: 5
    };

    const data = {
        str: 'abc'
    };

    const errors = validator.validate(field, data);

    expect(errors).toEqual([]);
});

test('Validate max length field test #4 - to long string', () => {

    const field = {
        accessor: 'str',
        maxLength: 5
    };

    const data = {
        str: 'normal string'
    };

    const errors = validator.validate(field, data);

    expect(errors).toEqual([
        MAX_LENGTH_ERROR.replace("{{value}}", 5)
    ]);
});

test('Both min and max length field test #1 - to short string', () => {

    const field = {
        accessor: 'str',
        minLength: 5,
        maxLength: 10
    };

    const data = {
        str: 'abc'
    };

    const errors = validator.validate(field, data);

    expect(errors).toEqual([
        MIN_LENGTH_ERROR.replace("{{value}}", 5)
    ]);
});

test('Both min and max length field test #2 - to long string', () => {
    const field = {
        accessor: 'str',
        minLength: 5,
        maxLength: 10
    };

    const data = {
        str: 'abcdefghijklmnop'
    };

    const errors = validator.validate(field, data);

    expect(errors).toEqual([
        MAX_LENGTH_ERROR.replace("{{value}}", 10)
    ]);
});

test('Both min and max length field test #3 - valid string', () => {

    const field = {
        accessor: 'str',
        minLength: 5,
        maxLength: 10
    };

    const data = {
        str: 'abcdefgh'
    };

    const errors = validator.validate(field, data);

    expect(errors).toEqual([]);
});

test('Validate regexp field test #1 - unvalid string', () => {

    const field = {
        accessor: 'str',
        regexp: /^\d{1,5}$/
    };

    const data = {
        str: 'abcdefgh'
    };

    const errors = validator.validate(field, data);

    expect(errors).toEqual([
        NOT_VALID_VALUE_ERROR
    ]);
});


test('Validate regexp field test #2 - valid string', () => {

    const field = {
        accessor: 'str',
        regexp: /^\d{1,5}$/
    };

    const data = {
        str: '132'
    };

    const errors = validator.validate(field, data);

    expect(errors).toEqual([]);
});

test('Validate regexp field test #3 - unvalid string', () => {

    const field = {
        accessor: 'str',
        regexp: /^\d{1,5}$/
    };

    const data = {
        str: '132345'
    };

    const errors = validator.validate(field, data);

    expect(errors).toEqual([
        NOT_VALID_VALUE_ERROR
    ]);
});

test('Validate regexp field test #4 - valid number', () => {

    const field = {
        accessor: 'str',
        regexp: /^\d{1,5}$/
    };

    const data = {
        str: 132
    };

    const errors = validator.validate(field, data);

    expect(errors).toEqual([]);
});

test('Validate regexp field test #5 - valid number', () => {

    const field = {
        accessor: 'str',
        regexp: /^\d{1,5}$/
    };

    const data = {
        str: 132543
    };

    const errors = validator.validate(field, data);

    expect(errors).toEqual([
        NOT_VALID_VALUE_ERROR
    ]);
});