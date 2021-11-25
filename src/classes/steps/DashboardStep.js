/*
 * Copyright (c) 2020-present unTill Pro, Ltd.
 */

import StateMachineStep from '../StateMachineStep';

import { 
    SAGA_FETCH_DASHBOARD
} from '../../sagas/Types';

class DashboardStep extends StateMachineStep {
    getName() {
        return 'DashboardStep';
    }

    MessageInit() {
        return this.fetchData();
    }

    MessageRefreshData() {
        return this.fetchData();
    }

    MessageSetLocations() {
        return this.fetchData();
    }

    MessageSelectView() {
        return null;
    }
    
    fetchData() {
        return {
            action: {
                type: SAGA_FETCH_DASHBOARD,
            }
        };
    }
}

export default DashboardStep;
