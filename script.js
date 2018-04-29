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
    totalPerClient: 0,
    newCategory: {
      name: '',
      limitPerPerson: 1
    },
    shoppinglist: {
      shopper: '',
      client: '',
      clients: 1,
      categories: {}
    }
  },
  firebase: {
    clients: db.ref('clients'),
    volunteers: db.ref('volunteers'),
    categories: db.ref('categories')
  },
  created: function() {
    this.$firebaseRefs.categories.on('child_added', data => {
      Vue.set(this.shoppinglist.categories, data.key, []);
      this.totalPerClient += parseInt(data.val()['limitPerPerson']);
    });

    this.$firebaseRefs.categories.on('child_removed', data => {
      Vue.delete(this.shoppinglist.categories, data.key);
      this.totalPerClient -= data.val()['limitPerPerson'];
    });
  },
  computed: {
    addedItemCount: function() {
      const l = this.shoppinglist.categories;
      return Object.keys(l).reduce(
        (total, c) => total + l[c].filter(String).length,
        0
      );
    },
    totalItemCount: function() {
      return this.shoppinglist.clients * this.totalPerClient;
    },
    percentDone: function() {
      //return 50;
      let val = Math.floor(this.addedItemCount / this.totalItemCount * 100);
      if (isNaN(val)) val = 0;
      console.log(typeof val);
      console.log(val);

      return val;
    },
    percentBarStyle: function() {
      return {
        'is-danger': this.percentDone <= 20,
        'is-success': this.percentDone == 100
      };
    }
  },
  methods: {
    addCategory: function() {
      const key = this.newCategory.name.split(' ')[0].toLowerCase();
      this.$firebaseRefs.categories.child(key).set(this.newCategory);
    }
  }
});
