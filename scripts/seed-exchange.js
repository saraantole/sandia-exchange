/* eslint-disable no-undef */
const Token = artifacts.require("Token");
const Exchange = artifacts.require("Exchange");

const tokens = n => new web3.utils.BN(web3.utils.toWei(n.toString(), 'ether'))
const ETHER_ADDRESS = '0x0000000000000000000000000000000000000000'
const wait = seconds => {
    const milliseconds = seconds * 1000
    return new Promise(resolve => setTimeout(resolve, milliseconds))
}

module.exports = async function (callback) { // especially compatible with Truffle -> truffle exec path/filename
    try {
        // Fetch accounts from wallet and deployed contracts
        const accounts = await web3.eth.getAccounts()
        const token = await Token.deployed()
        const exchange = await Exchange.deployed()

        const sender = accounts[0]
        const receiver = accounts[1]
        let amount = web3.utils.toWei('10000', 'ether')

        // give tokens to receiver account 
        await token.transfer(receiver, amount, { from: sender })

        // give tokens to users and deposit
        const user1 = accounts[0]
        const user2 = accounts[1]

        amount = 1
        await exchange.depositEther({ from: user1, value: tokens(amount) })

        amount = 10000
        await token.approve(exchange.address, tokens(amount), { from: user2 })
        await exchange.depositToken(token.address, tokens(amount), { from: user2 })

        // seed 1 cancellation order
        let result, orderId
        result = await exchange.makeOrder(token.address, tokens(100), ETHER_ADDRESS, tokens(0.1), { from: user1 })

        orderId = result.logs[0].args.id
        await exchange.cancelOrder(orderId, { from: user1 })

        // seed 3 filled orders
        result = await exchange.makeOrder(token.address, tokens(100), ETHER_ADDRESS, tokens(0.1), { from: user1 })
        orderId = result.logs[0].args.id
        await exchange.fillOrder(orderId, { from: user2 })

        await wait(1) // wait 1s

        result = await exchange.makeOrder(token.address, tokens(50), ETHER_ADDRESS, tokens(0.01), { from: user1 })
        orderId = result.logs[0].args.id
        await exchange.fillOrder(orderId, { from: user2 })

        await wait(1) // wait 1s

        result = await exchange.makeOrder(token.address, tokens(200), ETHER_ADDRESS, tokens(0.15), { from: user1 })
        orderId = result.logs[0].args.id
        await exchange.fillOrder(orderId, { from: user2 })

        await wait(1) // wait 1s

        // seed open orders
        for (let i = 1; i <= 10; i++) {
            result = await exchange.makeOrder(token.address, tokens(10 * i), ETHER_ADDRESS, tokens(0.01), { from: user1 })
            await wait(1)
        }

        for (let i = 1; i <= 10; i++) {
            result = await exchange.makeOrder(ETHER_ADDRESS, tokens(0.01), token.address, tokens(10 * i), { from: user2 })
            await wait(1)
        }
    } catch (e) {
        console.log(e)
    }
    callback()
}