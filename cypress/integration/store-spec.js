/* eslint-env mocha */
/* global cy, Cypress */
import {
  resetDatabase,
  visit,
  newId,
  enterProduct,
  stubMathRandom,
  makeProduct,
  getProductItems
} from './utils'

// testing the central Vuex data store
describe.skip('UI to Vuex store', () => {
  beforeEach(resetDatabase)
  beforeEach(visit)

  const getStore = () => cy.window().its('app.$store')

  it('has loading, newProduct and products properties', () => {
    getStore()
      .its('state')
      .should('have.keys', ['loading', 'newProduct', 'products'])
  })

  it('starts empty', () => {
    getStore()
      .its('state')
      .should('deep.equal', {
        loading: true, // initially the store is loading data
        products: [],
        newProduct: ''
      })
  })

  it('can enter new product text', () => {
    const text = 'learn how to test with Cypress.io'
    cy
      .get('.shoppingbag')
      .find('.add-product-1')
      .type(text)
      .trigger('change')

    getStore()
      .its('state.newProduct')
      .should('equal', text)
  })

  it('stores products in the store', () => {
    enterProduct('first product')
    enterProduct('second product')

    getStore()
      .its('state.products')
      .should('have.length', 2)

    const removeIds = list => list.map(product => Cypress._.omit(product, 'id'))
    getStore()
      .its('state.products')
      .then(removeIds)
      .should('deep.equal', [
        {
          title: 'first product',
          completed: false
        },
        {
          title: 'second product',
          completed: false
        }
      ])
  })

  const stubMathRandom = () => {
    // first two digits are disregarded, so our "random" sequence of ids
    // should be '1', '2', '3', ...
    let counter = 101
    cy.window().then(win => {
      cy.stub(win.Math, 'random').callsFake(() => counter++)
    })
  }

  it('stores products in the store (with ids)', () => {
    stubMathRandom()
    enterProduct('first product')
    enterProduct('second product')

    getStore()
      .its('state.products')
      .should('have.length', 2)

    getStore()
      .its('state.products')
      .should('deep.equal', [
        {
          title: 'first product',
          completed: false,
          id: '1'
        },
        {
          title: 'second product',
          completed: false,
          id: '2'
        }
      ])
  })
})

describe.skip('Vuex store', () => {
  beforeEach(resetDatabase)
  beforeEach(visit)
  beforeEach(stubMathRandom)

  let store

  beforeEach(() => {
    cy
      .window()
      .its('app')
      .its('$store')
      .then(s => {
        store = s
      })
  })

  const toJSON = x => JSON.parse(JSON.stringify(x))

  // returns the entire Vuex store
  const getStore = () => cy.then(_ => cy.wrap(toJSON(store.state)))

  // returns given getter value from the store
  const getFromStore = property =>
    cy.then(_ => cy.wrap(store.getters[property]))

  // and a helper methods because we are going to pull "products" often
  const getStoreProducts = getFromStore.bind(null, 'products')

  it('starts empty', () => {
    getStoreProducts().should('deep.equal', [])
  })

  it('can enter new product text', () => {
    const text = 'learn how to test with Cypress.io'
    cy
      .get('.shoppingbag')
      .find('.add-product-1')
      .type(text)
      .trigger('change')

    getFromStore('newProduct').should('equal', text)
  })

  it('can compare the entire store', () => {
    getStore().should('deep.equal', {
      loading: true, // initially the store is loading data
      products: [],
      newProduct: ''
    })
  })

  it('can add a product, type and compare entire store', () => {
    const title = 'a random product'
    enterProduct(title)

    const text = 'learn how to test with Cypress.io'
    cy
      .get('.shoppingbag')
      .find('.add-product-1')
      .type(text)
      .trigger('change')

    getStore().should('deep.equal', {
      loading: false,
      products: [
        {
          title,
          completed: false,
          id: '1'
        }
      ],
      newProduct: text
    })
  })

  it('can add a product', () => {
    const title = `a single product ${newId()}`
    enterProduct(title)
    getStoreProducts()
      .should('have.length', 1)
      .its('0')
      .and('have.all.keys', 'id', 'title', 'completed')
  })

  // thanks to predictable random id generation
  // we know the objects in the products list
  it('can add a particular product', () => {
    const title = `a single product ${newId()}`
    enterProduct(title)
    getStoreProducts().should('deep.equal', [
      {
        title,
        completed: false,
        id: '2'
      }
    ])
  })

  it('can add two products and delete one', () => {
    const first = makeProduct()
    const second = makeProduct()

    enterProduct(first.title)
    enterProduct(second.title)

    getProductItems()
      .should('have.length', 2)
      .first()
      .find('.destroy')
      .click({ force: true })

    getProductItems().should('have.length', 1)

    getStoreProducts().should('deep.equal', [
      {
        title: second.title,
        completed: false,
        id: '4'
      }
    ])
  })

  it('can be driven by dispatching actions', () => {
    store.dispatch('setNewProduct', 'a new product')
    store.dispatch('addProduct')
    store.dispatch('clearNewProduct')

    // assert UI
    getProductItems()
      .should('have.length', 1)
      .first()
      .contains('a new product')

    // assert store
    getStore().should('deep.equal', {
      loading: false,
      products: [
        {
          title: 'a new product',
          completed: false,
          id: '1'
        }
      ],
      newProduct: ''
    })
  })
})

describe.skip('Store actions', () => {
  const getStore = () => cy.window().its('app.$store')

  beforeEach(resetDatabase)
  beforeEach(visit)
  beforeEach(stubMathRandom)

  it('changes the state', () => {
    getStore().then(store => {
      store.dispatch('setNewProduct', 'a new product')
      store.dispatch('addProduct')
      store.dispatch('clearNewProduct')
    })

    getStore()
      .its('state')
      .should('deep.equal', {
        loading: false,
        products: [
          {
            title: 'a new product',
            completed: false,
            id: '1'
          }
        ],
        newProduct: ''
      })
  })

  it('changes the state after delay', () => {
    // this will force store action "setNewProduct" to commit
    // change to the store only after 3 seconds
    cy.server()
    cy.route({
      method: 'POST',
      url: '/products',
      delay: 3000,
      response: {}
    })

    getStore().then(store => {
      store.dispatch('setNewProduct', 'a new product')
      store.dispatch('addProduct')
      store.dispatch('clearNewProduct')
    })

    getStore()
      .its('state')
      .should('deep.equal', {
        loading: false,
        products: [
          {
            title: 'a new product',
            completed: false,
            id: '1'
          }
        ],
        newProduct: ''
      })
  })

  it('changes the ui', () => {
    getStore().then(store => {
      store.dispatch('setNewProduct', 'a new product')
      store.dispatch('addProduct')
      store.dispatch('clearNewProduct')
    })

    // assert UI
    getProductItems()
      .should('have.length', 1)
      .first()
      .contains('a new product')
  })

  it('calls server', () => {
    cy.server()
    cy
      .route({
        method: 'POST',
        url: '/products'
      })
      .as('postProduct')

    getStore().then(store => {
      store.dispatch('setNewProduct', 'a new product')
      store.dispatch('addProduct')
      store.dispatch('clearNewProduct')
    })

    // assert server call
    cy
      .wait('@postProduct')
      .its('request.body')
      .should('deep.equal', {
        title: 'a new product',
        completed: false,
        id: '1'
      })
  })

  it('calls server with delay', () => {
    cy.server()
    cy
      .route({
        method: 'POST',
        url: '/products',
        delay: 3000,
        response: {}
      })
      .as('postProduct')

    getStore().then(store => {
      store.dispatch('setNewProduct', 'a new product')
      store.dispatch('addProduct')
      store.dispatch('clearNewProduct')
    })

    // assert server call - will wait 3 seconds until stubbed server responds
    cy
      .wait('@postProduct')
      .its('request.body')
      .should('deep.equal', {
        title: 'a new product',
        completed: false,
        id: '1'
      })
  })
})
