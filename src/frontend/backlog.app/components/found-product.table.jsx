(function (){
    'use strict';
    let TableComponents = require('./base.table');
    let { ProductRow } = require('./product.row');
    let { backlogStore } = require('../backlog.store');
    let symbols = require('../symbols');

    let FoundFoodTable = React.createClass({
        // FoundFoodTable
        getInitialState: function() {
            return {products: []}
        },

        componentDidMount: function() {
            backlogStore.subscribe(() => {
                this.setState({products: backlogStore.getState().foundFood})
            })
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
                        return <ProductRow key={item.id} product={item} formatValues={true}/>;
                      }, this)}
                    </TableComponents.TableBody>);
        },
        
        render: function() {
            if (this.state.products.length == 0) {
                return (<p></p>);
            }
            return (<TableComponents.Table>
                      {this.header()} 
                      {this.body(this.state.products)}       
                    </TableComponents.Table>);
        }
    });

    module.exports = { FoundFoodTable };
})();
