(function (){
    'use strict';
    let BacklogDispatcher = require('../dispatcher/BacklogDispatcher');
    let TableComponents = require('./base.table');
    let FoodAmountField = require('./food.amount-field');
    let StatRow = require('./food.stat-row');
    let Storage = require('../storage');
    let sortBy = 'title';
    let sortFunc = (a, b) => a[sortBy] >= b[sortBy];

    var EatenFoodTable = React.createClass({
        // EatenFoodTable
        getInitialState: function() {
            return {
                all_stored_food: []
            }
        },
        reFetchFood: function() {
            // fetch all items from indexedb and update view representation
            var self = this;
            function loadData() {
                var query_promise = Storage.getAllStoredFood();
                if (query_promise !== null) {
                    query_promise.then(function(all_stored_food){
                        // render it
                        self.setState({all_stored_food: all_stored_food})
                    })
                } else {
                    // DB not initialized yet, wait some time
                    setTimeout(loadData, 100);
                }
            }
            loadData();
        },
        componentDidMount: function() {
            this.reFetchFood();
            var table = this;
            BacklogDispatcher.register(function(payload) {
                if (payload.action === BacklogDispatcher.appSymbols.foodAmountUpdated)
                {
                    table.reFetchFood();
                }
            });
        },

        header: function() {
            return (<TableComponents.TableHeader>
                        <TableComponents.TableRow>
                            <TableComponents.TableCell value="Title ↕" header onClick={this.changeSortOrder} data-sort-by='title'/>
                            <TableComponents.TableCell value="Unit" header/>
                            <TableComponents.TableCell value="Ccal ↕" header className='righted' onClick={this.changeSortOrder} data-sort-by='ccal'/>
                            <TableComponents.TableCell value="Prot" header className='righted'/>
                            <TableComponents.TableCell value="Fat" header className='righted'/>
                            <TableComponents.TableCell value="Carb" header className='righted'/>
                            <TableComponents.TableCell value="Today ↕" header className='righted' onClick={this.changeSortOrder} data-sort-by='amount'/>
                            <TableComponents.TableCell value="Total ccal" header className='righted'/>
                        </TableComponents.TableRow>
                    </TableComponents.TableHeader>);
        },

        changeSortOrder: function(dat) {
            sortBy = dat.target.dataset.sortBy;
            if ((sortBy === 'ccal') || (sortBy === 'amount')) {
                sortFunc = (a, b) => parseInt(a[sortBy], 10) > parseInt(b[sortBy], 10);
            } else {
                sortFunc = (a, b) => a[sortBy] >= b[sortBy];
            }
            this.setState(this.state);
        },
        
        body: function(items) {
            let sorted_items = items.sort(sortFunc);
            return (<TableComponents.TableBody>
                      {sorted_items.map(function(food_row) {
                        if (!food_row.ccal) {
                            food_row.ccal = 0;
                        }
                        food_row.ccal = parseFloat(food_row.ccal).toFixed(0) || '';
                        food_row.nutr_prot = parseFloat(food_row.nutr_prot).toFixed(1);
                        food_row.nutr_fat = parseFloat(food_row.nutr_fat).toFixed(1);
                        food_row.nutr_carb = parseFloat(food_row.nutr_carb).toFixed(1);

                        if (food_row.unit === '100gr') {
                            food_row.today_ccal = food_row.ccal / 100.0 * food_row.amount;
                            food_row.today_ccal = food_row.today_ccal.toFixed(1);
                        } else {
                            food_row.today_ccal = '?';
                        }

                        return (
                          <TableComponents.TableRow key={food_row.id}>
                            <TableComponents.TableCell value={food_row.title} />
                            <TableComponents.TableCell value={food_row.unit} className='righted'/>
                            <TableComponents.TableCell value={food_row.ccal} className='righted'/>
                            <TableComponents.TableCell value={food_row.nutr_prot} className='righted'/>
                            <TableComponents.TableCell value={food_row.nutr_fat} className='righted'/>
                            <TableComponents.TableCell value={food_row.nutr_carb} className='righted'/>
                            <TableComponents.TableCell className='righted'>
                                <FoodAmountField food_data={food_row} />
                            </TableComponents.TableCell>
                            <TableComponents.TableCell value={food_row.today_ccal} className='righted'/>
                          </TableComponents.TableRow>);
                      }, this)}
                    </TableComponents.TableBody>);
        },

        render: function() {
            return (
                <TableComponents.Table>
                    {this.header()}
                    <StatRow />
                    {this.body(this.state.all_stored_food)}       
                </TableComponents.Table>
            );
        }
    });

    module.exports = EatenFoodTable;

})();
