(function (){
    var DispatcherClass = require('flux').Dispatcher;

    var BacklogDispatcher = new DispatcherClass();

    BacklogDispatcher.renderFoundFood = function(food_data) {
        // receives list of food items (from ajax request)
        // allows FoundFoodTable to be repainted
        this.dispatch({
            action: 'renderFoundFood',
            found_food: food_data
        });
    }

    BacklogDispatcher.updateFoodAmount = function(food_row) {
        // received food_row with updated amount
        // allow store to save data and re-send new action foodAmountUpdated,
        // which will re-render all items
        this.dispatch({
            action: 'updateFoodAmount',
            food_row: food_row
        });
    }

    BacklogDispatcher.foodAmountUpdated = function(food_id) {
        // trigger re-render all amount fields
        this.dispatch({
            action: 'foodAmountUpdated',
            food_id: food_id,
        });
    }

    module.exports = BacklogDispatcher;
})();
