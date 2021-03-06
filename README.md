# ![cypress version](https://img.shields.io/badge/cypress-9.6.1-brightgreen)

Simple ProductMVC with [Vue.js](https://vuejs.org/)
and [Vuex](https://vuex.vuejs.org/en/) data store.


## Use

Clone this repository then

```
npm install
npm start
npx cypress open
```

Open `localhost:3000` in the browser.

## Tests

All tests are implemented using [Cypress.io](https://www.cypress.io/)

- [GUI E2E tests](cypress/integration/ui-spec.js)
- [API tests](cypress/integration/api-spec.js)

### cy-spok example

See the spec [new-item-spec.js](./cypress/integration/new-item-spec.js) that shows how to use [cy-spok](https://github.com/bahmutov/cy-spok) plugin to confirm the request object. Watch the introduction to cy-spok plugin video [here](https://youtu.be/MLDsqBd_gVU).

## Development

The `app` global variable exposes the Vue instance.

To see "plain" values from the store (without all `Observer` additions)

```js
app.$store.getters.products
    .map(JSON.stringify) // strips utility fields
    .map(JSON.parse)     // back to plain objects
    .forEach(t => console.log(t)) // prints each object
```

Or print them as a table

```js
console.table(app.$store.getters.products.map(JSON.stringify).map(JSON.parse))
```
