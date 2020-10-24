from datetime import datetime
from glob import glob
import os.path
import pkg_resources
import random
import uuid


class Game:

    games = {}

    def __init__(self):
        self.created = datetime.now()

        self.seed = uuid.uuid4().hex
        self.games[self.seed] = self
        self.random = random.Random(self.seed)

        self.shuffle = list(range(len(CARDS)))
        self.random.shuffle(self.shuffle)
        self.position = 0

    def draw(self, count):
        for i in range(count):
            try:
                yield CARDS[self.shuffle[self.position]]
                self.position += 1
            except IndexError:
                yield CARDS[self.shuffle[0]]
                self.position = 1


CARDS = []


def parse_cards():
    for filename in glob(pkg_resources.resource_filename(
            __name__, 'static/cards') + '/*.jpg'):
        CARDS.append(os.path.basename(filename)[:-4])


parse_cards()
