(function (){
    'use strict';
    var BacklogDispatcher = require('../dispatcher/BacklogDispatcher');
    var TableComponents = require('./base.table');
    var FoodAmountField = require('./food.amount-field');
    var StatRow = require('./food.stat-row');
    var Storage = require('../storage');

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
                if (payload.action === 'foodAmountUpdated')
                {
                    table.reFetchFood();
                }
            });
        },

        header: function() {
            return (<TableComponents.TableHeader>
                        <TableComponents.TableRow>
                            <TableComponents.TableCell value="" header/>
                            <TableComponents.TableCell value="" header/>
                            <TableComponents.TableCell value="Unit Ccal" header className='righted'/>
                            <TableComponents.TableCell value="Prot" header className='righted'/>
                            <TableComponents.TableCell value="Fat" header className='righted'/>
                            <TableComponents.TableCell value="Carb" header className='righted'/>
                            <TableComponents.TableCell value="Today" header className='righted'/>
                            <TableComponents.TableCell value="Total ccal" header className='righted'/>
                        </TableComponents.TableRow>
                    </TableComponents.TableHeader>);
        },
        
        body: function(items) {
            return (<TableComponents.TableBody>
                      {items.map(function(food_row) {
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
