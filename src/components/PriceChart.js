import { Component } from 'react';
import { connect } from 'react-redux'
import Spinner from './Spinner'
import Chart from 'react-apexcharts'
import { priceChartLoadedSelector, priceChartSelector } from '../redux/selectors';

const chartOptions = {
    chart: {
        animations: { enabled: false },
        toolbar: { show: false },
        width: '100px'
    },
    tooltip: {
        enabled: true,
        theme: false,
        style: {
            fontSize: '12px',
            fontFamily: undefined
        },
        x: {
            show: false,
            format: 'dd MMM',
            formatter: undefined,
        },
        y: {
            show: true,
            title: 'price'
        },
        marker: {
            show: false,
        },
        items: {
            display: 'flex',
        },
        fixed: {
            enabled: false,
            position: 'topRight',
            offsetX: 0,
            offsetY: 0,
        },
    },
    xaxis: {
        type: 'datetime',
        labels: {
            show: true,
            style: {
                colors: '#fff',
                fontSize: '8px',
                cssClass: 'apexcharts-xaxis-label',
            },
        },
    },
    yaxis: {
        labels: {
            show: true,
            minWidth: 0,
            maxWidth: 160,
            style: {
                colors: '#fff',
                fontSize: '8px',
                cssClass: 'apexcharts-yaxis-label',
            },
            offsetX: 0,
            offsetY: 0,
            rotate: 0,
        }
    }
}

class PriceChart extends Component {
    render() {
        const { showPriceChart, priceChart } = this.props
        return (
            <div className="card bg-dark text-white">
                <div className="card-header">Price Chart</div>
                <div className="card-body">
                    {
                        showPriceChart ?
                            <div className='price-chart'>
                                <div className='price'>
                                    <h4>SND/ETH &nbsp;
                                        {priceChart.lastPriceChange === '+' ?
                                            <span className='text-success'>&#9650;</span>
                                            : <span className='text-danger'>&#9660;</span>
                                        }
                                        &nbsp; {priceChart.lastPrice}
                                    </h4>
                                </div>
                                <Chart
                                    options={chartOptions}
                                    series={priceChart.series}
                                    type='candlestick'
                                    width='100%'
                                    height='100%'
                                />
                            </div>
                            :
                            <Spinner />
                    }
                </div>
            </div>
        );
    }
}

function mapStateToProps(state) {
    return {
        showPriceChart: priceChartLoadedSelector(state),
        priceChart: priceChartSelector(state)
    }
}

export default connect(mapStateToProps)(PriceChart);
