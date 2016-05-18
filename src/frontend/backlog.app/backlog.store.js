import { createStore, combineReducers } from 'redux';

(function (){
    // todo: const funct
    let symbols = require('./symbols');
    let dbStorage = require('./storage');

    const updateInitialState = () => {
        function loadData() {
            if (dbStorage.server) {
                // if DB initialized already
                dbStorage.fetchFoodFromBackend().then((allStoredFood) => {
                    store.dispatch({
                        type: symbols.rProductStateReset,
                        newProductList: allStoredFood
                    })
                });
            } else {
                // try later
                setTimeout(loadData, 100);
            }
        }
        loadData();
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
                    dbStorage.storeProductToBackend(action.product, action.newAmount);
                    
                    // update in state
                    let new_state = state.filter(p => p.id != action.product.id)
                    new_state = [...new_state, Object.assign(
                        {},
                        action.product,
                        {amount: action.newAmount}
                    )]

                    // save historical data
                    dbStorage.storeHistoricalData(new_state);

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
            for (let prod of store.getState().todayFood) {
                todayProducts[prod.id] = prod.amount
            }
            return action.productsFound.map(p => Object.assign({}, p, {
                amount: todayProducts[p.id]
            }));
        }
        return state;
    }

    const historicalData = (state = [], action) => {
        if (action.type == symbols.rHistoricalDataSave) {
            dbStorage.storeHistoricalData(action.newProducts);
            return state;
        } else if (action.type == symbols.rHistoricalDataUpdated) {
            return action.newHistoricalData;
        }
        return state;
    }

    let store = createStore(combineReducers({
        todayFood,
        foundFood,
        historicalData
    }))

    // store.subscribe(() =>
    //   console.log("Updated state:", store.getState())
    // )

    module.exports = store;

})();
