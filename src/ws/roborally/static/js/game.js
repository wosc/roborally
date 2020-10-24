const GameController = {
    data: {
        'damage': 0,
        'draw': [],
        'turn': [null, null, null, null, null],
        'seed': ''
    },

    init: function() {
        const query = new URLSearchParams(window.location.search);
        this.data.seed = query.get('seed');
    },

    update_damage: function(delta) {
        this.data.damage += delta;
        if (this.data.damage < 0) {
            this.data.damage = 0;
        }
    },

    draw: function() {
        var self = this;
        if (self.data.draw.length) {
            self.data.draw = [];
        } else {
            const count = 9 - this.data.damage;
            window.fetch('./api/game/' + self.data.seed + '?count=' + count, {
                method: 'POST'
            }).then(function(response) {
                return response.json();
            }).then(function(data) {
                self.data.draw = data['cards'];
                self.data.turn = [null, null, null, null, null];
            }).catch(function(error) {
                throw error;
            });
        }
    }

};
const CONTROLLER = GameController;
CONTROLLER.init();


const DamageView = new Vue({
       el: '#damage',
       template: '#template-damage',
       data: {
           'context': CONTROLLER.data
       },
       methods: {
           decr: function(event) {
               CONTROLLER.update_damage(-1);
           },
           incr: function(event) {
               CONTROLLER.update_damage(1);
           }
       }
});


const DrawButton = new Vue({
    el: '#drawbutton',
    template: '#template-drawbutton',
    data: {
        'context': CONTROLLER.data,
    },
    computed: {
        'title': function() {
            return this.context.draw.length ? 'fertig' : 'ziehen';
        }
    },
    methods: {
        draw: function(event) {
            CONTROLLER.draw();
        }
    }
});


const CardPool = new Vue({
    el: '#cardpool',
    template: '#template-cardpool',
    data: {
        'context': CONTROLLER.data,
    }
});
