(function (){
    /* Renders simple graph about last 10 days nutrition.
    It's ugly prototype, I'll refactor it later, when I know what do I want here...
    // chuckchanedizainer

    */
    'use strict';
    var Storage = require('../storage');
    let backlogStore = require('../backlog.store');
    let symbols = require('../symbols');

    class HistoricalDataGraph extends React.Component {
        constructor(props) {
            super(props);
            this._resetState()
            this.render.bind(this);
            this._renderContainer.bind(this);
            this._renderRow.bind(this);
            function loadData() {
                if (Storage.server) {
                    // as soon server is available - fetch old historical data
                    // from backend to set store state, allowing graph to
                    // repaint
                    Storage.fetchHistoricalData().then(historicalData => {
                        backlogStore.dispatch({
                            type: symbols.rHistoricalDataUpdated,
                            newHistoricalData: historicalData
                        })
                    });
                } else {
                    setTimeout(loadData, 100);
                }
            }
            loadData();
        }

        _resetState() {
            this.state = {
                rows: [],
            };
        }

        componentDidMount() {
            backlogStore.subscribe(() => {
                // console.log("Historical Data Updated, repainting graphs...");
                this.setState({rows: backlogStore.getState().historicalData})
                // console.log(this.state);
            })
        }

        render() {
            return this._renderContainer(this.state.rows);
        }

        _renderContainer(rows) {
            rows.sort((a, b) => a['date'] >= b['date']);
            rows = rows.slice(-10);
            return (
                <div className='graph-container'>
                    {rows.map(this._renderRow)}
                </div>
            )
        }
        ///
        _renderRow(row) {
            let totalDayAmount = row.totals.prot + row.totals.carb + row.totals.fat;
            let scaleRatio = 0.5;
            let date = new Date(row.date);
            let dispProt = row.totals.prot * scaleRatio;
            let dispCarb = row.totals.carb * scaleRatio;
            let dispFat = row.totals.fat * scaleRatio;
            let protStyle = {
                height: `${dispProt}px`,
                backgroundColor: '#99CC00'
            };
            let carbStyle = {
                height: `${dispCarb}px`,
                backgroundColor: '#CCCC99'
            };
            let fatStyle = {
                height: `${dispFat}px`,
                backgroundColor: '#FFFF00'
            };
            return (<div className='graph-row'>
                <div className='graph-item' style={protStyle}>Prot {row.totals.prot}</div>
                <div className='graph-item' style={carbStyle}>Carb {row.totals.carb}</div>
                <div className='graph-item' style={fatStyle}>Fat {row.totals.fat}</div>
                <div className='graph-label' >{date.toGMTString().slice(5, 11)}<br/>{row.totals.ccal} ccal</div>
            </div>);
        }
    }

    module.exports = HistoricalDataGraph;
})();
