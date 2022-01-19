import { Component } from 'react';
import { connect } from 'react-redux'
import { accountSelector } from '../redux/selectors';
import { loadAccountWeb3, loadTokenContract, loadWeb3, loadExchangeContract } from '../redux/interactions'

class Navbar extends Component {
  async connectWallet(dispatch) {
    const web3 = loadWeb3(dispatch)
    await loadAccountWeb3(dispatch)
    // const network = await web3.eth.net.getNetworkType()
    const networkId = await web3.eth.net.getId()
    const token = await loadTokenContract(web3, networkId, dispatch)
    const exchange = await loadExchangeContract(web3, networkId, dispatch)
    if (!token || !exchange) {
      window.alert('Exchange not available on the current network. Please select Kovan network with Metamask.')
    }
  }
  
  render() {
    const { account } = this.props
    return (
      <nav className="navbar x-5 navbar-expand-lg navbar-dark bg-danger">
        <div className="container-fluid">
          <a className="navbar-brand" href="/">🍉 Sandia</a>
          {
            account ?
              <ul className="navbar-nav ml-auto">
                <li className="nav-item">
                  <a
                    className="nav-link small"
                    href={`https://etherscan.io/address/${account}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {account}
                  </a>
                </li>
              </ul>
              : <button className='btn btn-outline-light' onClick={() => this.connectWallet(this.props.dispatch)}>Connect Wallet</button>
          }
        </div>
      </nav>
    );
  }
}

function mapStateToProps(state) {
  return {
    account: accountSelector(state)
  }
}

export default connect(mapStateToProps)(Navbar);
