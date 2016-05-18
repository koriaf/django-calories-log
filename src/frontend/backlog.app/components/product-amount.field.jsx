(() => {
    let { backlogStore } = require('../backlog.store');
    var symbols = require('../symbols');

    const ProductAmountField = ({product}) => {
        let currentValue = product.amount;

        return (<input type="text" className='form-control food-amount-field'
            key={product.id}
            value={currentValue}
            onChange={event => {
                let newStringValue = event.target.value;
                let newValue = parseFloat(newStringValue);
                if (isNaN(newValue)) {
                    // if user entered something wrong - deny it
                    newValue = currentValue;
                }
                backlogStore.dispatch({
                    type: symbols.rProductUpdated,
                    product: product,
                    newAmount: newValue
                });
                currentValue = newValue;
                product.amount = newValue;
            }}
            />
        )
    }

    module.exports = { ProductAmountField }
})();
