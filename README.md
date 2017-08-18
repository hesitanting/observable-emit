# 观察者模式

> 定义对象间的一种一对多的依赖关系，当一个对象的状态发生改变时，所有依赖于它的对象都将得到通知。包含订阅，分发，取消订阅。

[![Build Status](https://www.travis-ci.org/sakitam-fdd/observable-emit.svg?branch=master)](https://www.travis-ci.org/sakitam-fdd/observable-emit)
[![NPM](https://nodei.co/npm/observable-emit.png?downloads=true&downloadRank=true&stars=true)](https://nodei.co/npm/observable-emit/)

## GetCode

```bash
git clone https://github.com/sakitam-fdd/observable-emit.git
npm install
npm run dev
npm run build
```

## Use

### CDN

```bash
https://unpkg.com/observable-emit@1.0.1/dist/Observable.min.js
https://unpkg.com/observable-emit@1.0.1/dist/Observable.js
```

### NPM

```bash
npm install observable-emit --save
import Observable from 'observable-emit'
```
## Example

```javascript
  var emiter = new Observable()
  emiter.on('event1', function(event) {
    console.log(event)
  })
  // 触发一次取消订阅
  emiter.once('event1', function(event) {
    console.log(event)
  })
  emiter.on('event2', function(event) {
    console.log(event)
  })
  
  emiter.dispatch('event1', 'one')
  emiter.dispatchSync('event2', 'two')
// one

// 取消订阅
emiter.un('event1')

// 取消所有订阅
emiter.clear()
```

## Methods

### on(eventName, callback, context)

> 订阅事件

###### Parameters:

| key | type | desc |
| :--- | :--- | :---------- |
| `eventName` | `string` | 事件名称 |
| `callback` | `function` | 回调函数 |
| `context` | `function` | 上下文 |

### once(eventName, callback, context)

> 订阅事件（仅触发一次即取消订阅）

###### Parameters:

| key | type | desc |
| :--- | :--- | :---------- |
| `eventName` | `string` | 事件名称 |
| `callback` | `function` | 回调函数 |
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

### clear()

> 取消所有订阅
