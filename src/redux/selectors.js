import { get, groupBy, maxBy, minBy, reject } from "lodash"
import moment from "moment"
import { createSelector } from "reselect"
import { format, ETHER_ADDRESS, GREEN, RED, formatBalance } from '../helpers'


const account = state => get(state, 'web3.account')
export const accountSelector = createSelector(account, a => a)

const web3 = state => get(state, 'web3.connection')
export const web3Selector = createSelector(web3, w => w)

const tokenLoaded = state => get(state, 'token.loaded', false)
export const tokenLoadedSelector = createSelector(tokenLoaded, tl => tl)

const token = state => get(state, 'token.contract')
export const tokenSelector = createSelector(token, t => t)

const exchangeLoaded = state => get(state, 'exchange.loaded', false)
export const exchangeLoadedSelector = createSelector(exchangeLoaded, el => el)

const exchange = state => get(state, 'exchange.contract')
export const exchangeSelector = createSelector(exchange, e => e)

export const contractsLoadedSelector = createSelector(
    tokenLoaded,
    exchangeLoaded,
    (tl, el) => tl && el
)

const allOrdersLoaded = state => get(state, 'exchange.allOrders.loaded', false)
export const allOrdersLoadedSelector = createSelector(allOrdersLoaded, l => l)

const allOrders = state => get(state, 'exchange.allOrders.data', [])
export const allOrdersSelector = createSelector(allOrders, o => o)

const cancelledOrdersLoaded = state => get(state, 'exchange.cancelledOrders.loaded', false)
export const cancelledOrdersLoadedSelector = createSelector(cancelledOrdersLoaded, l => l)

const cancelledOrders = state => get(state, 'exchange.cancelledOrders.data', [])
export const cancelledOrdersSelector = createSelector(cancelledOrders, o => o)

const filledOrdersLoaded = state => get(state, 'exchange.filledOrders.loaded', false)
export const filledOrdersLoadedSelector = createSelector(filledOrdersLoaded, fo => fo)

const filledOrders = state => get(state, 'exchange.filledOrders.data', [])
export const filledOrdersSelector = createSelector(filledOrders, orders => {
    orders = orders.sort((a, b) => a.timestamp - b.timestamp)
    orders = decorateFilledOrders(orders)
    orders = orders.sort((a, b) => b.timestamp - a.timestamp)
    return orders
})

const decorateOrder = order => {
    let tokenAmount, etherAmount

    if (order.tokenGive === ETHER_ADDRESS) {
        etherAmount = order.amountGive
        tokenAmount = order.amountGet
    } else {
        tokenAmount = order.amountGive
        etherAmount = order.amountGet
    }

    const precision = 100000
    const tokenPrice = Math.round(etherAmount / tokenAmount * precision) / precision

    return {
        ...order,
        etherAmount: format(etherAmount),
        tokenAmount: format(tokenAmount),
        tokenPrice,
        formattedTimestamp: moment.unix(order.timestamp).format('h:mm:ss a M/D')
    }
}

const decorateFilledOrders = orders => {
    let prevOrder = orders[0]
    return orders.map(order => {
        order = decorateOrder(order)
        order = decorateFilledOrder(order, prevOrder)
        prevOrder = order
        return order
    })
}

const decorateFilledOrder = (order, prevOrder) => {
    return {
        ...order,
        tokenPriceClass: tokenPriceClass(order.tokenPrice, order.id, prevOrder)
    }
}

const tokenPriceClass = (tokenPrice, orderId, prevOrder) => {
    if (prevOrder.id === orderId) {
        return GREEN
    }

    if (prevOrder.tokenPrice <= tokenPrice) {
        return GREEN
    } else {
        return RED
    }
}

const openOrders = state => {
    const all = allOrders(state)
    const cancelled = cancelledOrders(state)
    const filled = filledOrders(state)

    const openOrders = reject(all, order => {
        const orderFilled = filled.some(o => o.id === order.id)
        const orderCancelled = cancelled.some(o => o.id === order.id)
        return orderFilled || orderCancelled
    })

    return openOrders
}

const orderBookLoaded = state => cancelledOrdersLoaded(state) && filledOrdersLoaded(state) && allOrdersLoaded(state)
export const orderBookLoadedSelector = createSelector(orderBookLoaded, o => o)

export const orderBookSelector = createSelector(
    openOrders,
    orders => {
        orders = decorateOrderBookOrders(orders)
        orders = groupBy(orders, 'orderType')

        const buyOrders = get(orders, 'buy', [])
        const sellOrders = get(orders, 'sell', [])

        orders = {
            ...orders,
            buyOrders: buyOrders.sort((a, b) => b.tokenPrice - a.tokenPrice),
            sellOrders: sellOrders.sort((a, b) => b.tokenPrice - a.tokenPrice)
        }
        return orders
    }
)

const decorateOrderBookOrders = orders => {
    return orders.map(order => {
        order = decorateOrder(order)
        order = decorateOrderBookOrder(order)
        return order
    })
}

const decorateOrderBookOrder = order => {
    const orderType = order.tokenGive === ETHER_ADDRESS ? 'buy' : 'sell'
    return {
        ...order,
        orderType,
        orderTypeClass: orderType === 'buy' ? GREEN : RED,
        orderFillAction: orderType === 'buy' ? 'sell' : 'buy'
    }
}

export const myFilledOrdersLoadedSelector = createSelector(filledOrdersLoaded, fo => fo)

export const myFilledOrdersSelector = createSelector(
    account,
    filledOrders,
    (account, orders) => {
        orders = orders.filter(o => o.user === account || o.userFill === account)
        orders = orders.sort((a, b) => a.timestamp - b.timestamp)
        orders = decorateMyFilledOrders(orders, account)
        return orders
    }
)

const decorateMyFilledOrders = (orders, account) => {
    return orders.map(order => {
        order = decorateOrder(order)
        order = decorateMyFilledOrder(order, account)
        return order
    })
}

const decorateMyFilledOrder = (order, account) => {
    const myOrder = order.user === account

    let orderType
    if (myOrder) {
        orderType = order.tokenGive === ETHER_ADDRESS ? 'buy' : 'sell'
    } else {
        orderType = order.tokenGive === ETHER_ADDRESS ? 'sell' : 'buy'
    }

    return {
        ...order,
        orderType,
        orderTypeClass: orderType === 'buy' ? GREEN : RED,
        orderSign: orderType === 'buy' ? '+' : '-'
    }
}

export const myOpenOrdersLoadedSelector = createSelector(orderBookLoaded, l => l)

export const myOpenOrdersSelector = createSelector(
    account,
    openOrders,
    (account, orders) => {
        orders = orders.filter(o => o.user === account)
        orders = decorateMyOpenOrders(orders)
        orders = orders.sort((a, b) => b.timestamp - a.timestamp)
        return orders
    }
)

const decorateMyOpenOrders = orders => {
    return orders.map(order => {
        order = decorateOrder(order)
        order = decorateMyOpenOrder(order)
        return order
    })
}

const decorateMyOpenOrder = order => {
    let orderType = order.tokenGive === ETHER_ADDRESS ? 'buy' : 'sell'

    return {
        ...order,
        orderType,
        orderTypeClass: orderType === 'buy' ? GREEN : RED
    }
}

export const priceChartLoadedSelector = createSelector(filledOrdersLoaded, fo => fo)

export const priceChartSelector = createSelector(
    filledOrders,
    orders => {
        orders = orders.sort((a, b) => a.timestamp - b.timestamp)
        orders = orders.map(o => decorateOrder(o))
        let secondLastOrder, lastOrder
        [secondLastOrder, lastOrder] = orders.slice(orders.length - 2, orders.length)
        const lastPrice = get(lastOrder, 'tokenPrice', 0)
        const secondLastPrice = get(secondLastOrder, 'tokenPrice', 0)
        return {
            lastPrice,
            lastPriceChange: lastPrice >= secondLastPrice ? '+' : '-',
            series: [{
                data: buildGraphData(orders)
            }]
        }
    }
)

const buildGraphData = orders => {
    orders = groupBy(orders, o => moment.unix(o.timestamp).startOf('hour').format())
    const hours = Object.keys(orders)
    const graphData = hours.map(hour => {
        const group = orders[hour]
        const open = group[0]
        const close = group[group.length - 1]
        const high = maxBy(group, 'tokenPrice')
        const low = minBy(group, 'tokenPrice')
        return {
            x: new Date(hour),
            y: [open.tokenPrice, close.tokenPrice, high.tokenPrice, low.tokenPrice]
        }
    })

    return graphData
}

const orderCancelling = state => get(state, 'exchange.orderCancelling', false)
export const orderCancellingSelector = createSelector(orderCancelling, s => s)

const orderFilling = state => get(state, 'exchange.orderFilling', false)
export const orderFillingSelector = createSelector(orderFilling, s => s)

const balancesLoading = state => get(state, 'exchange.balancesLoading', true)
export const balancesLoadingSelector = createSelector(balancesLoading, s => s)

const ethBalance = state => get(state, 'web3.balance', 0)
export const ethBalanceSelector = createSelector(ethBalance, balance => formatBalance(balance))

const tokenBalance = state => get(state, 'token.balance', 0)
export const tokenBalanceSelector = createSelector(tokenBalance, balance => formatBalance(balance))

const exchangeEthBalance = state => get(state, 'exchange.ethBalance', 0)
export const exchangeEthBalanceSelector = createSelector(exchangeEthBalance, balance => formatBalance(balance))

const exchangeTokenBalance = state => get(state, 'exchange.tokenBalance', 0)
export const exchangeTokenBalanceSelector = createSelector(exchangeTokenBalance, balance => formatBalance(balance))

const ethDepositAmount = state => get(state, 'exchange.ethDepositAmount', null)
export const ethDepositAmountSelector = createSelector(ethDepositAmount, a => a)

const ethWithdrawAmount = state => get(state, 'exchange.ethWithdrawAmount', null)
export const ethWithdrawAmountSelector = createSelector(ethWithdrawAmount, a => a)

const tokenDepositAmount = state => get(state, 'exchange.tokenDepositAmount', null)
export const tokenDepositAmountSelector = createSelector(tokenDepositAmount, a => a)

const tokenWithdrawAmount = state => get(state, 'exchange.tokenWithdrawAmount', null)
export const tokenWithdrawAmountSelector = createSelector(tokenWithdrawAmount, a => a)

const buyOrder = state => get(state, 'exchange.buyOrder', {})
export const buyOrderSelector = createSelector(buyOrder, a => a)

const sellOrder = state => get(state, 'exchange.sellOrder', {})
export const sellOrderSelector = createSelector(sellOrder, a => a)