import { createStore, combineReducers } from 'redux';

(function (){
    const symbols = require('./symbols');

    const updateInitialState = () => {
        function loadBackendData() {
            /* When application almost ready - dbStorage probably not.
            It needs some milliseconds to initialize and start to return some data.
            So, we just ask it every 100 msec for initialization fact, and, as
            soon it's done - load all initial data from it.

            In future we also may want to load it from the remote REST API

            */
            if (backlogStore.dbStorage.server) {
                // if DB initialized already
                backlogStore.dbStorage.fetchFoodFromBackend().then(allStoredFood => {
                    backlogStore.dispatch({
                        type: symbols.rProductStateReset,
                        newProductList: allStoredFood
                    })
                })
                backlogStore.dbStorage.fetchHistoricalData().then(historicalData => {
                    backlogStore.dispatch({
                        type: symbols.rHistoricalDataUpdated,
                        newHistoricalData: historicalData
                    })
                })
            } else {
                // try later
                setTimeout(loadBackendData, 100);
            }
        }
        loadBackendData();
    }

    const todayFood = (state, action) => {
        if (state === undefined) {
            /// get initial date
            // add to the end of the execution queue
            setTimeout(updateInitialState, 0);
            return [];
        }

        switch (action.type) {
            case symbols.rProductUpdated:
                // remove old product from state (if exists), add it again
                // with new amount to the end of list
                if (action.product) {
                    // update in backend storage (IndexedDB currently), just for re-fetch after page reload
                    // we don't care about result, so, don't wait till promise resolve
                    backlogStore.dbStorage.storeProductToBackend(action.product, action.newAmount);
                    
                    // update in state
                    let new_state = state.filter(p => p.id != action.product.id)
                    new_state = [...new_state, Object.assign(
                        {},
                        action.product,
                        {amount: action.newAmount}
                    )]

                    // save historical data
                    backlogStore.dbStorage.storeHistoricalData(new_state);

                    return new_state;
                }
                else {
                    // just repaint event, no product updated really
                    return state;
                }
            case symbols.rProductStateReset:
                return action.newProductList;
            default:
                return state;
        }
    }

    const foundFood = (state = [], action) => {
        if (action.type === symbols.rProductSearchSuccess) {
            let todayProducts = {};
            // Is it fine to get state of store during different part of state update?
            for (let prod of backlogStore.getState().todayFood) {
                todayProducts[prod.id] = prod.amount
            }
            return action.productsFound.map(p => Object.assign({}, p, {
                amount: todayProducts[p.id]
            }));
        }
        return state;
    }

    const historicalData = (state = [], action) => {
        switch (action.type) {
            case symbols.rHistoricalDataUpdated:
                return action.newHistoricalData;
            default:
                return state;
        }
        return state;
    }

    let backlogStore = createStore(combineReducers({
        todayFood,
        foundFood,
        historicalData
    }))

    module.exports = { backlogStore };
})();
