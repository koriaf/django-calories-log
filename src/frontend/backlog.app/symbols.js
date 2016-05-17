(function () {
    'use strict';
    var appSymbols = {
        updateFoodAmount: Symbol(),
        foodAmountUpdated: Symbol(),
        saveForYesterdayInitiated: Symbol(),
        historicalDataUpdated: Symbol(),
        renderFoundFood: Symbol(),
    };
    module.exports = appSymbols;
}());
