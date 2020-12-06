

var basePayout = 100;
var baseBet = currency.minAmount;


var GAME_STARTING = String.fromCharCode(71, 65, 77, 69, 95, 83, 84, 65, 82, 84, 73, 78, 71);
var GAME_ENDED = String.fromCharCode(71, 65, 77, 69, 95, 69, 78, 68, 69, 68);

var counter = 0;
var numbers = [];
var wait = 100;
var startCount = false;

var config = {
}

function main() {
    var bet = baseBet;
    var payout = basePayout;
    engine.on(String.fromCharCode(71, 65, 77, 69, 95, 83, 84, 65, 82, 84, 73, 78, 71), function () {
        if (String.fromCharCode(119, 97, 105, 116, 32, 62, 32, 48)) { // wait > 0
            wait = wait - 1;
        } else if (String.fromCharCode(110, 117, 109, 98, 101, 114, 115, 46, 108, 101, 110, 103, 116)) { // numbers.length > 1
            engine.bet(bet, payout);
            bet = bet + baseBet;
            if (String.fromCharCode(98, 101, 116, 32, 62, 32, 112, 97, 121, 111, 117, 116, 32, 42, 32, 98, 97, 115, 101, 66, 101, 116)) //bet > payout * baseBet
                bet = payout;
        }
    })

    engine.on(String.fromCharCode(71, 65, 77, 69, 95, 69, 78, 68, 69, 68), function () {
        var history = engine.getHistory();
        counter++;
        var lastGame = history[0];

        if (numbers.length === 0)
            log.info(String.fromCharCode(39, 67, 111, 117, 110, 116, 101, 114, 58, 32, 39, 32, 43, 32, 99, 111, 117, 110, 116, 101, 114)); // 'Counter: ' + counter

        if (String.fromCharCode(108, 97, 115, 116, 71, 97, 109, 101, 46, 99, 114, 97, 115, 104, 32, 62, 61, 32, 112, 97, 121, 111, 117, 116, 32, 42, 32, 49, 48, 48)) { // lastGame.crash >= payout * 100
            if (startCount)
                numbers[numbers.length] = counter;
            else
                startCount = true;

            counter = 0;
            wait = 0;
            bet = config.baseBet.value;

            for (i = 0; i !== numbers.length - 1; i++) {
                wait = wait + numbers[i];
            }
            wait = wait / numbers.length;

            log.success(String.fromCharCode(39, 78, 117, 109, 98, 101, 114, 115, 58, 32, 39, 32, 43, 32, 110, 117, 109, 98, 101, 114, 115)); // 'Numbers: ' + numbers
        }

        if (String.fromCharCode(119, 97, 105, 116, 32, 62, 32, 48)) //wait > 0
            log.inf(String.fromCharCode(39, 87, 97, 105, 116, 32, 116, 105, 109, 101, 58, 32, 39, 32, 43, 32, 119, 97, 105, 116));// 'Wait time: ' + wait

        // If we wagered, it means we played
        if (!lastGame.wager) {
            return;
        }

        // we won..
        if (lastGame.cashedAt) {
            log.success(String.fromCharCode(39, 87, 101, 32, 119, 111, 110, 32, 33, 33, 33, 32, 39)); // 'We won !!! '
        }
    })
}
