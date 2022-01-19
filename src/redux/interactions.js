import Web3 from 'web3';
import { allBalancesLoaded, ethBalanceLoaded, tokenBalanceLoaded, exchangeEthBalanceLoaded, exchangeTokenBalanceLoaded, orderFilled, orderFilling, orderCancelling, allOrdersLoaded, filledOrdersLoaded, tokenLoaded, web3AccountLoaded, web3Loaded, exchangeLoaded, cancelledOrdersLoaded, orderCancelled, balancesLoading, buyOrderMaking, sellOrderMaking, orderMade } from './actions';
import Token from '../abis/Token.json'
import Exchange from '../abis/Exchange.json'
import { ETHER_ADDRESS } from '../helpers';


export const loadWeb3 = dispatch => {
    if (window.ethereum) {
        const web3 = new Web3(window.ethereum)
        dispatch(web3Loaded(web3))
        return web3
    }
}

export const loadAccountWeb3 = async (dispatch) => {
    const accounts = await ethereum.request({ method: 'eth_requestAccounts' })
    dispatch(web3AccountLoaded(accounts[0]))
    return accounts[0]
}

export const loadTokenContract = async (web3, networkId, dispatch) => {
    try {
        const abi = Token.abi
        const contractAddress = Token.networks[networkId].address
        const token = new web3.eth.Contract(abi, contractAddress) // new instance of the contract for client ui
        dispatch(tokenLoaded(token))
        return token
    } catch (e) {
        console.log('Contract not deployed to the current network. Please select Kovan network with Metamask.')
        return null
    }
}

export const loadExchangeContract = async (web3, networkId, dispatch) => {
    try {
        const abi = Exchange.abi
        const contractAddress = Exchange.networks[networkId].address
        const exchange = new web3.eth.Contract(abi, contractAddress) // new instance of the contract for client ui
        dispatch(exchangeLoaded(exchange))
        return exchange
    } catch (e) {
        console.log('Contract not deployed to the current network. Please select Kovan network with Metamask.')
        return null
    }
}

export const loadAllOrders = async (exchange, dispatch) => {
    const cancelStream = await exchange.getPastEvents('Cancel', { fromBlock: 0, toBlock: 'latest' })
    const cancelledOrders = cancelStream.map(event => event.returnValues)
    dispatch(cancelledOrdersLoaded(cancelledOrders))

    const tradesStream = await exchange.getPastEvents('Trade', { fromBlock: 0, toBlock: 'latest' })
    const filledOrders = tradesStream.map(event => event.returnValues)
    dispatch(filledOrdersLoaded(filledOrders))

    const ordersStream = await exchange.getPastEvents('Order', { fromBlock: 0, toBlock: 'latest' })
    const allOrders = ordersStream.map(event => event.returnValues)
    dispatch(allOrdersLoaded(allOrders))
}

export const cancelOrder = (exchange, orderId, account, dispatch) => {
    exchange.methods.cancelOrder(orderId).send({ from: account })
        .on('transactionHash', hash => dispatch(orderCancelling()))
        .on('error', error => window.alert('There was an error'))
}

export const fillOrder = (exchange, orderId, account, dispatch) => {
    exchange.methods.fillOrder(orderId).send({ from: account })
        .on('transactionHash', hash => dispatch(orderFilling()))
        .on('error', error => window.alert('There was an error'))
}

export const subscribeToEvents = async (exchange, dispatch) => {
    await exchange.events.Cancel({}, (err, event) => dispatch(orderCancelled(event.returnValues)))
    await exchange.events.Trade({}, (err, event) => dispatch(orderFilled(event.returnValues)))
    await exchange.events.Deposit({}, (err, event) => dispatch(allBalancesLoaded()))
    await exchange.events.Withdraw({}, (err, event) => dispatch(allBalancesLoaded()))
    await exchange.events.Order({}, (err, event) => dispatch(orderMade(event.returnValues)))
}

export const loadBalances = async (exchange, web3, token, account, dispatch) => {
    // Ether and token balances in wallet
    const ethBalance = await web3.eth.getBalance(account)
    dispatch(ethBalanceLoaded(ethBalance))

    const tokenBalance = await token.methods.balanceOf(account).call()
    dispatch(tokenBalanceLoaded(tokenBalance))

    // Ether and token balances in exchange
    const exchangeEthBalance = await exchange.methods.balanceOf(ETHER_ADDRESS, account).call()
    dispatch(exchangeEthBalanceLoaded(exchangeEthBalance))

    const exchangeTokenBalance = await exchange.methods.balanceOf(token.options.address, account).call()
    dispatch(exchangeTokenBalanceLoaded(exchangeTokenBalance))

    dispatch(allBalancesLoaded())
}

export const depositEth = (dispatch, exchange, web3, ethDepositAmount, account) => {
    exchange.methods.depositEther().send({ from: account, value: web3.utils.toWei(ethDepositAmount, 'ether') })
        .on('transactionHash', hash => dispatch(balancesLoading()))
        .on('error', error => window.alert('There was an error'))
}

export const withdrawEth = (dispatch, exchange, web3, ethWithdrawAmount, account) => {
    exchange.methods.withdrawEther(web3.utils.toWei(ethWithdrawAmount, 'ether')).send({ from: account })
        .on('transactionHash', hash => dispatch(balancesLoading()))
        .on('error', error => window.alert('There was an error'))
}

export const depositToken = (dispatch, exchange, web3, token, tokenDepositAmount, account) => {
    const amount = web3.utils.toWei(tokenDepositAmount, 'ether')
    token.methods.approve(exchange.options.address, amount).send({ from: account })
        .on('transactionHash', hash => exchange.methods.depositToken(token.options.address, amount).send({ from: account })
            .on('transactionHash', hash => dispatch(balancesLoading()))
            .on('error', error => window.alert('There was an error')))
}

export const withdrawToken = (dispatch, exchange, web3, token, tokenWithdrawAmount, account) => {
    exchange.methods.withdrawToken(token.options.address, web3.utils.toWei(tokenWithdrawAmount, 'ether')).send({ from: account })
        .on('transactionHash', hash => dispatch(balancesLoading()))
        .on('error', error => window.alert('There was an error'))
}

export const makeBuyOrder = (dispatch, exchange, web3, token, order, account) => {
    const tokenGet = token.options.address
    const amountGet = web3.utils.toWei(order.amount, 'ether')
    const tokenGive = ETHER_ADDRESS
    const amountGive = web3.utils.toWei((order.amount * order.price).toString(), 'ether')

    exchange.methods.makeOrder(tokenGet, amountGet, tokenGive, amountGive).send({ from: account })
        .on('transactionHash', hash => dispatch(buyOrderMaking()))
        .on('error', error => window.alert('There was an error'))
}

export const makeSellOrder = (dispatch, exchange, web3, token, order, account) => {
    const tokenGive = token.options.address
    const amountGive = web3.utils.toWei(order.amount, 'ether')
    const tokenGet = ETHER_ADDRESS
    const amountGet = web3.utils.toWei((order.amount * order.price).toString(), 'ether')

    exchange.methods.makeOrder(tokenGet, amountGet, tokenGive, amountGive).send({ from: account })
        .on('transactionHash', hash => dispatch(sellOrderMaking()))
        .on('error', error => window.alert('There was an error'))
}