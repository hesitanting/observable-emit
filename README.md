# 观察者模式

> 定义对象间的一种一对多的依赖关系，当一个对象的状态发生改变时，所有依赖于它的对象都将得到通知。包含订阅，分发，取消订阅。

[![Build Status](https://www.travis-ci.org/sakitam-fdd/observable-emit.svg?branch=master)](https://www.travis-ci.org/sakitam-fdd/observable-emit)
[![codecov](https://codecov.io/gh/sakitam-fdd/observable-emit/branch/master/graph/badge.svg)](https://codecov.io/gh/sakitam-fdd/observable-emit)
[![NPM downloads](https://img.shields.io/npm/dm/observable-emit.svg)](https://npmjs.org/package/observable-emit)
![JS gzip size](http://img.badgesize.io/https://unpkg.com/observable-emit/dist/observable.js?compression=gzip&label=gzip%20size:%20JS)
[![Npm package](https://img.shields.io/npm/v/observable-emit.svg)](https://www.npmjs.org/package/observable-emit)
[![GitHub stars](https://img.shields.io/github/stars/sakitam-fdd/observable-emit.svg)](https://github.com/sakitam-fdd/observable-emit/stargazers)
[![GitHub license](https://img.shields.io/github/license/sakitam-fdd/observable-emit.svg)](https://github.com/sakitam-fdd/observable-emit/blob/master/LICENSE)

## GetCode

```bash
git clone https://github.com/sakitam-fdd/observable-emit.git
npm install
npm run dev
npm run build
npm run karma.test
npm run karma.cover
```

## Use

### CDN

```bash
https://unpkg.com/observable-emit@1.1.1/dist/Observable.min.js
https://unpkg.com/observable-emit@1.1.1/dist/Observable.js
```

### NPM

```bash
npm install observable-emit --save
import Observable from 'observable-emit'
```
## Example

```javascript
  var emiter = new Observable()
  emiter.on('event1', function(event, data) {
    console.log(event, data)
  })
  // 触发一次取消订阅
  emiter.once('event1', function(event, data) {
    console.log(event, data)
  })
  emiter.on('event2', function(event, data) {
    console.log(event, data)
  })
  
  emiter.dispatch('event1', 'one')
  emiter.dispatchSync('event2', 'two')
// one

// 取消订阅, 不传时默认取消所有
emiter.un('event1')
```

## Methods

### on(eventName, callback, context)
### addEventListener(eventName, callback, context) -- alias

> 订阅事件

###### Parameters:

| key | type | desc |
| :--- | :--- | :---------- |
| `eventName` | `string` or `Object` | 事件名称, 可以使用空格分开订阅多个事件，也可以使用对象例如dom对象 |
| `callback` | `function` | 回调函数 |
| `context` | `function` | 上下文 |

### once(eventName, callback, context)

> 订阅事件（仅触发一次即取消订阅）

###### Parameters:

| key | type | desc |
| :--- | :--- | :---------- |
| `eventName` | `string` or `Object` | 事件名称, 可以使用空格分开订阅多个事件，也可以使用对象例如dom对象 |
| `callback` | `function` | 回调函数 |
| `context` | `function` | 上下文 |

### un(eventName, callback, context)
### removeEventListener(eventName, callback, context) -- alias

> 取消订阅，无参数时默认取消所有事件订阅

###### Parameters:

| key | type | desc |
| :--- | :--- | :---------- |
| `eventName` | `string` or `Object` | 事件名称, 可以使用空格分开订阅多个事件，也可以使用对象例如dom对象 |
| `callback` | `function` | 订阅函数 |
| `context` | `function` | 上下文 |

### dispatch(eventName, ...)

> 触发事件，实时(参数不定)

###### Parameters:

| key | type | desc |
| :--- | :--- | :---------- |
| `eventName` | `string` | 事件名称 |

### dispatchSync(eventName, ...)

> 触发事件，异步(参数不定)

###### Parameters:

| key | type | desc |
| :--- | :--- | :---------- |
| `eventName` | `string` | 事件名称 |

