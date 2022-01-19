import { Component } from 'react';
import { Tab, Tabs } from 'react-bootstrap';
import { connect } from 'react-redux'
import Spinner from './Spinner'
import { web3Selector, exchangeSelector, accountSelector, tokenSelector, sellOrderSelector, buyOrderSelector } from '../redux/selectors'
import { makeBuyOrder, makeSellOrder } from '../redux/interactions'
import { buyOrderAmountChanged, buyOrderPriceChanged ,sellOrderAmountChanged, sellOrderPriceChanged} from '../redux/actions'

class NewOrder extends Component {
    render() {
        const { dispatch, web3, token, account, exchange, buyOrder, sellOrder } = this.props
        return (
            <div className="card bg-dark text-white">
                <div className="card-header">New Order</div>
                <div className="card-body">
                    {!buyOrder.making && !sellOrder.making ?
                        <Tabs defaultActiveKey='buy' className='bg-dark text-white'>
                            <Tab eventKey='buy' title='Buy' className='bg-dark' tabClassName='tab'>
                                <form onSubmit={e => {
                                    e.preventDefault()
                                    makeBuyOrder(dispatch, exchange, web3, token, buyOrder, account)
                                }}>
                                    <div className='form-group small'>
                                        <label style={{margin: '5px 0'}}>Buy Amount (SND)</label>
                                        <div className='input-group'>
                                            <input type='text'
                                                className='form-control form-control-sm bg-dark text-white'
                                                placeholder='Buy Amount'
                                                onChange={e => dispatch(buyOrderAmountChanged(e.target.value))}
                                                required
                                            />
                                        </div>
                                    </div>
                                    <div className='form-group small'>
                                        <label style={{margin: '5px 0'}}>Buy Price</label>
                                        <div className='input-group'>
                                            <input type='text'
                                                className='form-control form-control-sm bg-dark text-white'
                                                placeholder='Buy Price'
                                                onChange={e => dispatch(buyOrderPriceChanged(e.target.value))}
                                                required
                                            />
                                        </div>
                                    </div>
                                    <button type='submit' style={{width: '100%', margin: '10px 0'}} className='btn btn-danger btn-sm btn-block'>Buy Order</button>
                                    {buyOrder.amount && buyOrder.price && <small>Total: {buyOrder.amount * buyOrder.price} ETH</small>}
                                </form>
                            </Tab>
                            <Tab eventKey='sell' title='Sell' className='bg-dark' tabClassName='tab'>
                            <form onSubmit={e => {
                                    e.preventDefault()
                                    makeSellOrder(dispatch, exchange, web3, token, sellOrder, account)
                                }}>
                                    <div className='form-group small'>
                                        <label style={{margin: '5px 0'}}>Sell Amount (SND)</label>
                                        <div className='input-group'>
                                            <input type='text'
                                                className='form-control form-control-sm bg-dark text-white'
                                                placeholder='Sell Amount'
                                                onChange={e => dispatch(sellOrderAmountChanged(e.target.value))}
                                                required
                                            />
                                        </div>
                                    </div>
                                    <div className='form-group small'>
                                        <label style={{margin: '5px 0'}}>Sell Price</label>
                                        <div className='input-group'>
                                            <input type='text'
                                                className='form-control form-control-sm bg-dark text-white'
                                                placeholder='Sell Price'
                                                onChange={e => dispatch(sellOrderPriceChanged(e.target.value))}
                                                required
                                            />
                                        </div>
                                    </div>
                                    <button type='submit' style={{width: '100%', margin: '10px 0'}} className='btn btn-danger btn-sm btn-block'>Buy Order</button>
                                    {sellOrder.amount && sellOrder.price && <small>Total: {sellOrder.amount * sellOrder.price} ETH</small>}
                                </form>
                            </Tab>
                        </Tabs>
                        : <Spinner />
                    }
                </div>
            </div>
        );
    }
}

function mapStateToProps(state) {
    return {
        web3: web3Selector(state),
        exchange: exchangeSelector(state),
        token: tokenSelector(state),
        account: accountSelector(state),
        buyOrder: buyOrderSelector(state),
        sellOrder: sellOrderSelector(state)
    }
}

export default connect(mapStateToProps)(NewOrder);
