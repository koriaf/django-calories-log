(() => {
    let TableComponents = require('./base.table');

    const ProductStatRow = ({products}) => {
        let totalRow = {
            day: 'today',
            mass: 0,
            prot: 0,
            carb: 0,
            fat: 0,
            ccal: 0,
            products: [],
        }

        // TODO: make this math a little more nice
        for (let product of products) {
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

            totalRow.prot += this_prot;
            totalRow.fat += this_fat;
            totalRow.carb += this_carb;
            totalRow.ccal += this_ccal;
            totalRow.mass += this_amount;
        }
        let total_nutr = totalRow.prot + totalRow.fat + totalRow.carb;
        totalRow.prot_perc = Math.round(100 * totalRow.prot / total_nutr);
        totalRow.fat_perc = Math.round(100 * totalRow.fat / total_nutr);
        totalRow.carb_perc = Math.round(100 * totalRow.carb / total_nutr);

        totalRow.prot_perc_readable = `${totalRow.prot_perc}%`;
        totalRow.fat_perc_readable = `${totalRow.fat_perc}%`;
        totalRow.carb_perc_readable = `${totalRow.carb_perc}%`;

        return (
            <TableComponents.TableHeader className='stat-row'>
                <TableComponents.TableRow>
                    <TableComponents.TableCell value="Total:" className='bold'/>
                    <TableComponents.TableCell value=""/>
                    <TableComponents.TableCell className='righted bold'/>
                    <TableComponents.TableCell className='righted bold' value={Math.round(totalRow.prot)}/>
                    <TableComponents.TableCell className='righted bold' value={Math.round(totalRow.fat)}/>
                    <TableComponents.TableCell className='righted bold' value={Math.round(totalRow.carb)}/>
                    <TableComponents.TableCell className='righted bold'/>
                    <TableComponents.TableCell className='righted bold' value={Math.round(totalRow.ccal)}/>
                    <TableComponents.TableCell className='righted bold'/>
                </TableComponents.TableRow>
                <TableComponents.TableRow>
                    <TableComponents.TableCell value="" className='righted bold'/> 
                    <TableComponents.TableCell value=""/>
                    <TableComponents.TableCell className='righted bold' value=""/>
                    <TableComponents.TableCell className='righted bold' value={totalRow.prot_perc_readable}/> 
                    <TableComponents.TableCell className='righted bold' value={totalRow.fat_perc_readable}/>
                    <TableComponents.TableCell className='righted bold' value={totalRow.carb_perc_readable}/> 
                    <TableComponents.TableCell className='righted bold' value=""/>
                    <TableComponents.TableCell className='righted bold' value=""/>
                    <TableComponents.TableCell className='righted bold' value=""/>
                </TableComponents.TableRow>
            </TableComponents.TableHeader>
        )
    };
    module.exports = { ProductStatRow };
})();
