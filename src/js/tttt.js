let list = [1, 2, 3, 4, 5, 6, 7, 8, 9];
let bet = 0;
let listWin = null;

var config = {
    baseBet: {label: 'base bet', value: currency.minAmount, type: 'number'},
    payout: { label: 'payout', value: 2.0, type: 'number' },
}

function main() {
    engine.on('GAME_STARTING', function () {

        let wager = 0;
        if (list.length === 0) {
            list = [1, 2, 3, 4, 5, 6, 7, 8, 9];
        }

        if (list.length === 1) {
            wager = list[0];
            listWin = [];
        } else {
            wager = list[0] + list[list.length - 1];
            listWin = list.slice(1, -1);
        }
        bet = wager * config.baseBet.value;
        engine.bet(bet, config.payout.value);
        log.info("List: " + list + " >>> Wager: " + bet)
    });

    engine.on('GAME_ENDED', function () {
        var history = engine.getHistory();
        var lastGame = history[0];
        // If we wagered, it means we played
        if (!lastGame.wager) {
            return;
        }

        // we won..
        if (lastGame.cashedAt) {
            list = listWin;
            log.success('We won on ' + bet);
        } else {
            list.push(bet);
            log.error('We lost on ' + bet);
        }
    });
}
