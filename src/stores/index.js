import {applyMiddleware, createStore} from 'redux';
import createSagaMiddleware from 'redux-saga';
import {persistStore, persistReducer} from 'redux-persist';
import autoMergeLevel2 from 'redux-persist/lib/stateReconciler/autoMergeLevel2';
import storage from 'redux-persist/lib/storage';
import logger from 'redux-logger';
import rootReducer from '../redux/reducers';
import rootSaga from '../redux/sagas';

const persistConfig = {
  key: 'root',
  storage,
  stateReconciler: autoMergeLevel2
};

const bindMiddleware = (middleware) => {
  if (process.env.NODE_ENV !== 'production') {
    // eslint-disable-next-line
    const {composeWithDevTools} = require('redux-devtools-extension');

    // return composeWithDevTools(applyMiddleware(...middleware, logger));
  }
  return applyMiddleware(...middleware);
};

const sagaMiddleware = createSagaMiddleware();

export const store = createStore(
  persistReducer(persistConfig, rootReducer),
  bindMiddleware([sagaMiddleware])
);
sagaMiddleware.run(rootSaga);

export const persistor = persistStore(store);
