/// <reference types="cypress" />
import { resetDatabase } from './utils'

it('opens the page', () => {
  resetDatabase()
  cy.visit('http://localhost:3000')
  cy.get('.add-product-1').should('be.visible')
})

it('adds 2 products', () => {
  resetDatabase()
  cy.visit('http://localhost:3000')
  cy.get('.add-product-1')
    .click()
  cy.get('.add-product-2')
    .click()
  cy.get('.product-list li')
    .should('have.length', 2)
})

describe('products', () => {
  beforeEach(() => {
    resetDatabase()
    cy.visit('http://localhost:3000')
  })

  it('has 2 products', () => {
    cy.get('.add-product-1')
      .click()
    cy.get('.add-product-2')
      .click()
    cy.get('.product-list li').should('have.length', 2)
  })
})

it('mocks products', () => {
  cy.server()
  cy.route('http://localhost:3000/products', [{
    completed: true,
    id: '111',
    title: 'stub server'
  }])
  cy.visit('http://localhost:3000')
  cy.get('.product-list li.completed')
    .should('have.length', 1)
})

it('mocks products using fixture', () => {
  cy.server()
  cy.route('http://localhost:3000/products', 'fx:products')
  cy.visit('http://localhost:3000')
  cy.get('.product-list li.completed')
    .should('have.length', 1)
})
