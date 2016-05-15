(function () {
    'use strict';
    var BacklogDispatcher = require('./dispatcher/BacklogDispatcher');
    var appSymbols = require('./symbols');

    var StorageClass = class StorageClass {
        // class to work with local IndexedDB stored data.
        // handles events of food addition, update or deletion.
        constructor() {
            this.server = null;
            this.addFood.bind(this);
            this.saveForYesterday.bind(this);

            var storage = this;

            BacklogDispatcher.register(function(payload) {
                switch (payload.action) {
                    case BacklogDispatcher.appSymbols.updateFoodAmount:
                        // payload.food_row contains food_row with new updated amount
                        storage.addFood(payload.food_row, payload.food_row.amount);
                        break;
                    case BacklogDispatcher.appSymbols.saveForYesterdayInitiated:
                        storage.saveForYesterday();
                        break;
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
                let backlog_table = this.server.backlog;
                return backlog_table.query().filter().execute();
            } else {
                return null;
            }
        }

        addFood(food_data, amount) {
            // updates amount of today food in database or creates such record in db
            // search, if food already added, and update amount
            // console.log("Adding/updating food ", food_data);
            let backlog_table = this.server.backlog;
            backlog_table.query().filter(
                'id',
                food_data.id
            ).execute().then(function (results) {
                var added_food = null;
                var update_promise = null;
                if (results.length === 0) {
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
                }
                if (update_promise !== null) {
                    update_promise.then(function () {
                        BacklogDispatcher.foodAmountUpdated(food_data.id);
                    });
                }
            }).catch(console.log.bind(console));
        }

        saveForYesterday() {
            var self = this;
            self.getAllStoredFood().then(function(result) {
                let totals = {
                    ccal: 0,
                    prot: 0,
                    carb: 0,
                    fat: 0,
                };
                // Calculate totals values
                result.forEach(function(product){
                    let amount = parseFloat(product.amount);
                    let multiplier = product.unit == '100gr' ? 0.01 : 1;
                    let mass = multiplier * amount;

                    totals.ccal += product.ccal * mass;
                    totals.prot += product.nutr_prot * mass;
                    totals.carb += product.nutr_carb * mass;
                    totals.fat += product.nutr_fat * mass;
                });
                totals.ccal = Math.round(totals.ccal);
                totals.prot = Math.round(totals.prot);
                totals.carb = Math.round(totals.carb);
                totals.fat = Math.round(totals.fat);
                // save totals values with yesterday key
                let yesterday = new Date();
                yesterday.setDate(yesterday.getDate() - 1);
                yesterday = yesterday.toISOString().slice(0, 10); // ugly
                
                let historyTable = self.server.historicalData;
                // show old data
                historyTable.query().filter('date', yesterday).execute().then(function (old_records) {
                    let ret = null;
                    let newHistoryRecord = {
                        date: yesterday,
                        totals: totals,
                    };
                    if (old_records.length == 0) {
                        ret = historyTable.add(newHistoryRecord)
                    } else {
                        newHistoryRecord = old_records[0]
                        newHistoryRecord.totals = totals;
                        ret = historyTable.update(newHistoryRecord);
                    }
                    return ret;
                }).then(function (){
                    // data saved (or not), fire event about it;
                    BacklogDispatcher.historicalDataUpdated();
                    return;
                }).catch(console.log.bind(this));

            }).catch(console.log.bind(console));
        }
    };

    var Storage = new StorageClass();

    // db - global package
    db.open({
        server: 'nutricalc.backlog',
        version: 2,
        schema: {
            backlog: {
                key: {keyPath: 'id', autoIncrement: true}
            },
            historicalData: {
                key: {keyPath: 'id', autoIncrement: true}
            }
        }
    }).then(function (s) {
        Storage.server = s;
    });

    module.exports = Storage;

}());
