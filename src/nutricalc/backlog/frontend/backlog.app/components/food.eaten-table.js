(function (){

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
                            <TableComponents.TableCell value="Ccal" header className='righted'/>
                            <TableComponents.TableCell value="Prot" header className='righted'/>
                            <TableComponents.TableCell value="Fat" header className='righted'/>
                            <TableComponents.TableCell value="Carb" header className='righted'/>
                            <TableComponents.TableCell value="Today" header className='righted'/>
                        </TableComponents.TableRow>
                    </TableComponents.TableHeader>);
        },
        
        body: function(items) {
            return (<TableComponents.TableBody>
                      {items.map(function(food_row) {  
                        return (
                          <TableComponents.TableRow key={food_row.id}>
                            <TableComponents.TableCell value={food_row.title} className='righted'/>
                            <TableComponents.TableCell value={food_row.unit} className='righted'/>
                            <TableComponents.TableCell value={food_row.ccal} className='righted'/>
                            <TableComponents.TableCell value={food_row.nutr_prot} className='righted'/>
                            <TableComponents.TableCell value={food_row.nutr_fat} className='righted'/>
                            <TableComponents.TableCell value={food_row.nutr_carb} className='righted'/>
                            <TableComponents.TableCell className='righted'>
                                <FoodAmountField food_data={food_row} />
                            </TableComponents.TableCell>
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
