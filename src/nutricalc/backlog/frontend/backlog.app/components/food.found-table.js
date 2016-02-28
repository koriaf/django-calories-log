(function (){
    'use strict';
    var BacklogDispatcher = require('../dispatcher/BacklogDispatcher');
    var TableComponents = require('./base.table');
    var FoodAmountField = require('./food.amount-field');

    var FoundFoodTable = React.createClass({
        // FoundFoodTable
        getInitialState: function() {
            return {
                found_food: []
            }
        },

        componentDidMount: function() {
            var table = this;
            BacklogDispatcher.register(function(payload) {
                if (payload.action === 'renderFoundFood')
                {
                    table.setState({found_food: payload.found_food})
                }
            });
        },

        header: function() {
            return (<TableComponents.TableHeader>
                        <TableComponents.TableRow>
                            <TableComponents.TableCell value="Title" header/>
                            <TableComponents.TableCell value="Unit" header/>
                            <TableComponents.TableCell value="Ccal" header/>
                            <TableComponents.TableCell value="Prot" header/>
                            <TableComponents.TableCell value="Fat" header/>
                            <TableComponents.TableCell value="Carb" header/>
                            <TableComponents.TableCell value="Today" header/>
                        </TableComponents.TableRow>
                    </TableComponents.TableHeader>);
        },
        
        body: function(items) {
            return (<TableComponents.TableBody>
                      {items.map(function(item) {
                        return (
                          <TableComponents.TableRow key={item.id}>
                            <TableComponents.TableCell value={item.title} align='right'/>
                            <TableComponents.TableCell value={item.unit}/>
                            <TableComponents.TableCell value={item.ccal}/>
                            <TableComponents.TableCell value={item.nutr_prot}/>
                            <TableComponents.TableCell value={item.nutr_fat}/>
                            <TableComponents.TableCell value={item.nutr_carb}/>
                            <TableComponents.TableCell className='righted'>
                                <FoodAmountField food_data={item} />
                            </TableComponents.TableCell>
                          </TableComponents.TableRow>);
                      }, this)}
                    </TableComponents.TableBody>);
        },
        
        render: function() {
            return (<TableComponents.Table>
                      {this.header()} 
                      {this.body(this.state.found_food)}       
                    </TableComponents.Table>);
        }
    });

    module.exports = FoundFoodTable;
})();
