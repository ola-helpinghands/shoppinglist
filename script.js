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
    clean: {},
    totalPerClient: 0,
    shoppinglist: {
      shopper: '',
      client: '',
      clientCount: 1,
      categories: {}
    }
  },
  firebase: {
    clients: db.ref('clients'),
    volunteers: db.ref('volunteers'),
    categories: db.ref('categories'),
    shoppinglists: db.ref('finishedShoppinglists')
  },
  created: function() {
    this.$firebaseRefs.categories.on('child_added', data => {
      this.clean[data.key] = [];
      Vue.set(this.shoppinglist.categories, data.key, []);
      this.totalPerClient += parseInt(data.val()['limitPerPerson']);
    });

    this.$firebaseRefs.categories.on('child_removed', data => {
      Vue.delete(this.clean, data.key);
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
      return this.shoppinglist.clientCount * this.totalPerClient;
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
    },
    valid: function() {
      if (!this.shoppinglist.client) return false;
      if (!this.shoppinglist.shopper) return false;
      if (this.addedItemCount == 0) return false;
      return true;
    }
  },
  methods: {
    submitShoppinglist: function() {
      if (!this.valid) return;
      if (
        this.percentDone !== 100 &&
        !confirm(
          `Are you sure you are finished shopping? You are ${
            this.percentDone
          }% done.`
        )
      )
        return;

      this.$firebaseRefs.shoppinglists
        .child(new Date().toString())
        .set(this.shoppinglist);
      this.shoppinglist = {
        shopper: '',
        client: '',
        clientCount: 1,
        categories: JSON.parse(JSON.stringify(this.clean))
      };
    }
  }
});
