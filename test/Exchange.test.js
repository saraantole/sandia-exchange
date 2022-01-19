/* eslint-disable no-undef */
require('chai').use(require('chai-as-promised')).should()

const Exchange = artifacts.require("Exchange")
const Token = artifacts.require("Token")

const tokens = n => new web3.utils.BN(web3.utils.toWei(n.toString(), 'ether'))
const EVM_REVERT = 'VM Exception while processing transaction: revert'
const ETHER_ADDRESS = '0x0000000000000000000000000000000000000000'

contract('Exchange', ([creator, feeAccount, user1, user2]) => {
    let contract;
    let token;
    const feePercentage = 10;

    beforeEach(async () => {
        contract = await Exchange.new(feeAccount, feePercentage) // instanciate the contract
        token = await Token.new()
        token.transfer(user1, tokens(100), { from: creator })
    })

    describe('deployment', () => {
        it('tracks the fee account', async () => {
            const result = await contract.feeAccount()
            result.should.equal(feeAccount)
        })

        it('tracks the fee percentage', async () => {
            const result = await contract.feePercentage()
            result.toString().should.equal(feePercentage.toString())
        })
    })

    describe('fallback', () => {
        it('reverts when Ether is sent', async () => {
            await contract.sendTransaction({ value: 1, from: user1 }).should.be.rejectedWith(EVM_REVERT);
        })
    })

    describe('depositing tokens', () => {
        let amount, result;

        describe('success', () => {
            beforeEach(async () => {
                amount = tokens(10)
                await token.approve(contract.address, amount, { from: user1 });
                result = await contract.depositToken(token.address, amount, { from: user1 })
            })

            it('tracks the token deposit', async () => {
                let balance
                // Check exchange token balance
                balance = await token.balanceOf(contract.address)
                balance.toString().should.equal(amount.toString())
                // Check tokens on exchange
                balance = await contract.tokens(token.address, user1)
                balance.toString().should.equal(amount.toString())
            })

            it('emits a deposit event', async () => {
                const log = result.logs[0];
                log.event.should.equal('Deposit');
                const event = log.args;
                event.token.toString().should.equal(token.address)
                event.user.toString().should.equal(user1)
                event.amount.toString().should.equal(amount.toString())
                event.balance.toString().should.equal(amount.toString())
            })
        })

        describe('failure', () => {
            it('fails when no tokens are approved', async () => {
                await contract.depositToken(token.address, tokens(10), { from: user1 }).should.be.rejectedWith(EVM_REVERT);
            })

            it('rejects Ether deposits', async () => {
                await contract.depositToken(ETHER_ADDRESS, tokens(10), { from: user1 }).should.be.rejected
            })
        })
    })

    describe('withdrawing tokens', () => {
        let result, amount

        describe('success', () => {
            beforeEach(async () => {
                amount = tokens(10)
                await token.approve(contract.address, amount, { from: user1 })
                await contract.depositToken(token.address, amount, { from: user1 })
                result = await contract.withdrawToken(token.address, amount, { from: user1 })
            })

            it('withdraws tokens', async () => {
                const balance = await contract.tokens(token.address, user1)
                balance.toString().should.equal('0')
            })

            it('emits a withdraw event', async () => {
                const log = result.logs[0];
                log.event.should.equal('Withdraw');
                const event = log.args;
                event.token.toString().should.equal(token.address)
                event.user.toString().should.equal(user1)
                event.amount.toString().should.equal(amount.toString())
                event.balance.toString().should.equal('0')
            })
        })

        describe('failure', () => {
            it('rejects withdraws for insufficient balances', async () => {
                await contract.withdrawToken(ETHER_ADDRESS, tokens(10), { from: user1 }).should.be.rejectedWith(EVM_REVERT)
            })

            it('fails for insufficient balances', async () => {
                await contract.withdrawToken(token.address, tokens(10), { from: user1 }).should.be.rejectedWith(EVM_REVERT)
            })
        })
    })

    describe('depositing ether', () => {
        let result, amount

        beforeEach(async () => {
            amount = tokens(1) // same for ether
            result = await contract.depositEther({ from: user1, value: amount })
        })

        describe('success', () => {
            it('tracks the ether deposit', async () => {
                const balance = await contract.tokens(ETHER_ADDRESS, user1)
                balance.toString().should.equal(amount.toString())
            })

            it('emits a deposit event', async () => {
                const log = result.logs[0];
                log.event.should.equal('Deposit');
                const event = log.args;
                event.token.toString().should.equal(ETHER_ADDRESS)
                event.user.toString().should.equal(user1)
                event.amount.toString().should.equal(amount.toString())
                event.balance.toString().should.equal(amount.toString())
            })
        })
    })

    describe('withdrawing ether', () => {
        let result, amount

        beforeEach(async () => {
            amount = tokens(1)
            result = await contract.depositEther({ from: user1, value: amount })
        })

        describe('success', () => {
            beforeEach(async () => {
                result = await contract.withdrawEther(amount, { from: user1 })
            })

            it('withdraws ether', async () => {
                const balance = await contract.tokens(ETHER_ADDRESS, user1)
                balance.toString().should.equal('0')
            })

            it('emits a withdraw event', async () => {
                const log = result.logs[0];
                log.event.should.equal('Withdraw');
                const event = log.args;
                event.token.toString().should.equal(ETHER_ADDRESS)
                event.user.toString().should.equal(user1)
                event.amount.toString().should.equal(amount.toString())
                event.balance.toString().should.equal('0')
            })
        })

        describe('failure', () => {
            it('rejects withdraws for insufficient balances', async () => {
                await contract.withdrawEther(tokens(100), { from: user1 }).should.be.rejectedWith(EVM_REVERT)
            })
        })
    })

    describe('checking balances', () => {
        beforeEach(async () => {
            await contract.depositEther({ from: user1, value: tokens(1) })
        })

        it('returns user balance', async () => {
            const result = await contract.balanceOf(ETHER_ADDRESS, user1)
            result.toString().should.equal(tokens(1).toString())
        })
    })

    describe('making orders', () => {
        let result;

        beforeEach(async () => {
            result = await contract.makeOrder(token.address, tokens(1), ETHER_ADDRESS, tokens(1), { from: user1 })
        })

        it('tracks the newly created order', async () => {
            const orderCount = await contract.orderCount()
            orderCount.toString().should.equal('1')
            const order = await contract.orders('1')
            order.id.toString().should.equal('1')
            order.user.should.equal(user1)
            order.tokenGet.should.equal(token.address)
            order.amountGet.toString().should.equal(tokens(1).toString())
            order.tokenGive.should.equal(ETHER_ADDRESS)
            order.amountGive.toString().should.equal(tokens(1).toString())
            order.timestamp.toString().length.should.be.at.least(1)
        })

        it('emits an order event', async () => {
            const log = result.logs[0]
            log.event.should.equal('Order')
            const event = log.args
            event.id.toString().should.equal('1')
            event.user.should.equal(user1)
            event.tokenGet.should.equal(token.address)
            event.amountGet.toString().should.equal(tokens(1).toString())
            event.tokenGive.should.equal(ETHER_ADDRESS)
            event.amountGive.toString().should.equal(tokens(1).toString())
            event.timestamp.toString().length.should.be.at.least(1)
        })
    })

    describe('order actions', () => {

        beforeEach(async () => {
            await contract.depositEther({ from: user1, value: tokens(1) })
            await token.transfer(user2, tokens(100), { from: creator })
            await token.approve(contract.address, tokens(2), { from: user2 })
            await contract.depositToken(token.address, tokens(2), { from: user2 })
            await contract.makeOrder(token.address, tokens(1), ETHER_ADDRESS, tokens(1), { from: user1 })
        })

        describe('filling orders', () => {
            let result;

            describe('success', () => {
                beforeEach(async () => {
                    result = await contract.fillOrder('1', { from: user2 })
                })

                it('excedutes trade and charges fees', async () => {
                    let balance

                    balance = await contract.balanceOf(token.address, user1)
                    balance.toString().should.equal(tokens(1).toString())

                    balance = await contract.balanceOf(ETHER_ADDRESS, user2)
                    balance.toString().should.equal(tokens(1).toString())

                    balance = await contract.balanceOf(ETHER_ADDRESS, user1)
                    balance.toString().should.equal('0')

                    balance = await contract.balanceOf(token.address, user2)
                    balance.toString().should.equal(tokens(0.9).toString())

                    const feeAccount = await contract.feeAccount()
                    balance = await contract.balanceOf(token.address, feeAccount)
                    balance.toString().should.equal(tokens(0.1).toString())
                })

                it('updates filled orders', async () => {
                    const orderFilled = await contract.filledOrder(1)
                    orderFilled.should.equal(true)
                })

                it('emits a trade event', async () => {
                    const log = result.logs[0]
                    log.event.should.equal('Trade')
                    const event = log.args
                    event.id.toString().should.equal('1')
                    event.user.should.equal(user1)
                    event.tokenGet.should.equal(token.address)
                    event.amountGet.toString().should.equal(tokens(1).toString())
                    event.tokenGive.should.equal(ETHER_ADDRESS)
                    event.amountGive.toString().should.equal(tokens(1).toString())
                    event.userFill.should.equal(user2)
                    event.timestamp.toString().length.should.be.at.least(1)
                })
            })

            describe('failure', () => {
                it('rejects invalid order ids', async () => {
                    const invalidOrderId = 9999
                    await contract.fillOrder(invalidOrderId, { from: user2 }).should.be.rejectedWith(EVM_REVERT)
                })

                it('rejects already-filled orders', async () => {
                    await contract.fillOrder('1', { from: user2 }).should.be.fulfilled
                    await contract.fillOrder('1', { from: user2 }).should.be.rejectedWith(EVM_REVERT)
                }) 

                it('rejects cancelled orders', async() => {
                    await contract.cancelOrder('1', { from: user1 }).should.be.fulfilled
                    await contract.fillOrder('1', { from: user2 }).should.be.rejectedWith(EVM_REVERT)
                })
            })
        })

        describe('cancelling orders', () => {
            let result;

            describe('success', () => {
                beforeEach(async () => {
                    result = await contract.cancelOrder('1', { from: user1 })
                })

                it('updates cancelled orders', async () => {
                    const orderCancelled = await contract.cancelledOrder(1)
                    orderCancelled.should.equal(true)
                })

                it('emits a cancel event', async () => {
                    const log = result.logs[0]
                    log.event.should.equal('Cancel')
                    const event = log.args
                    event.id.toString().should.equal('1')
                    event.user.should.equal(user1)
                    event.tokenGet.should.equal(token.address)
                    event.amountGet.toString().should.equal(tokens(1).toString())
                    event.tokenGive.should.equal(ETHER_ADDRESS)
                    event.amountGive.toString().should.equal(tokens(1).toString())
                    event.timestamp.toString().length.should.be.at.least(1)
                })
            })

            describe('failure', () => {
                it('rejects invalid order ids', async () => {
                    const invalidOrderId = 9999
                    await contract.cancelOrder(invalidOrderId, { from: user1 }).should.be.rejectedWith(EVM_REVERT)
                })

                it('rejects unauthorized cancelations', async () => {
                    await contract.cancelOrder('1', { from: user2 }).should.be.rejectedWith(EVM_REVERT)
                })
            })
        })
    })
}) 