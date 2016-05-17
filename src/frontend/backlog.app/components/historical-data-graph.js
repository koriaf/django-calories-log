(function (){
    /* Renders simple graph about last 10 days nutrition.
    It's ugly prototype, I'll refactor it later, when I know what do I want here...
    // chuckchanedizainer

    */
    'use strict';
    var BacklogDispatcher = require('../dispatcher/BacklogDispatcher');
    var Storage = require('../storage');

    class HistoricalDataGraph extends React.Component {
        constructor(props) {
            super(props);
            this._resetState()
            this.reFetchData.bind(this);
            this.render.bind(this);
            this._renderContainer.bind(this);
            this._renderRow.bind(this);
            // BacklogDispatcher.historicalDataUpdated();
            // setTimeout('BacklogDispatcher.historicalDataUpdated();', 1000)
            function loadData() {
                if (Storage.server) {
                    BacklogDispatcher.historicalDataUpdated();
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
            let self = this;
            BacklogDispatcher.register(function(payload) {
                if (payload.action === BacklogDispatcher.appSymbols.historicalDataUpdated)
                {
                    self.reFetchData();
                }
            });
        }

        reFetchData() {
            Storage.getHistoricalData().then(
                historical_data => {this.setState({rows: historical_data})}
            );
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
                <div className='graph-label'>{date.toGMTString().slice(5, 11)}<br/>{row.totals.ccal} ccal</div>
            </div>);
        }
    }

    module.exports = HistoricalDataGraph;
})();
