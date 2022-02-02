/*
 * Copyright (c) 2020-present unTill Pro, Ltd.
 */

import { Result, Button } from 'antd';

const NoWizzardDefineError = (props) => {
    const { wizzard, dispatch } = props;

    return (<Result
        status="warning"
        title={`No wizzard defined for code ${wizzard}`}
        extra={
            <Button
                type="primary"
                key="console"
                onClick={() => dispatch()}
            >
                Go back
            </Button>
        }
    />)
};

export default NoWizzardDefineError;