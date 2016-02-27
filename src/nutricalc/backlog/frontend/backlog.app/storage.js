(function (){
    var BacklogDispatcher = require('./dispatcher/BacklogDispatcher');

    class StorageClass {
        // class to work with local IndexedDB stored data.
        // handles events of food addition, update or deletion.
        // allow 
        constructor() {
            this.server = null;
            this.addFood.bind(this);

            var storage = this;

            BacklogDispatcher.register(function(payload) {
                if (payload.action === 'updateFoodAmount')
                {
                    // payload.food_row contains food_row with new updated amount
                    storage.addFood(payload.food_row, payload.food_row.amount);
                }
            });
        }

        getFood(food_id) {
            // returns promise, which will fetch all food with given ID
            var backlog_table = this.server.backlog;
            return backlog_table.query().filter(
                'id',
                food_id
            ).execute();
        }

        getAllStoredFood() {
            if (this.server) {
                var backlog_table = this.server.backlog;
                return backlog_table.query().filter().execute();
            } else {
                return null;
            }
        }

        addFood(food_data, amount) {
            // updates amount of today food in database or creates such record in db
            // search, if food already added, and update amount
            // console.log("Adding/updating food ", food_data);
            var backlog_table = this.server.backlog;
            backlog_table.query().filter(
                'id',
                food_data.id
            ).execute().then(function (results) {
                var added_food = null;
                var update_promise = null;
                if (results.length == 0) {
                    // no food added yet
                    added_food = food_data;
                    added_food.amount = amount;
                    update_promise = backlog_table.add(food_data);
                } else {
                    added_food = results[0];
                    added_food.amount = amount;
                    if (amount > 0) {
                        update_promise = backlog_table.update(added_food);
                    } else {
                        // remove food from db
                        update_promise = backlog_table.remove(added_food.id);
                    }
                };
                if (update_promise !== null) {
                    update_promise.then(function() {
                        BacklogDispatcher.foodAmountUpdated(food_data.id);
                    });
                }
            });
        }
    }

    var Storage = new StorageClass();

    db.open({
        server: 'nutricalc.backlog',
        version: 1,
        schema: {
            backlog: {
                key: {keyPath: 'id', autoIncrement: true},
            }
        }
    }).then(function (s) {
        Storage.server = s;
    });

    module.exports = Storage;

})();
