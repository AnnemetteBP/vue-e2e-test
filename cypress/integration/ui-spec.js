/* eslint-env mocha */
/* global cy */
import {
  resetDatabase,
  visit,
  getProductApp,
  enterProduct,
  getProductItems,
  getProductItem
} from './utils'

it('loads the app', () => {
  visit()
  getProductApp().should('be.visible')
})

describe('UI', () => {
  beforeEach(resetDatabase)
  beforeEach(visit)

  context('basic features', () => {
    it('loads application', () => {
      getProductApp().should('be.visible')
    })

    it('starts with zero items', () => {
      cy
        .get('.product-list')
        .find('li')
        .should('have.length', 0)
    })

    it('adds two items', () => {
      enterProduct('add-product-1')
      enterProduct('add-product-2')
      getProductItems().should('have.length', 2)
    })

    it('completes and item', () => {
      enterProduct('add-product-1')
      enterProduct('add-product-2')
      getProductItem(1).should('not.have.class', 'completed')
      getProductItem(2).should('not.have.class', 'completed')
      getProductItem(2).find('.toggle').check()
      getProductItem(2).should('have.class', 'completed')
      // reload the data - 2nd item should still be completed
      cy.reload()
      getProductItem(1).should('not.have.class', 'completed')
      getProductItem(2).should('have.class', 'completed')
    })
  })
})
