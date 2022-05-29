/* eslint-env mocha */
/* global cy */
import {
  resetDatabase,
  visit,
  makeProduct,
  enterProduct,
  getProductItems,
  stubMathRandom
} from './utils'

// testing ProductMVC server API
describe('via API', () => {
  beforeEach(resetDatabase)

  // used to create predictable ids
  let counter = 1
  beforeEach(() => {
    counter = 1
  })

  const addProduct = title =>
    cy.request('POST', '/products', {
      title,
      completed: false,
      id: String(counter++)
    })

  const fetchProducts = () => cy.request('/products').its('body')

  const deleteProduct = id => cy.request('DELETE', `/products/${id}`)

  it('adds product', () => {
    addProduct('Coffee with chocolate')
    addProduct('Coffee with milk')
    fetchProducts().should('have.length', 2)
  })

  it('adds product deep', () => {
    addProduct('Coffee with chocolate')
    addProduct('Coffee with milk')
    fetchProducts().should('deep.equal', [
      {
        title: 'Coffee with chocolate',
        completed: false,
        id: '1'
      },
      {
        title: 'Coffee with milk',
        completed: false,
        id: '2'
      }
    ])
  })

  it('adds and deletes a product', () => {
    addProduct('Coffee with chocolate') // id "1"
    addProduct('Coffee with milk') // id "2"
    deleteProduct('2')
    fetchProducts().should('deep.equal', [
      {
        title: 'Coffee with chocolate',
        completed: false,
        id: '1'
      }
    ])
  })
})

it('initial products', () => {
  cy.server()
  cy.route('/products', [
    {
      title: 'mock first',
      completed: false,
      id: '1'
    },
    {
      title: 'mock second',
      completed: true,
      id: '2'
    }
  ])

  visit()
  getProductItems()
    .should('have.length', 2)
    .contains('li', 'mock second')
    .find('.toggle')
    .should('be.checked')
})

describe('API', () => {
  beforeEach(resetDatabase)
  beforeEach(visit)
  beforeEach(stubMathRandom)

  it('receives empty list of items', () => {
    cy
      .request('products')
      .its('body')
      .should('deep.equal', [])
  })

  it('adds two items', () => {
    const first = makeProduct()
    const second = makeProduct()

    cy.request('POST', 'products', first)
    cy.request('POST', 'products', second)
    cy
      .request('products')
      .its('body')
      .should('have.length', 2)
      .and('deep.equal', [first, second])
  })

  it('adds two items and deletes one', () => {
    const first = makeProduct()
    const second = makeProduct()
    cy.request('POST', 'products', first)
    cy.request('POST', 'products', second)
    cy.request('DELETE', `products/${first.id}`)
    cy
      .request('products')
      .its('body')
      .should('have.length', 1)
      .and('deep.equal', [second])
  })

  it('does not delete non-existent item', () => {
    cy
      .request({
        method: 'DELETE',
        url: 'products/aaa111bbb',
        failOnStatusCode: false
      })
      .its('status')
      .should('equal', 404)
  })

  it('is adding product item', () => {
    cy.server()
    cy
      .route({
        method: 'POST',
        url: '/products'
      })
      .as('postProduct')

    // go through the UI
    enterProduct('add-product-1') // id "1"

    // thanks to stubbed random id generator
    // we can "predict" what the PRODUCT object is going to look like
    cy
      .wait('@postProduct')
      .its('request.body')
      .should('deep.equal', {
        title: 'Coffee with chocolate',
        completed: false,
        id: '1'
      })
  })

  it('is deleting a product item', () => {
    cy.server()
    cy
      .route({
        method: 'DELETE',
        url: '/products/1'
      })
      .as('deleteProduct')

    // go through the UI
    enterProduct('add-product-1') // id "1"
    getProductItems()
      .first()
      .find('.destroy')
      .click({ force: true })

    cy.wait('@deleteProduct')
  })
})
