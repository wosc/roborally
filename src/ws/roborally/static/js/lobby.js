const LobbyController = {
    data: {
        'games': []
    },
    init: function() {
        var self = this;
        window.fetch('./api/game/list', {
            method: 'GET',
            headers: {'Content-Type': 'application/json'}
        }).then(function(response) {
            return response.json();
        }).then(function(data) {
            for (var key in data) {
                self.data[key] = data[key];
            }
        }).catch(function(error) {
            throw error;
        });
    }
};
const CONTROLLER = LobbyController;
CONTROLLER.init();


const JoinGameView = new Vue({
    el: '#games',
    template: '#template-games',
    data: {
        'context': CONTROLLER.data,
    },
    filters: {
        format_date: function(value) {
            return new Date(value).toLocaleString('de');
        }
    }
});
