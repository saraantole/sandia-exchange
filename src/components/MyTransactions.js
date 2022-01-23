import { Component } from 'react';
import { Tab, Tabs } from 'react-bootstrap';
import { connect } from 'react-redux'
import { cancelOrder } from '../redux/interactions';
import { myFilledOrdersLoadedSelector, myFilledOrdersSelector, myOpenOrdersSelector, myOpenOrdersLoadedSelector, exchangeSelector, accountSelector, orderCancellingSelector } from '../redux/selectors';
import Spinner from './Spinner'

class MyTransactions extends Component {
    render() {
        const { orderCancelling, exchange, account, myOpenOrders, myFilledOrders, showMyFilledOrders, showMyOpenOrders, dispatch } = this.props
        return (
            <div className="card bg-dark text-white">
                <div className="card-header">My Transactions</div>
                <div className="card-body">
                    <Tabs defaultActiveKey='trades' className='bg-dark text-white'>
                        <Tab eventKey='trades' title='Trades' className='bg-dark' tabClassName='tab'>
                            <table className='table table-dark table-sm small'>
                                <thead>
                                    <tr>
                                        <th>Time</th>
                                        <th>SND</th>
                                        <th>SND/ETH</th>
                                    </tr>
                                </thead>
                                {showMyFilledOrders ?
                                    <tbody>
                                        {
                                            myFilledOrders.map(order => 
                                                <tr key={order.id}>
                                                    <td className='text-muted'>{order.formattedTimestamp}</td>
                                                    <td className={`text-${order.orderTypeClass}`}>{order.orderSign}{order.tokenAmount}</td>
                                                    <td className={`text-${order.orderTypeClass}`}>{order.tokenPrice}</td>
                                                </tr>
                                            )
                                        }
                                    </tbody>
                                    : <Spinner type='table' />
                                }
                            </table>
                        </Tab>
                        <Tab eventKey='orders' title='Orders' tabClassName='tab'>
                            <table className='table table-dark table-sm small'>
                                <thead>
                                    <tr>
                                        <th>Amount</th>
                                        <th>SND</th>
                                        <th>SND/ETH</th>
                                    </tr>
                                </thead>
                                {showMyOpenOrders && !orderCancelling ?
                                    <tbody> {
                                        myOpenOrders?.map(order => (
                                            <tr key={order.id}>
                                                <td className={`text-${order.orderTypeClass}`}>{order.tokenAmount}</td>
                                                <td className={`text-${order.orderTypeClass}`}>{order.tokenPrice}</td>
                                                <td className='text-muted cancel-order'
                                                    onClick={() => cancelOrder(exchange, order.id, account, dispatch)}
                                                >x</td>
                                            </tr>
                                        ))
                                    }
                                    </tbody>
                                    : <Spinner type='table' />
                                }
                            </table>
                        </Tab>
                    </Tabs>
                </div>
            </div>
        );
    }
}

function mapStateToProps(state) {
    return {
        myFilledOrders: myFilledOrdersSelector(state),
        showMyFilledOrders: myFilledOrdersLoadedSelector(state),
        myOpenOrders: myOpenOrdersSelector(state),
        showMyOpenOrders: myOpenOrdersLoadedSelector(state),
        exchange: exchangeSelector(state),
        account: accountSelector(state),
        orderCancelling: orderCancellingSelector(state),
    }
}

export default connect(mapStateToProps)(MyTransactions);
