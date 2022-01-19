import { Component } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import { connect } from 'react-redux'
import Navbar from './Navbar';
import Main from './Main';
import { accountSelector, contractsLoadedSelector } from '../redux/selectors';
import Lottie from "lottie-react";
import watermelon from './watermelon.json'

class App extends Component {
  render() {
    return (
      <div>
        <Navbar />
        {this.props.contractsLoaded && this.props.account ?
          <Main />
          :
          <div className='preview'>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320"><path fill="#dc3545" fillOpacity="1" d="M0,160L48,144C96,128,192,96,288,69.3C384,43,480,21,576,37.3C672,53,768,107,864,112C960,117,1056,75,1152,90.7C1248,107,1344,181,1392,218.7L1440,256L1440,0L1392,0C1344,0,1248,0,1152,0C1056,0,960,0,864,0C768,0,672,0,576,0C480,0,384,0,288,0C192,0,96,0,48,0L0,0Z"></path></svg>
            <h1>Sandia Token Exchange</h1>
            <h2>The one exchange for trading Sandia token</h2>
            <Lottie animationData={watermelon} className='watermelon' />
            <h3>Connect your wallet to enter the app.</h3>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320"><path fill="#dc3545" fillOpacity="1" d="M0,192L48,197.3C96,203,192,213,288,229.3C384,245,480,267,576,256C672,245,768,203,864,192C960,181,1056,203,1152,218.7C1248,235,1344,245,1392,250.7L1440,256L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path></svg>
          </div>}
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    contractsLoaded: contractsLoadedSelector(state),
    account: accountSelector(state)
  }
}

export default connect(mapStateToProps)(App);
