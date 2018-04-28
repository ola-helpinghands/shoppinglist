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
    categories: db.ref('categories')
  },
  created: function() {
    this.$firebaseRefs.categories.on('child_added', data => {
      this.shoppinglist.categories[data.key] = [];
    });

    this.$firebaseRefs.categories.on('child_removed', data => {
      delete this.shoppinglist.categories[data.key];
    });
  },
  methods: {
    addCategory: function() {
      const key = this.newCategory.name.split(' ')[0].toLowerCase();
      this.$firebaseRefs.categories.child(key).set(this.newCategory);
    }
  }
});
