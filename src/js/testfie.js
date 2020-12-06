//======================== crash Martingale ====================
var config = {
    baseBet: { label: 'base bet', value: currency.minAmount, type: 'number' },
    payout: { label: 'payout', value: 1.1, type: 'number' },
}

function main () {
    //var currentBet = Math.round(currency.amount / 100);
    var currentBet = config.baseBet.value;
    engine.on('GAME_STARTING', function () {
        engine.bet(currentBet, config.payout.value);
    })

    engine.on('GAME_ENDED', function () {
        var history = engine.getHistory()
        var lastGame = history[0]
        // If we wagered, it means we played
        if (!lastGame.wager) {
            return;
        }

        // we won..
        if (lastGame.cashedAt) {
            // currentBet = Math.round(currency.amount / 100);
            currentBet = config.baseBet.value;
            log.success('We won, so next bet will be ' + currentBet + ' ' + currency.currencyName);
        } else {
            currentBet *= 10;
            log.error('We lost, so next bet will be ' + currentBet + ' ' + currency.currencyName);
        }

        // if (currentBet > config.stop.value) {
        //     log.error('Was about to bet' + currentBet + 'which triggers the stop');
        //     engine.stop();
        // }
    })
}
