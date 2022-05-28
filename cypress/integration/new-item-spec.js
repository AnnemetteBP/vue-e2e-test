/// <reference types="cypress" />
import {
  resetDatabase,
} from './utils'

// https://github.com/bahmutov/cy-spok
import spok from 'cy-spok'

describe('Product API', () => {
  beforeEach(resetDatabase)

  it('adds a product', () => {
    cy.intercept('GET', '/products').as('loadProducts')
    cy.visit('/')
    cy.wait('@loadProducts')

    // spy on the POST request that adds a new TODO item
    cy.intercept('POST', '/products').as('addProduct')
    cy.get('.add-product-1').click()
    cy.wait('@addProduct').its('request.body')
      .should(spok({
        title: spok.startsWith('Coffee with chocolate'),
        completed: false,
        id: spok.string,
      }))
  })
})
