import { Component } from 'react';
import { connect } from 'react-redux'
import { loadAllOrders, subscribeToEvents } from '../redux/interactions';
import { exchangeSelector } from '../redux/selectors';
import Balance from './Balance';
import MyTransactions from './MyTransactions';
import NewOrder from './NewOrder';
import OrderBook from './OrderBook';
import PriceChart from './PriceChart';
import Trades from './Trades';

class Main extends Component {
    componentDidMount() {
        this.loadBlockchainData(this.props)
    }

    async loadBlockchainData(props) {
        const { exchange, dispatch } = props
        await loadAllOrders(exchange, dispatch)
        await subscribeToEvents(exchange, dispatch)
    }

    render() {
        return (
            <div className="content">
                <div className="vertical-split">
                    <Balance/>
                    <NewOrder/>
                </div>
                <OrderBook />
                <div className="vertical-split">
                    <PriceChart />
                    <MyTransactions />
                </div>
                <Trades />
            </div>
        );
    }
}

function mapStateToProps(state) {
    return {
        exchange: exchangeSelector(state)
    }
}

export default connect(mapStateToProps)(Main);
