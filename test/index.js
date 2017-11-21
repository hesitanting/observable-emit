/* eslint-env es6 */
describe('EventSpec', () => {
  it('fire', () => {
    let N = 0
    const A = new Observable()
    A.on('cEvent', function () {
      N = 1
    })
    N = 1
    A.dispatch('cEvent')
    expect(N).to.eql(1)
  })
})
