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
            if (self.data.turn.includes(null)) {
                alert('Zuerst alle 5 Programm-Slots bestücken.');
                return;
            }
            self.data.draw = [];
        } else {
            const count = 9 - this.data.damage;
            window.fetch('./api/game/' + self.data.seed + '?count=' + count, {
                method: 'POST'
            }).then(function(response) {
                return response.json();
            }).then(function(data) {
                self.data.draw = data['cards'];
                for (let i = 0; i < 5; i++) {
                    if (i < 5 + 4 - self.data.damage) {
                        self.data.turn.splice(i, 1, null);
                    }
                }
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


const Turn = new Vue({
    el: '#turn',
    template: '#template-turn',
    data: {
        'context': CONTROLLER.data,
    },
    computed: {
        'locked': function() {
            if (this.context.damage < 4) {
                return -1;
            }
            // slots=5 + locking offset=4
            return 5 + 4 - this.context.damage;
        }
    },
    methods: {
        add: function(event) {
            if (this.locked >= 0 && event.newIndex >= this.locked) {
                // Unfortunately, this.move() does not trigger, so we have to
                // "cancel" the drop ourselves.
                const dropped = this.context.turn.splice(event.newIndex, 1)[0];
                this.context.draw.push(dropped);
            } else {
              let curpos = event.newIndex + 1;
              if (curpos == this.context.turn.length) {
                  curpos -= 2;
              }
              const current = this.context.turn.splice(curpos, 1)[0];
              if (current) {
                  this.context.draw.push(current);
              }
            }
        },
        remove: function(event) {
            if (this.context.turn.length < 5) {
                this.context.turn.splice(event.oldIndex, 0, null);
            }
        },
        move: function(event) {
            if (this.locked < 0) {
                return true;
            }
            const source = event.draggedContext.index;
            const target = event.draggedContext.futureIndex;
            // return false to cancel drop
            return source < this.locked && target < this.locked;
        }
    }
});
