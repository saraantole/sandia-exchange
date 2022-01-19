import { applyMiddleware, compose, createStore } from "redux";
import { createLogger } from "redux-logger";
import rootReducer from "./reducers";

const logger = createLogger()
const middlewares = []

const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose // Redux dev tools

export default function configStore(prevState) {
    return createStore(
        rootReducer,
        prevState,
        composeEnhancers(applyMiddleware(...middlewares, logger))
    )
}