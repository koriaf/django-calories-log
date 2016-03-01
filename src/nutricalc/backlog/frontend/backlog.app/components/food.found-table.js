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
                            <TableComponents.TableCell value="Title" header className='righted'/>
                            <TableComponents.TableCell value="Unit" header className='righted'/>
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
                      {items.map(function(item) {
                        if (item.ccal) {
                            item.ccal = item.ccal.toFixed(1);
                        }
                        if (item.nutr_prot) {
                            item.nutr_prot = item.nutr_prot.toFixed(1);
                        }
                        if (item.nutr_fat) {
                            item.nutr_fat = item.nutr_fat.toFixed(1);
                        }
                        if (item.nutr_carb) {
                            item.nutr_carb = item.nutr_carb.toFixed(1);
                        }
                        return (
                          <TableComponents.TableRow key={item.id}>
                            <TableComponents.TableCell value={item.title}/>
                            <TableComponents.TableCell value={item.unit} className='righted'/>
                            <TableComponents.TableCell value={item.ccal} className='righted'/>
                            <TableComponents.TableCell value={item.nutr_prot} className='righted'/>
                            <TableComponents.TableCell value={item.nutr_fat} className='righted'/>
                            <TableComponents.TableCell value={item.nutr_carb} className='righted'/>
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
