(function (){
    'use strict';
    let TableComponents = require('./base.table');
    let ProductRow = require('./row.product.component');
    let ProductStatRow = require('./stat-row.product.component');
    let Storage = require('../storage');
    var backlogStore = require('../backlog.store');
    var symbols = require('../symbols');

    let sortBy = 'title';
    let sortFunc = (a, b) => a[sortBy] >= b[sortBy];

    var EatenFoodTable = React.createClass({
        getInitialState: function() {
            return {products: []}
        },
        componentDidMount: function() {
            backlogStore.subscribe(() => {
                this.setState({products: backlogStore.getState().todayFood})
            })
        },

        header: function() {
            return (
                <TableComponents.TableHeader>
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
                </TableComponents.TableHeader>
            );
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
            /// TODO: here we use in-place sort, because next time sort will
            /// go faster. But it's not much redux way - component updates it's 
            /// own state. But it's own state and component doesn't share it
            /// with anybody.
            /// So, need to think about that and probably just remove in-place sorting.
            return (
                <TableComponents.TableBody>
                {items.sort(sortFunc).map(function(food_row) {
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
                    return <ProductRow key={food_row.id} product={food_row} formatValues={false} />
                }, this)}
                </TableComponents.TableBody>
            );
        },

        render: function() {
            let products = this.state.products;
            return (
                <TableComponents.Table>
                    {this.header()}
                    <ProductStatRow products={products} />
                    {this.body(products)}       
                </TableComponents.Table>
            );
        }
    });

    module.exports = EatenFoodTable;

})();
