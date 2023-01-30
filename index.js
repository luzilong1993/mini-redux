/**
 * createStore(reducer, preloadedState,enhancer)
 * {
 *  getState(),
 *  dispatch(),
 *  subscribe()
 * }
 */

function createStore(reducer, preloadedState, enhancer) {
    // 约束reducer参数类型
    if (typeof reducer !== 'function') throw new Error('reducer必须是函数');
    // 判断enhancer参数有没有传递
    if (typeof enhancer !== 'undefined') {
        // 判断enhancer是不是一个函数
        if (typeof enhancer !== 'function') throw new Error('enhancer必须是函数');
        return enhancer(createStore)(reducer, preloadedState)
    }
    // store 对象中存储的状态
    var currentState = preloadedState;
    // 存放订阅者函数
    var currentListeners = [];

    // 获取状态
    function getState() {
        return currentState
    }

    // 触发action
    function dispatch(action) {
        // 判断action是否是对象
        if (!isPlainObject(action)) throw new Error('action必须是对象');
        // 判断对象中是否具有type属性
        if (typeof action.type === 'undefined') throw new Error('action对象中必须有type属性');

        currentState = reducer(currentState, action);
        // 循环数组，调用订阅者
        for (var i = 0; i < currentListeners.length; i++) {
            // 获取订阅者
            var listener = currentListeners[i];
            // 调用订阅者
            listener()
        }
    }

    // 订阅状态
    function subscribe(listener) {
        currentListeners.push(listener)
    }

    return {
        getState, dispatch, subscribe
    }
}

// 判断obj参数是否是对象
function isPlainObject(obj) {
    // 判断基本数据类型和null
    if (typeof obj !== 'object' || obj === null) return false;
    // 区分数组和对象 原型对象对比的方式
    var proto = obj;
    while (Object.getPrototypeOf(proto) !== null) {
        proto = Object.getPrototypeOf(proto)
    }
    return Object.getPrototypeOf(obj) === proto
}

// applyMiddleware
function applyMiddleware(...middlewares) {
    return function (createStore) {
        return function (reducer, preloadedState) {
            // 创建store
            var store = createStore(reducer, preloadedState);
            // 阉割版的store
            var middlewareAPI = {
                getState: store.getState,
                dispatch: store.dispatch
            }

            // 调用中间件的第一层函数， 传递阉割版的store对象
            var chain = middlewares.map(middleware => middleware(middlewareAPI));
            var dispatch = compose(...chain)(dispatch);
            return {
                ...store,
                dispatch
            }
        }
    }
}

function compose() {
    var funcs = [...arguments];
    return function (dispatch) {
        for (var i = funcs.length - 1; i >= 0; i--) {
            dispatch = funcs[i](dispatch);
        }
        return dispatch
    }
}
