import { Component } from 'react';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';
import { connect } from 'react-redux'
import { fillOrder } from '../redux/interactions';
import { accountSelector, exchangeSelector, orderBookLoadedSelector, orderBookSelector, orderFillingSelector } from '../redux/selectors';
import Spinner from './Spinner'

const OrderBookGroup = ({ ordersType, account, dispatch, exchange }) => {
    return ordersType.map(order => (
        <OverlayTrigger
            key={order.id}
            placement='auto'
            overlay={<Tooltip id={order.id}>Click here to {order.orderFillAction}</Tooltip>}>
            <tr className='order-book-order' onClick={() => fillOrder(exchange, order.id, account, dispatch)}>
                <td>{order.tokenAmount}</td>
                <td className={`text-${order.orderTypeClass}`}>{order.tokenPrice}</td>
                <td>{order.etherAmount}</td>
            </tr>
        </OverlayTrigger>
    ))
}

class OrderBook extends Component {
    render() {
        const { orderBook, showOrderBook, account, exchange, orderFilling, dispatch } = this.props
        return (
            <div className='vertical'>
                <div className="card bg-dark text-white">
                    <div className="card-header">Order Book</div>
                    <div className="card-body order-book">
                        <table className='table table-dark table-sm small'>
                            {showOrderBook && !orderFilling ?
                                <tbody>
                                    <OrderBookGroup account={account} exchange={exchange} dispatch={dispatch} ordersType={orderBook.sellOrders} />
                                    <tr>
                                        <th>SND</th>
                                        <th>SND/ETH</th>
                                        <th>ETH</th>
                                    </tr>
                                    <OrderBookGroup account={account} exchange={exchange} dispatch={dispatch} ordersType={orderBook.buyOrders} />
                                </tbody>
                                : <Spinner type='table' />
                            }
                        </table>
                    </div>
                </div>
            </div >
        );
    }
}

function mapStateToProps(state) {
    return {
        orderBook: orderBookSelector(state),
        showOrderBook: orderBookLoadedSelector(state),
        account: accountSelector(state),
        exchange: exchangeSelector(state),
        orderFilling: orderFillingSelector(state)
    }
}

export default connect(mapStateToProps)(OrderBook);
