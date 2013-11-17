
/*
 Should synced to client
 */
module.exports = {
    CARD_STATE : {
        hidden: -1,
        open : 0,
        closed: 1
    },
    GAME_TYPES : {
        SINGLE : 0,
        MULTIPLAYER : 1
    },
    GAMESTATE : {
        boardNotready : -2,
        waitForOpponent : -1,
        play : 0,
        won : 1,
        lost : 2,
        draw : 3
    },
    GAME_VARIANTS : {
        normal : 0,
        moreAndMore : 1,
        multiplayer : 2
    }
};
