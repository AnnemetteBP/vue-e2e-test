/* global Vue, Vuex, axios, FileReader */
;(function () {
  Vue.use(Vuex)

  function randomId () {
    return Math.random()
      .toString()
      .substr(2, 10)
  }

  const store = new Vuex.Store({
    strict: true,
    state: {
      loading: true,
      products: [],
      newProduct: ''
    },
    getters: {
      newProduct: state => state.newProduct,
      products: state => state.products
    },
    mutations: {
      SET_LOADING (state, flag) {
        state.loading = flag
      },
      SET_PRODUCTS (state, products) {
        state.products = products
      },
      SET_NEW_PRODUCT (state, product) {
        state.newProduct = product
      },
      ADD_PRODUCT (state, productObject) {
        console.log('add product', productObject)
        state.products.push(productObject)
      },
      REMOVE_PRODUCT (state, product) {
        var products = state.products
        products.splice(products.indexOf(product), 1)
      },
      CLEAR_NEW_PRODUCT (state) {
        state.newProduct = ''
        console.log('clearing new product')
      },
      CHANGE_PRODUCT_COMPLETED (state, { product, checked }) {
        var products = state.products
        products.splice(
          products.indexOf(product),
          1,
          Object.assign({}, product, { completed: checked })
        )
      }
    },
    actions: {
      loadProducts ({ commit }) {
        commit('SET_LOADING', true)
        axios
          .get('/products')
          .then(r => r.data)
          .then(products => {
            commit('SET_PRODUCTS', products)
            commit('SET_LOADING', false)
          })
      },
      setNewProduct ({ commit }, product) {
        commit('SET_NEW_PRODUCT', product)
      },
      addProduct ({ commit, state }) {
        if (!state.newProduct) {
          // do not add empty products
          return
        }
        const product = {
          title: state.newProduct,
          completed: false,
          id: randomId()
        }
        axios.post('/products', product).then(_ => {
          commit('ADD_PRODUCT', product)
        })
      },
      removeProduct ({ commit }, product) {
        axios.delete(`/products/${product.id}`).then(_ => {
          console.log('removed product', product.id, 'from the server')
          commit('REMOVE_PRODUCT', product)
        })
      },
      clearNewProduct ({ commit }) {
        commit('CLEAR_NEW_PRODUCT')
      },
      changeProductCompleted ({ commit }, { product, checked }) {
        axios.patch('/products/' + product.id, { completed: checked }).then(_ => {
          commit('CHANGE_PRODUCT_COMPLETED', { product, checked })
        })
      }
    }
  })

  // app Vue instance
  const app = new Vue({
    store,
    data: {
      file: null
    },
    el: '.shoppingbag',

    created () {
      this.$store.dispatch('loadProducts')
    },

    // computed properties
    // https://vuejs.org/guide/computed.html
    computed: {
      newProduct () {
        return this.$store.getters.newProduct
      },
      products () {
        return this.$store.getters.products
      }
    },

    // methods that implement data logic.
    // note there's no DOM manipulation here at all.
    methods: {
      setNewProduct (e) {
        this.$store.dispatch('setNewProduct', e.target.value)
        this.addProduct(e)
      },

      addProduct (e) {
        e.target.value = ''
        this.$store.dispatch('addProduct')
        this.$store.dispatch('clearNewProduct')
      },

      removeProduct (product) {
        this.$store.dispatch('removeProduct', product)
      },

      changeProductCompleted (product, e) {
        this.$store.dispatch('changeProductCompleted', {
          product: product,
          checked: e.target.checked
        })
      },

      uploadProducts (e) {
        // either set component data.file to test file
        // or read it off the native event
        const f = this.file || e.target.files[0]
        const reader = new FileReader()
        reader.onload = e => {
          const list = JSON.parse(e.target.result)
          list.forEach(product => {
            this.$store.commit('ADD_PRODUCT', product)
          })
        }
        reader.readAsText(f)
      }
    }
  })

  window.app = app
})()
