(() => {
    let backlogStore = require('../backlog.store');
    var symbols = require('../symbols');

    const ProductAmountField = ({product}) => {
        let input;

        return (<input type="text" className='form-control food-amount-field'
            key={product.id}
            value={product.amount}
            onChange={event => backlogStore.dispatch({
                type: symbols.rProductUpdated,
                product: product,
                newAmount: parseFloat(event.target.value)
            })}
            />
        )
    }

    module.exports = ProductAmountField
})();
