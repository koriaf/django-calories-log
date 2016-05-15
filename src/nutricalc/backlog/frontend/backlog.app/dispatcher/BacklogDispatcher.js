(function () {
    'use strict';
    var DispatcherClass = require('flux').Dispatcher;

    var BacklogDispatcher = new DispatcherClass();

    BacklogDispatcher.appSymbols = require('../symbols');

    BacklogDispatcher.renderFoundFood = function (food_data) {
        // receives list of food items (from ajax request)
        // allows FoundFoodTable to be repainted
        this.dispatch({
            action: BacklogDispatcher.appSymbols.renderFoundFood,
            found_food: food_data
        });
    };

    BacklogDispatcher.updateFoodAmount = function (food_row) {
        // received food_row with updated amount
        // allow store to save data and re-send new action foodAmountUpdated,
        // which will re-render all items
        this.dispatch({
            action: BacklogDispatcher.appSymbols.updateFoodAmount,
            food_row: food_row
        });
    };

    BacklogDispatcher.foodAmountUpdated = function (food_id) {
        // trigger re-render all amount fields
        this.dispatch({
            action: BacklogDispatcher.appSymbols.foodAmountUpdated,
            food_id: food_id
        });
    };

    BacklogDispatcher.saveForYesterday = function () {
        this.dispatch({
            action: BacklogDispatcher.appSymbols.saveForYesterdayInitiated,
        });
    };

    BacklogDispatcher.historicalDataUpdated = function () {
        this.dispatch({
            action: BacklogDispatcher.appSymbols.historicalDataUpdated,
        });
    };

    BacklogDispatcher.handleError = function (errorResp) {
        if (errorResp.status >= 400 && errorResp.status < 500) {
            // user-defined error
            alert("Error: " + errorResp.data.readable_message || errorResp.data || "Not specified");
        } else {
            // some server error...
            // we don't care about IE.
            console.log(errorResp);
        }
    };

    module.exports = BacklogDispatcher;
}());
