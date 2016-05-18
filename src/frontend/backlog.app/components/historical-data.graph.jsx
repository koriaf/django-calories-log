(function (){
    /* Renders simple graph about last 10 days nutrition.
    It's ugly prototype, I'll refactor it later, when I know what do I want here...
    // chuckchanedizainer

    */
    'use strict';
    var Storage = require('../storage');
    let backlogStore = require('../backlog.store');
    let symbols = require('../symbols');

    const HistoricalDataGraphDayItem = ({dayData}) => {
        let totalDayAmount = dayData.totals.prot + dayData.totals.carb + dayData.totals.fat;
        let scaleRatio = 0.5;
        let date = new Date(dayData.date);
        let dispProt = dayData.totals.prot * scaleRatio;
        let dispCarb = dayData.totals.carb * scaleRatio;
        let dispFat = dayData.totals.fat * scaleRatio;
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
        return (
            <div className='graph-row'>
                <div className='graph-item' style={protStyle}>Prot {dayData.totals.prot}</div>
                <div className='graph-item' style={carbStyle}>Carb {dayData.totals.carb}</div>
                <div className='graph-item' style={fatStyle}>Fat {dayData.totals.fat}</div>
                <div className='graph-label'>{date.toGMTString().slice(5, 11)}<br/>{dayData.totals.ccal} ccal</div>
            </div>
        );
    }

    const HistoricalDataGraph = ({daysData}) => {
        daysData.sort((a, b) => a['date'] >= b['date']);
        daysData = daysData.slice(-10);
        return (
            <div className='graph-container'>
                {daysData.map(dayData => {
                    return <HistoricalDataGraphDayItem key={dayData.date} dayData={dayData} />
                })}
            </div>
        )
    }

    class HistoricalDataGraphContainer extends React.Component {
        constructor(props) {
            super(props);
            this.state = {rows: []};
            this.render.bind(this);
        }

        componentDidMount() {
            backlogStore.subscribe(() => {
                this.setState({rows: backlogStore.getState().historicalData})
            })
        }

        render() {
            return <HistoricalDataGraph daysData={this.state.rows} />
        }
    }

    module.exports = HistoricalDataGraphContainer;
})();
