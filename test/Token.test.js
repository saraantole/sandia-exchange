/* eslint-disable no-undef */
require('chai').use(require('chai-as-promised')).should()

const Token = artifacts.require("Token")

const tokens = n => new web3.utils.BN(web3.utils.toWei(n.toString(), 'ether'))
const EVM_REVERT = 'VM Exception while processing transaction: revert'

contract('Token', ([creator, receiver, exchange]) => {
    const name = 'Sandia'
    const symbol = 'SND'
    const decimals = '18'
    const totalSupply = tokens(1000000).toString()
    let contract;

    describe('deployment', () => {
        beforeEach(async () => {
            contract = await Token.new() // instanciate the contract
        })

        it('tracks the name', async () => {
            const result = await contract.name()
            result.should.equal(name)
        })

        it('tracks the symbol', async () => {
            const result = await contract.symbol()
            result.should.equal(symbol)
        })

        it('tracks the decimal', async () => {
            const result = await contract.decimals()
            result.toString().should.equal(decimals)
        })

        it('tracks the total supply', async () => {
            const result = await contract.totalSupply()
            result.toString().should.equal(totalSupply.toString())
        })

        it('assigns the total supply to contract creator', async () => {
            const result = await contract.balanceOf(creator)
            result.toString().should.equal(totalSupply.toString())
        })
    })

    describe('sending tokens', () => {
        let amount, result;

        describe('success', () => {
            beforeEach(async () => {
                amount = tokens(100);
                result = await contract.transfer(receiver, amount, { from: creator })
            })

            it('transfers token balances', async () => {
                const senderBalance = await contract.balanceOf(creator)
                const receiverBalance = await contract.balanceOf(receiver)
                senderBalance.toString().should.equal(tokens(999900).toString())
                receiverBalance.toString().should.equal(tokens(100).toString())
            })

            it('emits a transfer event', async () => {
                const log = result.logs[0];
                log.event.should.equal('Transfer');
                const event = log.args;
                event.from.toString().should.equal(creator)
                event.to.toString().should.equal(receiver)
                event.value.toString().should.equal(amount.toString())
            })
        })

        describe('failure', () => {
            it('rejects insufficient balances', async () => {
                const invalidAmount = tokens(1000000) // > total supply
                await contract.transfer(receiver, invalidAmount, { from: creator }).should.be.rejectedWith(EVM_REVERT);
                await contract.transfer(creator, invalidAmount, { from: receiver }).should.be.rejectedWith(EVM_REVERT);
            })

            it('rejects invalid recipients', async () => {
                await contract.transfer(0x0, amount, { from: creator }).should.be.rejected;
            })
        })
    })

    describe('approving transactions', () => {
        let result, amount

        beforeEach(async () => {
            amount = tokens(100)
            result = await contract.approve(exchange, amount, { from: creator })
        })

        describe('success', () => {
            it('allocates allowance for delegated token spending on exchange', async () => {
                const allowance = await contract.allowance(creator, exchange)
                allowance.toString().should.equal(amount.toString())
            })

            it('emits an approval event', async () => {
                const log = result.logs[0];
                log.event.should.equal('Approval');
                const event = log.args;
                event.owner.toString().should.equal(creator)
                event.spender.toString().should.equal(exchange)
                event.value.toString().should.equal(amount.toString())
            })
        })

        describe('failure', () => {
            it('rejects invalid spenders', async () => {
                await contract.approve(0x0, amount, { from: creator }).should.be.rejected
            })
        })
    })

    describe('delegating token transfer', () => {
        let amount, result;

        beforeEach(async () => {
            amount = tokens(100);
            await contract.approve(exchange, amount, { from: creator })
        })

        describe('success', () => {
            beforeEach(async () => {
                result = await contract.transferFrom(creator, receiver, amount, { from: exchange })
            })

            it('transfers token balances', async () => {
                const senderBalance = await contract.balanceOf(creator)
                const receiverBalance = await contract.balanceOf(receiver)
                senderBalance.toString().should.equal(tokens(999700).toString())
                receiverBalance.toString().should.equal(tokens(300).toString())
            })

            it('resets the allowance', async () => {
                const allowance = await contract.allowance(creator, exchange)
                allowance.toString().should.equal('0')
            })

            it('emits a transfer event', async () => {
                const log = result.logs[0];
                log.event.should.equal('Transfer');
                const event = log.args;
                event.from.toString().should.equal(creator)
                event.to.toString().should.equal(receiver)
                event.value.toString().should.equal(amount.toString())
            })
        })

        describe('failure', () => {
            it('rejects insufficient amounts', async() => {
                const invalidAmount = tokens(1000000)
                await contract.transferFrom(creator, receiver, invalidAmount, {from: exchange}).should.be.rejectedWith(EVM_REVERT);
            })

            it('rejects invalid recipients', async () => {
                await contract.transferFrom(creator, 0x0, amount, { from: exchange }).should.be.rejected;
            })
        })
    })
}) 