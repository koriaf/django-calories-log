(function () {
    'use strict';
    var BacklogDispatcher = require('../dispatcher/BacklogDispatcher');
    var Storage = require('../storage');

    var FoodAmountField = React.createClass({
        // FoodAmountField
        getInitialState: function() {
            var self = this; // for promises
            this.state = {value: 0};
            this.food_data = this.props.food_data;
            return {value: this.food_data.amount}
        },
        reFetchValue: function() {
            // fetch current product eaten amount from storage
            // TODO: get rid of storage here
            var field = this;
            function loadData() {
                var query_promise = Storage.getFood(field.food_data.id);
                if (query_promise !== null) {
                    query_promise.then(function(food_data){
                        // render it
                        if (food_data.length === 1) {
                            var found_food_row = food_data[0];
                            field.setState({value: found_food_row.amount});
                        }
                    })
                } else {
                    // DB not initialized yet, wait some time
                    setTimeout(loadData, 100);
                }
            }
            loadData();
        },
        componentDidMount: function() {
            var field = this;
            field.reFetchValue();
            this._token1 = BacklogDispatcher.register(function(payload) {
                if (payload.action === 'foodAmountUpdated')
                {
                    if ((field.food_data) && (payload.food_id === field.food_data.id))
                    {
                        field.reFetchValue();
                    }
                }
            });
        },
        componentWillUnmount: function() {
            BacklogDispatcher.unregister(this._token1);
        },
        handleTextFieldChange: function(event) {
            var new_value = event.target.value.replace(/[^\d\.\,]+/g,'');
            this.setState({value: new_value});
            this.food_data.amount = new_value;
            this.state.value = new_value;
            BacklogDispatcher.updateFoodAmount(this.food_data);
        },
        render: function() {
            var value = this.state.value;
            return (
                <input type="text" className='form-control food-amount-field'
                    value={value}
                    onChange={this.handleTextFieldChange} />
            );
        }
    });

    module.exports = FoodAmountField;
}());
