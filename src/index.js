/**
 * Created by FDD on 2017/11/24.
 * @desc input
 */
import uuidv5 from 'uuid/v5'

const _trim = str => {
  return str.trim ? str.trim() : str.replace(/^\s+|\s+$/g, '')
}

const _bind = (fn, obj) => {
  let slice = Array.prototype.slice
  if (fn.bind) {
    return fn.bind.apply(fn, slice.call(arguments, 1))
  }
  let args = slice.call(arguments, 2)
  return function () {
    return fn.apply(obj, args.length ? args.concat(slice.call(arguments)) : arguments)
  }
}

/**
 * Merges the properties of sources into destination object.
 * @param  {Object} dest   - object to extend
 * @param  {...Object} src - sources
 * @return {Object}
 * @memberOf Util
 */
const _extend = function (dest) { // (Object[, Object, ...]) ->
  for (let i = 1; i < arguments.length; i++) {
    const src = arguments[i]
    for (const k in src) {
      dest[k] = src[k]
    }
  }
  return dest
}

class Observable {
  /**
   * Register a handler function to be called whenever this event is dispatch.
   * @param events
   * @param callback
   * @param context
   * @returns {Observable}
   */
  on (events, callback, context) {
    if (!events || !callback) { // when no event listeners or callback, return this
      return this
    }
    if (typeof events === 'object') {
      for (const type in events) {
        this._on(type, events[type], callback)
      }
    } else {
      // events can be a string of space-separated words
      const _events = _trim(events).split(/\s+/)
      for (let i = 0, len = _events.length; i < len; i++) {
        this._on(_events[i], callback, context)
      }
    }
    return this
  }

  /**
   * Removes a previously added listener function. If no function is specified, it will remove all the listeners
   * @param events
   * @param callback
   * @param context
   * @returns {Observable}
   */
  un (events, callback, context) {
    if (!events) {
      // clear all listeners if called without arguments
      delete this._events
    } else if (typeof events === 'object') {
      for (const type in events) {
        this._un(type, events[type], callback)
      }
    } else {
      const _events = _trim(events).split(/\s+/)
      for (let i = 0, len = _events.length; i < len; i++) {
        this._un(_events[i], callback, context)
      }
    }
    return this
  }

  /**
   * Alias for [on]{@link Observable.on}
   * @returns {*}
   */
  addEventListener () {
    return this.on.apply(this, arguments)
  }

  /**
   * Alias for [off]{@link Observable.un}
   * @returns {*}
   */
  removeEventListener () {
    return this.un.apply(this, arguments)
  }

  /**
   * Same as on, except the listener will only get dispatch once and then removed.
   * @param events
   * @param callback
   * @param context
   * @returns {Observable}
   */
  once (events, callback, context) {
    if (!events || !callback) { // when no event listeners or callback, return this
      return this
    }
    if (typeof events === 'object') {
      for (const type in events) {
        this.once(type, events[type], callback)
      }
      return this
    }
    let handler = _bind(function () {
      this.un(events, callback, context).un(events, handler, context)
    }, this)
    // add a listener that's executed once and removed after that
    return this.on(events, callback, context).on(events, handler, context)
  }

  /**
   * Register internal
   * @param event
   * @param callback
   * @param context
   * @private
   */
  _on (event, callback, context) {
    this._events = this._events || {}
    let _listeners = this._events[event]
    if (!_listeners) {
      _listeners = []
      this._events[event] = _listeners
    }
    if (context === this) {
      // Less memory footprint.
      context = undefined
    }
    let newListener = {
      handler: callback,
      context: context
    }
    let listeners = _listeners
    // check if handler already there
    for (let i = 0, len = listeners.length; i < len; i++) {
      if (listeners[i].handler === callback && listeners[i].context === context) {
        return this
      }
    }
    listeners.push(newListener)
  }

  /**
   * un internal
   * @param event
   * @param callback
   * @param context
   * @private
   */
  _un (event, callback, context) {
    let [listeners, i, len] = []
    if (!this._events) { return }
    listeners = this._events[event]
    if (!listeners) {
      return
    }
    if (!callback) {
      // Set all removed listeners to noop so they are not called if remove happens in fire
      for (i = 0, len = listeners.length; i < len; i++) {
        listeners[i].callback = function () { return false }
      }
      // clear all listeners for a type if function isn't specified
      delete this._events[event]
      return
    }
    if (context === this) {
      context = undefined
    }
    if (listeners) {
      // find handler and remove it
      for (i = 0, len = listeners.length; i < len; i++) {
        let $listener = listeners[i]
        if ($listener.context !== context) { continue }
        if ($listener.handler === callback) {
          // set the removed listener to noop so that's not called if remove happens in fire
          $listener.handler = function () { return false }
          if (this._firingCount) {
            /* copy array in case events are being fired */
            this._events[event] = listeners = listeners.slice()
          }
          listeners.splice(i, 1)
          return
        }
      }
    }
  }

  /**
   * dispatch
   * @returns {*}
   */
  dispatch () {
    return this._action.apply(this, arguments)
  }

  /**
   * dispatchSync
   * @returns {Observable}
   */
  dispatchSync () {
    setTimeout(() => {
      this._action.apply(this, arguments)
    })
    return this
  }

  /**
   * action internal
   * @param type
   * @param data
   * @param propagate
   * @returns {Observable}
   * @private
   */
  _action (type, data, propagate) {
    if (!this.listens(type, propagate)) { return this }
    let event = {
      type: type,
      target: this
    }
    if (this._events) {
      let listeners = this._events[type]
      if (listeners) {
        this._firingCount = (this._firingCount + 1) || 1
        for (let i = 0, len = listeners.length; i < len; i++) {
          let $listener = listeners[i]
          $listener.handler.call($listener.context || this, event, data)
        }
        this._firingCount--
      }
    }
    if (propagate) {
      // propagate the event to parents (set with addEventParent)
      this._propagateEvent(event)
    }
    return this
  }

  /**
   * Returns `true` if a particular event type has any listeners attached to it.
   * @param type
   * @param propagate
   * @returns {boolean}
   */
  listens (type, propagate) {
    let listeners = this._events && this._events[type]
    if (listeners && listeners.length) { return true }
    if (propagate) {
      // also check parents for listeners if event propagates
      for (const id in this._eventParents) {
        if (this._eventParents[id].listens(type, propagate)) { return true }
      }
    }
    return false
  }

  /**
   * Adds an event parent - an `Evented` that will receive propagated events
   * @param obj
   * @returns {Observable}
   */
  addEventParent (obj) {
    this._eventParents = this._eventParents || {}
    this._eventParents[uuidv5(obj, 'event-parents')] = obj
    return this
  }

  /**
   * Removes an event parent, so it will stop receiving propagated events
   * @param obj
   * @returns {Observable}
   */
  removeEventParent (obj) {
    if (this._eventParents) {
      delete this._eventParents[uuidv5(obj, 'event-parents')]
    }
    return this
  }

  _propagateEvent (e) {
    for (const id in this._eventParents) {
      this._eventParents[id].dispatch(e.type, _extend({
        layer: e.target,
        propagatedFrom: e.target
      }, e), true)
    }
  }
}

export default Observable
