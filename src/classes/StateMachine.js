/*
 * Copyright (c) 2020-present unTill Pro, Ltd.
 */

export default class StateMachine {
    constructor(dispatch) {
        this.stack = [];
        this.lastDetouchedBlas = null;
        this.dispatch = dispatch; // dispatcher function
    }

    add(blas) {
        this.stack.push(blas);
    }
    
    delete(blas) {
        let result = {};

        if (blas) {
            const index = this.stack.indexOf(blas);

            if (index >= 0) {
                const arr = this.stack.splice(index, 1);

                arr.forEach(item => {
                    const r = item.detouch();

                    result = { ...result, ...r};
                });

                this.lastDetouchedBlas = arr;

                return result;
            }
        }

        return false;
    }

    sendGlobalMessage(msg, context, pop = false) {
        if (this.stack.length > 0) {
            for (let i = this.stack.length; i > 0; i--) {
                const blas = this.stack[i - 1];

                if (blas.canAcceptMessage(msg)) {
                    return this.processMessage(blas, msg, context);
                } else if (pop) {
                    this.delete(blas);
                }
            }
        }

        return false;
    }

    sendMessage(msg, context) {
        try {
            return this.sendMessageInternal(msg, context);
        } catch (e) {
            console.error('Error occured on sendMessage() method: ', e);
        }
        
    }

    sendMessageInternal(msg, context) {
        let blas;

        const { stack } = this;
        const stackLength = stack.length;
        
        if (stackLength >= 1) {
            blas = this.stack[stackLength - 1];

            if (blas.canAcceptMessage(msg)) {
                return this.processMessage(blas, msg, context);
            }
        }

        return false;
    }

    processMessage(blas, msg, context) {
        let changedData = {
            error: null
        };

        let detouchData = null;
        let mesData = null;

        try {
            const res = blas[msg.getName()](msg, context);
            if (res) {
                
                if (res.action && typeof res.action === 'object' && typeof this.dispatch === 'function') {
                    this.dispatch(res.action);
                }
                
                if (res.pop) {
                    detouchData = this.delete(this.getCurrentStep());
                }

                if (res.newStep && !this.isStepInStack(res.newStep.getName())) {
                    this.add(res.newStep);
                }

                if (res.message) {
                    mesData = this.sendMessage(res.message, context);
                }

                if (res.changedData) {
                    changedData = { ...changedData, ...res.changedData };
                }
                
                if (detouchData) {
                    changedData = { ...changedData, ...detouchData };
                }

                if (mesData) {
                    changedData = { ...changedData, ...mesData };
                }
            }
        } catch (e) {
            if (msg.getName() === 'MessageInit') {
                this.delete(this.getCurrentStep());
                throw e;
            }

            changedData = {
                ...changedData,
                error: e
            };
        }

        return changedData;
    }

    isStepInStack(stepName) {
        const { stack } = this;
        let blas;

        if (stack.length > 0) {
            for (let i = 0; i < stack.length; i++) {
                blas = stack[i];
    
                if (blas.getName() === stepName) return true;
            }
        }
        
        return false;
    }

    isStepAtTheTop(stepName) {
        const { stack } = this;

        if (stack.length > 0) {
            const blas = stack[stack.length - 1];

            if (blas.getName() === stepName) return true;
        }

        return false;
    }

    getFirstStepInStack() {
        const { stack } = this;

        if (stack.length > 0) {
            return stack[0];
        }

        return null;
    }

    getCurrenStepName() {
        const { stack } = this;
        const stackLength = stack.length;

        if (stackLength > 0) return stack[stackLength - 1].getName();

        return null;
    }

    getCurrentStep() {
        const { stack } = this;

        if (stack.length > 0) {
            return stack[stack.length - 1];
        }
    
        return null;   
    }

    getCurrentStepClassName() {
        const { stack } = this;
        const stackLength = stack.length;

        if (stackLength > 0) {
            const blas = stack[stackLength - 1];
            return blas.getName();
        }

        return null;
    }

    getStack() {
        return this.stack;
    }

    getNames() {
        return this.stack.map((step) => {
            return step.getName();
        });
    }
}
