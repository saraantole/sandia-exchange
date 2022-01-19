import { Component } from 'react';
import { connect } from 'react-redux'
import { filledOrdersLoadedSelector, filledOrdersSelector } from '../redux/selectors';
import Spinner from './Spinner'

class Trades extends Component {
    render() {
        const { filledOrders, filledOrdersLoaded } = this.props;
        return (
            <div className='vertical'>
                <div className="card bg-dark text-white">
                    <div className="card-header">Trades</div>
                    <div className="card-body">
                        <table className='table table-dark table-sm small'>
                            <thead>
                                <tr>
                                    <th>Time</th>
                                    <th>SND</th>
                                    <th>SND/ETH</th>
                                </tr>
                            </thead>
                            {
                                filledOrdersLoaded ?
                                    <tbody>
                                        {
                                            filledOrders?.map((order, i) =>
                                                <tr key={i}>
                                                    <td className='text-muted'>{order.formattedTimestamp}</td>
                                                    <td>{order.tokenAmount}</td>
                                                    <td className={`text-${order.tokenPriceClass}`}>{order.tokenPrice}</td>
                                                </tr>
                                            )
                                        }
                                    </tbody>
                                    :
                                    <Spinner type='table' />
                            }
                        </table>
                    </div>
                </div>
            </div>
        );
    }
}

function mapStateToProps(state) {
    return {
        filledOrdersLoaded: filledOrdersLoadedSelector(state),
        filledOrders: filledOrdersSelector(state)
    }
}

export default connect(mapStateToProps)(Trades);
