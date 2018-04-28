const fbConfig = {
  apiKey: 'AIzaSyACX2BpcngfwGdGtAJDVnvv021DB4qcsmQ',
  authDomain: 'ola-helpinghands.firebaseapp.com',
  databaseURL: 'https://ola-helpinghands.firebaseio.com',
  projectId: 'ola-helpinghands',
  storageBucket: 'ola-helpinghands.appspot.com',
  messagingSenderId: '528797890412'
};

const firebaseApp = firebase.initializeApp(fbConfig);
const db = firebaseApp.database();

const vm = new Vue({
  el: '#app',
  data: {
    newCategory: {
      name: '',
      limitPerPerson: 1
    },
    shoppinglist: {
      clients: 1,
      categories: {}
    }
  },
  firebase: {
    // simple syntax, bind as an array by default
    categories: db.ref('categories')
  },
  methods: {
    addCategory: function() {
      const key = this.newCategory.name.split(' ')[0].toLowerCase();
      this.$firebaseRefs.categories.child(key).set(this.newCategory);
    }
  }
});
