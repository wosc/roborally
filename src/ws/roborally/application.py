from tornado.ioloop import IOLoop
from ws.roborally.game import Game
import logging
import signal
import sys
import tornado.web
import tornado.websocket


log = logging.getLogger(__name__)


def make_app():
    return tornado.web.Application([
        (r'^/game/list$', GameList),
        (r'^/game/(?P<seed>.*)$', DrawCard),
    ])


def main():
    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s %(levelname)-5.5s [%(name)s] %(message)s')
    logging.getLogger('tornado.access').setLevel(logging.FATAL)
    logging.getLogger('ws').setLevel(logging.DEBUG)

    app = make_app()
    if len(sys.argv) > 1:
        port = int(sys.argv[1])
    else:
        port = 8080
    app.listen(port)
    log.info('Tornado listening on localhost:%s' % port)

    signal.signal(signal.SIGTERM, shutdown)
    try:
        IOLoop.current().start()
    except KeyboardInterrupt:
        shutdown()


def shutdown(*args):
    log.info('Tornado shutting down')
    IOLoop.current().stop()
    sys.exit(0)


class GameList(tornado.web.RequestHandler):

    async def get(self):
        self.write({
            'games': [
                {'seed': x.seed, 'created': x.created.isoformat()}
                for x in sorted(Game.games.values(), key=lambda x: x.created)],
        })

    async def post(self):
        game = Game()
        self.redirect('../../game?seed=%s' % game.seed)


class DrawCard(tornado.web.RequestHandler):

    async def post(self, seed):
        count = int(self.get_argument('count'))
        self.write({'cards': list(Game.games[seed].draw(count))})
