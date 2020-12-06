var baseBet = currency.minAmount;
var basePayout = 500;
var counter = 0;
var maxCount = 250;
var longestCount = 0;

var config = {}

function main() {
    var bet = baseBet;
    var payout = basePayout;
    engine.on(String.fromCharCode(71, 65, 77, 69, 95, 83, 84, 65, 82, 84, 73, 78, 71), function () {
        engine.bet(bet, payout);
    })

    engine.on(String.fromCharCode(71, 65, 77, 69, 95, 69, 78, 68, 69, 68), function () {
        var history = engine.getHistory();
        var lastGame = history[0];

        log.info(String.fromCharCode(67, 111, 117, 110, 116, 101, 114, 58, 32) + counter); // Counter:
        counter++;

        if (Math.max(counter, longestCount) === counter){
            longestCount = counter;
            // log.success(String.fromCharCode(76, 111, 110, 103, 101, 116, 115, 32, 67, 111, 117, 110, 116, 101, 114, 58, 32) + longestCount); // Longest counter:
        }

        if (Math.max(counter, maxCount) === counter) {
            bet = 2 * bet;
            counter = 0;
        }

        // If we wagered, it means we played
        if (!lastGame.wager) {
            return;
        }

        // we won..
        if (lastGame.cashedAt) {
            bet = baseBet;
            counter = 0;
            log.success(String.fromCharCode(87, 101, 32, 119, 111, 110, 32, 33, 33, 33, 32)); // We won !!!
        }
    })
}
