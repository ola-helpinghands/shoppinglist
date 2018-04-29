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
    currentClients: {},
    currentVolunteers: {},
    shoppinglist: {
      shopper: '',
      client: '',
      clientCount: 1,
      items: {}
    }
  },
  firebase: {
    current: db.ref('current'),
    categories: db.ref('categories'),
    shoppinglists: db.ref('finishedShoppinglists')
  },
  created: function() {
    this.$firebaseRefs.categories.on('child_added', data => {
      this.clean[data.key] = [];
      Vue.set(this.shoppinglist.items, data.key, []);
      this.totalPerClient += parseInt(data.val()['limitPerPerson']);
    });

    this.$firebaseRefs.categories.on('child_removed', data => {
      Vue.delete(this.clean, data.key);
      Vue.delete(this.shoppinglist.items, data.key);
      this.totalPerClient -= data.val()['limitPerPerson'];
    });

    this.$firebaseRefs.current.child('clients').on('child_added', data => {
      const key = data.val();
      db.ref('clients/contact/' + key).on('value', data => {
        Vue.set(this.currentClients, key, data.val());
      });
    });

    this.$firebaseRefs.current.child('clients').on('child_removed', data => {
      const key = data.val();
      Vue.delete(this.currentClients, key);
    });

    // VOLUNTEERS
    this.$firebaseRefs.current.child('volunteers').on('child_added', data => {
      const key = data.val();
      db.ref('volunteers/' + key).on('value', data => {
        Vue.set(this.currentVolunteers, key, data.val());
      });
    });

    this.$firebaseRefs.current.child('volunteers').on('child_removed', data => {
      const key = data.val();
      Vue.delete(this.currentVolunteers, key);
    });
  },
  computed: {
    addedItemCount: function() {
      const l = this.shoppinglist.items;
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
        items: JSON.parse(JSON.stringify(this.clean))
      };
    }
  }
});
