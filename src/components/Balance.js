import { Component } from 'react';
import { Tab, Tabs } from 'react-bootstrap';
import { connect } from 'react-redux'
import { loadBalances, depositEth, withdrawEth, depositToken, withdrawToken } from '../redux/interactions';
import { tokenDepositAmountSelector, tokenWithdrawAmountSelector, accountSelector, web3Selector, exchangeSelector, tokenSelector, ethBalanceSelector, tokenBalanceSelector, exchangeEthBalanceSelector, exchangeTokenBalanceSelector, balancesLoadingSelector, ethDepositAmountSelector, ethWithdrawAmountSelector } from '../redux/selectors'
import Spinner from './Spinner'
import { tokenDepositAmountChanged, tokenWithdrawAmountChanged, ethDepositAmountChanged, ethWithdrawAmountChanged } from '../redux/actions'

class Balance extends Component {
    componentDidMount() {
        this.loadBlockchainData()
    }

    async loadBlockchainData() {
        const { exchange, web3, token, account, dispatch } = this.props
        await loadBalances(exchange, web3, token, account, dispatch)
    }

    render() {
        const { token, tokenDepositAmount, tokenWithdrawAmount, ethWithdrawAmount, exchange, account, web3, ethDepositAmount, ethBalance, tokenBalance, exchangeEthBalance, exchangeTokenBalance, balancesLoading, dispatch } = this.props
        return (
            <div className="card bg-dark text-white">
                <div className="card-header">Balance</div>
                <div className="card-body">
                    {balancesLoading ? <Spinner /> :
                        <Tabs defaultActiveKey='deposit' className='bg-dark text-white'>
                            <Tab eventKey='deposit' title='Deposit' className='bg-dark' tabClassName='tab'>
                                <table className='table table-dark table-sm small'>
                                    <thead>
                                        <tr>
                                            <th>Token</th>
                                            <th>Wallet</th>
                                            <th>Exchange</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td>ETH</td>
                                            <td>{ethBalance}</td>
                                            <td>{exchangeEthBalance}</td>
                                        </tr>
                                    </tbody>
                                </table>

                                <form className='row' onSubmit={e => {
                                    e.preventDefault()
                                    depositEth(dispatch, exchange, web3, ethDepositAmount, account)
                                }}>
                                    <div className='col-12 col-sm pr-sm-2'>
                                        <input
                                            type='text'
                                            placeholder='ETH Amount'
                                            onChange={e => dispatch(ethDepositAmountChanged(e.target.value))}
                                            className='form-control form-control-sm bg-dark text-white'
                                            required />
                                    </div>
                                    <div className='col-12 col-sm-auto pl-sm-0'>
                                        <button type='submit' className='btn btn-danger btn-block btn-sm'>Deposit</button>
                                    </div>
                                </form>

                                <table className='table table-dark table-sm small'>
                                    <tbody>
                                        <tr>
                                            <td>SND</td>
                                            <td>{tokenBalance}</td>
                                            <td>{exchangeTokenBalance}</td>
                                        </tr>
                                    </tbody>
                                </table>

                                <form className='row' onSubmit={e => {
                                    e.preventDefault()
                                    depositToken(dispatch, exchange, web3, token, tokenDepositAmount, account)
                                }}>
                                    <div className='col-12 col-sm pr-sm-2'>
                                        <input
                                            type='text'
                                            placeholder='SND Amount'
                                            onChange={e => dispatch(tokenDepositAmountChanged(e.target.value))}
                                            className='form-control form-control-sm bg-dark text-white'
                                            required />
                                    </div>
                                    <div className='col-12 col-sm-auto pl-sm-0'>
                                        <button type='submit' className='btn btn-danger btn-block btn-sm'>Deposit</button>
                                    </div>
                                </form>

                            </Tab>

                            <Tab eventKey='withdraw' title='Withdraw' className='bg-dark' tabClassName='tab'>
                                <table className='table table-dark table-sm small'>
                                    <thead>
                                        <tr>
                                            <th>Token</th>
                                            <th>Wallet</th>
                                            <th>Exchange</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td>ETH</td>
                                            <td>{ethBalance}</td>
                                            <td>{exchangeEthBalance}</td>
                                        </tr>
                                    </tbody>
                                </table>

                                <form className='row' onSubmit={e => {
                                    e.preventDefault()
                                    withdrawEth(dispatch, exchange, web3, ethWithdrawAmount, account)
                                }}>
                                    <div className='col-12 col-sm pr-sm-2'>
                                        <input
                                            type='text'
                                            placeholder='ETH Amount'
                                            onChange={e => dispatch(ethWithdrawAmountChanged(e.target.value))}
                                            className='form-control form-control-sm bg-dark text-white'
                                            required />
                                    </div>
                                    <div className='col-12 col-sm-auto pl-sm-0'>
                                        <button type='submit' className='btn btn-danger btn-block btn-sm'>Withdraw</button>
                                    </div>
                                </form>

                                <table className='table table-dark table-sm small'>
                                    <tbody>
                                        <tr>
                                            <td>SND</td>
                                            <td>{tokenBalance}</td>
                                            <td>{exchangeTokenBalance}</td>
                                        </tr>
                                    </tbody>
                                </table>

                                <form className='row' onSubmit={e => {
                                    e.preventDefault()
                                    withdrawToken(dispatch, exchange, web3, token, tokenWithdrawAmount, account)
                                }}>
                                    <div className='col-12 col-sm pr-sm-2'>
                                        <input
                                            type='text'
                                            placeholder='SND Amount'
                                            onChange={e => dispatch(tokenWithdrawAmountChanged(e.target.value))}
                                            className='form-control form-control-sm bg-dark text-white'
                                            required />
                                    </div>
                                    <div className='col-12 col-sm-auto pl-sm-0'>
                                        <button type='submit' className='btn btn-danger btn-block btn-sm'>Withdraw</button>
                                    </div>
                                </form>
                            </Tab>
                        </Tabs>
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
        ethBalance: ethBalanceSelector(state),
        tokenBalance: tokenBalanceSelector(state),
        exchangeEthBalance: exchangeEthBalanceSelector(state),
        exchangeTokenBalance: exchangeTokenBalanceSelector(state),
        balancesLoading: balancesLoadingSelector(state),
        ethDepositAmount: ethDepositAmountSelector(state),
        ethWithdrawAmount: ethWithdrawAmountSelector(state),
        tokenDepositAmount: tokenDepositAmountSelector(state),
        tokenWithdrawAmount: tokenWithdrawAmountSelector(state)
    }
}

export default connect(mapStateToProps)(Balance);
