(function () {
    'use strict';
    var symbols = require('./symbols');
    var backlogStore = require('./backlog.store');

    var StorageClass = class StorageClass {
        // class to work with local IndexedDB stored data.
        // handles events of food addition, update or deletion.
        // in future will sync local IndexedDB data with remote django backend
        // Sole purpose of it's existance - allow data to persists between
        // page reloads.
        constructor() {
            this.server = null;
            this.storeProductToBackend.bind(this);
            this.storeHistoricalData.bind(this);
            this.fetchHistoricalData.bind(this);
            this.fetchFoodFromBackend.bind(this);
        }

        fetchFoodFromBackend() {
            if (this.server) {
                let backlog_table = this.server.backlog;
                return backlog_table.query().filter().execute();
            } else {
                return null;
            }
        }

        storeProductToBackend(product, amount) {
            // updates amount of today food in database or creates such record in db
            // search, if food already added, and update amount
            let backlog_table = this.server.backlog;
            backlog_table.query().filter(
                'id',
                product.id
            ).execute().then(function (results) {
                var added_food = null;
                var update_promise = null;
                if (results.length === 0) {
                    // no food added yet
                    added_food = product;
                    added_food.amount = amount;
                    update_promise = backlog_table.add(product);
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
                return update_promise;
            }).catch(error => console.log(error));
        }

        storeHistoricalData(productsToday) {
            // Calculates today total values and saves to indexedDB
            // so we can draw some graphs about how we eat
            // TODO: move process logic level up and here just store it

            var self = this;
            let totals = {
                ccal: 0,
                prot: 0,
                carb: 0,
                fat: 0,
            };
            // Calculate totals values
            productsToday.forEach(function(product){
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
            yesterday = yesterday.toISOString().slice(0, 10); // ugly
            
            let historyTable = self.server.historicalData;
            // show old data
            historyTable.query().filter('date', yesterday).execute().then(old_records => {
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
            }).then((result) => {
                // data saved (or not)
                // set current whole historical data to current state, where it can be
                // accessed by graph components
                self.fetchHistoricalData().then(graphData => {
                    backlogStore.dispatch({
                        type: symbols.rHistoricalDataUpdated,
                        newHistoricalData: graphData
                    })
                });
                return;
            }).catch(error => console.log(error));
        }

        fetchHistoricalData() {
            /* Return promise, which resolved provides all historical data for this user
            */
            let historyTable = this.server.historicalData;
            return historyTable.query().filter().execute();
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
