/**
 * Stop browser event propagation
 * @param  {Event} e - browser event.
 * @memberOf DomUtil
 */
const stopPropagation = function (e) {
  if (e.stopPropagation) {
    e.stopPropagation()
  } else {
    e.cancelBubble = true
  }
  return this
}

/**
 * Merges the properties of sources into destination object.
 * @param  {Object} dest   - object to extend
 * @param  {...Object} src - sources
 * @return {Object}
 * @memberOf Util
 */
const extend = function (dest) { // (Object[, Object, ...]) ->
  for (let i = 1; i < arguments.length; i++) {
    const src = arguments[i]
    for (const k in src) {
      dest[k] = src[k]
    }
  }
  return dest
}

class Class {
  setOptions (options) {
    if (!this.hasOwnProperty('options')) {
      this.options = this.options ? Object.create(this.options) : {}
    }
    if (!options) {
      return this
    }
    for (const i in options) {
      this.options[i] = options[i]
    }
    return this
  }
}

const Eventable = Base => class extends Base {
  /**
   * Register a handler function to be called whenever this event is fired.
   * @param events
   * @param handler
   * @param context
   * @returns {*}
   */
  on (events, handler, context) {
    if (!events || !handler) {
      return this
    }
    if (!(typeof events === 'string')) {
      return this._switch('on', events, handler)
    }
    if (!this._eventMap) {
      this._eventMap = {}
    }
    const eventTypes = events.toLowerCase().split(' ')
    let evtType
    if (!context) {
      context = this
    }
    let handlerChain
    for (let ii = 0, ll = eventTypes.length; ii < ll; ii++) {
      evtType = eventTypes[ii]
      handlerChain = this._eventMap[evtType]
      if (!handlerChain) {
        handlerChain = []
        this._eventMap[evtType] = handlerChain
      }
      const l = handlerChain.length
      if (l > 0) {
        for (let i = 0; i < l; i++) {
          if (handler === handlerChain[i].handler && handlerChain[i].context === context) {
            return this
          }
        }
      }
      handlerChain.push({
        handler: handler,
        context: context
      })
    }
    return this
  }

  /**
   * Alias for [on]{@link Eventable.on}
   * @returns {*}
   */
  addEventListener () {
    return this.on.apply(this, arguments)
  }

  /**
   * Same as on, except the listener will only get fired once and then removed.
   * @param eventTypes
   * @param handler
   * @param context
   * @returns {*}
   */
  once (eventTypes, handler, context) {
    if (!(typeof eventTypes === 'string')) {
      const once = {}
      for (const p in eventTypes) {
        if (eventTypes.hasOwnProperty(p)) {
          once[p] = this._wrapOnceHandler(p, eventTypes[p], context)
        }
      }
      return this._switch('on', once)
    }
    const evetTypes = eventTypes.split(' ')
    for (let i = 0, l = evetTypes.length; i < l; i++) {
      this.on(evetTypes[i], this._wrapOnceHandler(evetTypes[i], handler, context))
    }
    return this
  }

  /**
   * Unregister the event handler for the specified event types.
   * @param eventsOff
   * @param handler
   * @param context
   * @returns {*}
   */
  off (eventsOff, handler, context) {
    if (!eventsOff || !this._eventMap || !handler) {
      return this
    }
    if (!(typeof eventsOff === 'string')) {
      return this._switch('off', eventsOff, handler)
    }
    const eventTypes = eventsOff.split(' ')
    let eventType, listeners, wrapKey
    if (!context) {
      context = this
    }
    for (let j = 0, jl = eventTypes.length; j < jl; j++) {
      eventType = eventTypes[j].toLowerCase()
      wrapKey = 'Z__' + eventType
      listeners = this._eventMap[eventType]
      if (!listeners) {
        return this
      }
      for (let i = listeners.length - 1; i >= 0; i--) {
        const listener = listeners[i]
        if ((handler === listener.handler || handler === listener.handler[wrapKey]) && listener.context === context) {
          delete listener.handler[wrapKey]
          listeners.splice(i, 1)
        }
      }
    }
    return this
  }

  /**
   * Alias for [off]{@link Eventable.off}
   * @returns {*}
   */
  removeEventListener () {
    return this.off.apply(this, arguments)
  }

  /**
   * Returns listener's count registered for the event type.
   * @param eventType
   * @param handler
   * @param context
   * @returns {number}
   */
  listens (eventType, handler, context) {
    if (!this._eventMap || !(typeof eventType === 'string')) {
      return 0
    }
    const handlerChain = this._eventMap[eventType.toLowerCase()]
    if (!handlerChain || !handlerChain.length) {
      return 0
    }
    let count = 0
    for (let i = 0, len = handlerChain.length; i < len; i++) {
      if (handler) {
        if (handler === handlerChain[i].handler &&
          (!context || handlerChain[i].context === context)) {
          return 1
        }
      } else {
        count++
      }
    }
    return count
  }

  /**
   * Copy all the event listener to the target object
   * @param target
   */
  copyEventListeners (target) {
    const eventMap = target._eventMap
    if (!eventMap) {
      return this
    }
    let handlerChain
    for (const eventType in eventMap) {
      handlerChain = eventMap[eventType]
      for (let i = 0, len = handlerChain.length; i < len; i++) {
        this.on(eventType, handlerChain[i].handler, handlerChain[i].context)
      }
    }
    return this
  }

  /**
   * Fire an event, causing all handlers for that event name to run.
   * @returns {*}
   */
  fire () {
    if (this._eventParent) {
      return this._eventParent.fire.apply(this._eventParent, arguments)
    }
    return this._fire.apply(this, arguments)
  }

  _wrapOnceHandler (evtType, handler, context) {
    const me = this
    const key = 'Z__' + evtType
    let called = false
    const fn = function onceHandler () {
      if (called) {
        return
      }
      delete fn[key]
      called = true
      if (context) {
        handler.apply(context, arguments)
      } else {
        handler.apply(this, arguments)
      }
      me.off(evtType, onceHandler, this)
    }
    fn[key] = handler
    return fn
  }

  _switch (to, eventKeys, context) {
    for (const p in eventKeys) {
      if (eventKeys.hasOwnProperty(p)) {
        this[to](p, eventKeys[p], context)
      }
    }
    return this
  }

  _clearListeners (eventType) {
    if (!this._eventMap || !(typeof eventType === 'string')) {
      return
    }
    const handlerChain = this._eventMap[eventType.toLowerCase()]
    if (!handlerChain) {
      return
    }
    this._eventMap[eventType] = null
  }

  _clearAllListeners () {
    this._eventMap = null
  }

  /**
   * Set a event parent to handle all the events
   * @param parent
   * @private
   */
  _setEventParent (parent) {
    this._eventParent = parent
    return this
  }

  /**
   * fire inter
   * @param eventType
   * @param param
   * @private
   */
  _fire (eventType, param) {
    if (!this._eventMap) {
      return this
    }
    const handlerChain = this._eventMap[eventType.toLowerCase()]
    if (!handlerChain) {
      return this
    }
    if (!param) {
      param = {}
    }
    param['type'] = eventType
    param['target'] = this
    // in case of deleting a listener in a execution, copy the handlerChain to execute.
    const queue = handlerChain.slice(0)
    let context, bubble, passed
    for (let i = 0, len = queue.length; i < len; i++) {
      if (!queue[i]) {
        continue
      }
      context = queue[i].context
      bubble = true
      passed = extend({}, param)
      if (context) {
        bubble = queue[i].handler.call(context, passed)
      } else {
        bubble = queue[i].handler(passed)
      }
      // stops the event propagation if the handler returns false.
      if (bubble === false) {
        if (param['domEvent']) {
          stopPropagation(param['domEvent'])
        }
      }
    }
    return this
  }
}

class Observable extends Eventable(Class) {
  constructor (options) {
    super(options)
    this.options = options
  }

  getOptions () {
    return this.options
  }
}

export default Observable
