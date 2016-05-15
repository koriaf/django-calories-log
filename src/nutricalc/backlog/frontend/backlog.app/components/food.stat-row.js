(function (){
    'use strict';
    var BacklogDispatcher = require('../dispatcher/BacklogDispatcher');
    var TableComponents = require('./base.table');
    var Storage = require('../storage');

    class StatRow extends React.Component {
        constructor(props) {
            super(props);
            this._resetState()
        }

        _resetState() {
            this.state = {
                day: 'today',
                mass: 0,
                prot: 0,
                carb: 0,
                fat: 0,
                ccal: 0,
                products: [],
            };
        }

        _processStat(food_data) {
            this._resetState();
            for (let product of food_data) {
                let this_amount = parseFloat(product.amount);
                let multiplier = 1;
                if (product.unit == '100gr') {
                    multiplier = 0.01;
                }
                let this_mass = multiplier * this_amount;

                let this_ccal = product.ccal * this_mass;
                let this_prot = product.nutr_prot * this_mass;
                let this_carb = product.nutr_carb * this_mass;
                let this_fat = product.nutr_fat * this_mass;

                this.state.prot += this_prot;
                this.state.fat += this_fat;
                this.state.carb += this_carb;
                this.state.ccal += this_ccal;
                this.state.mass += this_amount;
            }
            let total_nutr = this.state.prot + this.state.fat + this.state.carb;
            this.state.prot_perc = Math.round(100 * this.state.prot / total_nutr);
            this.state.fat_perc = Math.round(100 * this.state.fat / total_nutr);
            this.state.carb_perc = Math.round(100 * this.state.carb / total_nutr);
            return;
        }

        reFetchFood() {
            // fetch all items from indexedb and update view representation
            var self = this;
            // console.log('calculating food stat');
            function loadData() {
                var query_promise = Storage.getAllStoredFood();
                if (query_promise !== null) {
                    query_promise.then(function(all_stored_food){
                        // render it
                        self._processStat(all_stored_food)
                    })
                } else {
                    // DB not initialized yet, wait some time
                    setTimeout(loadData, 100);
                }
            }
            loadData();
        }

        componentDidMount() {
            this.reFetchFood();
            var statrow = this;
            BacklogDispatcher.register(function(payload) {
                if (payload.action === 'foodAmountUpdated')
                {
                    statrow.reFetchFood();
                }
            });
        }

        render() {
            this.prot_perc_readable = `${this.state.prot_perc}%`;
            this.fat_perc_readable = `${this.state.fat_perc}%`;
            this.carb_perc_readable = `${this.state.carb_perc}%`;
            return(
                <TableComponents.TableHeader className='stat-row'>
                    <TableComponents.TableRow>
                        <TableComponents.TableCell value="Total:" className='bold'/>
                        <TableComponents.TableCell value=""/>
                        <TableComponents.TableCell className='righted bold'/>
                        <TableComponents.TableCell className='righted bold' value={Math.round(this.state.prot)}/>
                        <TableComponents.TableCell className='righted bold' value={Math.round(this.state.fat)}/>
                        <TableComponents.TableCell className='righted bold' value={Math.round(this.state.carb)}/>
                        <TableComponents.TableCell className='righted bold'/>
                        <TableComponents.TableCell className='righted bold' value={Math.round(this.state.ccal)}/>
                        <TableComponents.TableCell className='righted bold'/>
                    </TableComponents.TableRow>
                    <TableComponents.TableRow>
                        <TableComponents.TableCell value="" className='righted bold'/> 
                        <TableComponents.TableCell value=""/>
                        <TableComponents.TableCell className='righted bold' value=""/>
                        <TableComponents.TableCell className='righted bold' value={this.prot_perc_readable}/> 
                        <TableComponents.TableCell className='righted bold' value={this.fat_perc_readable}/>
                        <TableComponents.TableCell className='righted bold' value={this.carb_perc_readable}/> 
                        <TableComponents.TableCell className='righted bold' value=""/>
                        <TableComponents.TableCell className='righted bold' value=""/>
                        <TableComponents.TableCell className='righted bold' value=""/>
                    </TableComponents.TableRow>
                </TableComponents.TableHeader>
            );
        }
    }

    module.exports = StatRow;
})();
