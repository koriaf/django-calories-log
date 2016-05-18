(() => {
    let TableComponents = require('./base.table');
    let ProductAmountField = require('./amount-field.product.component');

    const ProductRow = ({product, formatValues=false}) => {
        if (formatValues === true) {
            if (product.ccal && product.ccal.toFixed) {
                product.ccal = product.ccal.toFixed(0) || '';
            }
            if (product.nutr_prot && product.nutr_prot.toFixed) {
                product.nutr_prot = product.nutr_prot.toFixed(1);
            }
            if (product.nutr_fat && product.nutr_fat.toFixed) {
                product.nutr_fat = product.nutr_fat.toFixed(1);
            }
            if (product.nutr_carb && product.nutr_carb.toFixed) {
                product.nutr_carb = product.nutr_carb.toFixed(1);
            }
        }
        return (
            <TableComponents.TableRow key={product.id}>
                <TableComponents.TableCell value={product.title} />
                <TableComponents.TableCell value={product.unit} className='righted' />
                <TableComponents.TableCell value={product.ccal} className='righted'/>
                <TableComponents.TableCell value={product.nutr_prot} className='righted'/>
                <TableComponents.TableCell value={product.nutr_fat} className='righted'/>
                <TableComponents.TableCell value={product.nutr_carb} className='righted'/>
                <TableComponents.TableCell className='righted'>
                    <ProductAmountField key={product.id} product={product} />
                </TableComponents.TableCell>
                <TableComponents.TableCell value={product.today_ccal} className='righted'/>
            </TableComponents.TableRow>
        )
    };
    module.exports = ProductRow;
})();
