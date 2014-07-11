/// <reference path='../libs/jquery.d.ts'/>
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Cards;
(function (Cards) {
    var SummableArray = (function () {
        function SummableArray() {
            this.members = new Array();
        }
        SummableArray.prototype.push = function (value) {
            this.members.push(value);
        };

        SummableArray.prototype.pop = function () {
            return this.members.pop();
        };

        SummableArray.prototype.sum = function () {
            return this.members.reduce(function (i, j) {
                return i + j;
            }, 0);
        };

        SummableArray.prototype.count = function () {
            return this.members.length;
        };

        SummableArray.prototype.top = function () {
            return this.members[this.members.length - 1];
        };
        return SummableArray;
    })();

    var Hand = (function () {
        function Hand() {
            this.hasAce = false;
            this.values = new SummableArray();
            this.cards = new Array();
        }
        Hand.prototype.push = function (card) {
            if (card.value === 1) {
                this.hasAce = true;
            }
            this.values.push(card.value > 10 ? 10 : card.value);
            this.cards.push(card);
        };

        Hand.prototype.sum = function () {
            var nonAce = this.values.sum();
            return nonAce + (this.hasAce && nonAce <= 11 ? 10 : 0);
        };

        Hand.prototype.lastCard = function () {
            return this.cards[this.cards.length - 1];
        };
        return Hand;
    })();
    Cards.Hand = Hand;

    var AbstractCardCollection = (function () {
        function AbstractCardCollection() {
            this.types = ['clubs', 'diamonds', 'hearts', 'spades'];
        }
        AbstractCardCollection.prototype.getCardAtIndex = function (index) {
            throw new Error("This method is abstract.");
        };

        AbstractCardCollection.prototype.getCardWithValue = function (value) {
            throw new Error("This method is abstract.");
        };

        AbstractCardCollection.prototype.clampAtTen = function (value) {
            return value > 10 ? 10 : value;
        };
        return AbstractCardCollection;
    })();
    Cards.AbstractCardCollection = AbstractCardCollection;

    var RealisticCardCollection = (function (_super) {
        __extends(RealisticCardCollection, _super);
        function RealisticCardCollection() {
            _super.call(this);
            this.cards = [];
            this.currentIndex = -1;

            for (var i = 0; i < this.types.length; i++) {
                for (var j = 1; j <= 13; j++) {
                    var value = this.clampAtTen(j);
                    this.cards.push({
                        card: j,
                        value: value,
                        type: this.types[i]
                    });
                }
                ;
            }

            this.shuffle();
        }
        RealisticCardCollection.prototype.shuffle = function () {
            for (var j, x, i = this.cards.length; i; j = Math.floor(Math.random() * i)) {
                x = this.cards[--i];
                this.cards[i] = this.cards[j];
                this.cards[j] = x;
            }
        };

        RealisticCardCollection.prototype.getCardAtIndex = function (index) {
            return this.cards[index];
        };

        RealisticCardCollection.prototype.getCardWithValue = function (value) {
            for (var i = 0; i < this.cards.length; i++) {
                if (this.cards[i].value === value) {
                    var ret = this.cards[i];

                    // this.cards = this.cards.splice(i, 1);
                    return ret;
                }
            }
            throw new Error("Should never see this");
        };
        return RealisticCardCollection;
    })(AbstractCardCollection);
    Cards.RealisticCardCollection = RealisticCardCollection;

    var RandomCardCollection = (function (_super) {
        __extends(RandomCardCollection, _super);
        function RandomCardCollection() {
            _super.call(this);
            this.cardsDealt = {};
        }
        RandomCardCollection.prototype.generateRandom = function () {
            return this.generateRandomFromCard(Math.floor(Math.random() * (12)) + 1);
        };

        RandomCardCollection.prototype.generateRandomFromCard = function (card) {
            var value = this.clampAtTen(card), type = this.types[Math.floor(Math.random() * 3)];

            return {
                card: card,
                value: value,
                type: type
            };
        };

        RandomCardCollection.prototype.getCardAtIndex = function (index) {
            if (index in this.cardsDealt) {
                return this.cardsDealt[index];
            } else {
                var newCard = this.generateRandom();
                this.cardsDealt[index] = newCard;
                return newCard;
            }
        };

        RandomCardCollection.prototype.getCardWithValue = function (value) {
            return this.generateRandomFromCard(value);
        };
        return RandomCardCollection;
    })(AbstractCardCollection);
    Cards.RandomCardCollection = RandomCardCollection;

    var AbstractDeck = (function () {
        function AbstractDeck() {
            this.currentIndex = 0;
            // this.cards = cardCollection;
            // throw new Error("This method is abstract.");
        }
        AbstractDeck.prototype.getCurrent = function () {
            throw new Error("This method is abstract.");
        };

        AbstractDeck.prototype.dealNew = function () {
            throw new Error("This method is abstract.");
        };
        return AbstractDeck;
    })();
    Cards.AbstractDeck = AbstractDeck;

    var RealisticDeck = (function (_super) {
        __extends(RealisticDeck, _super);
        function RealisticDeck() {
            _super.call(this);
            this.cards = new RealisticCardCollection();
        }
        RealisticDeck.prototype.getCurrent = function () {
            return this.cards[this.currentIndex];
        };

        RealisticDeck.prototype.dealNew = function () {
            return this.cards[++this.currentIndex];
        };
        return RealisticDeck;
    })(AbstractDeck);
    Cards.RealisticDeck = RealisticDeck;

    var RandomRiggedDeck = (function (_super) {
        __extends(RandomRiggedDeck, _super);
        function RandomRiggedDeck(riggedMap) {
            _super.call(this);
            this.riggedMap = riggedMap;
            this.currentCard = null;
            this.cards = new RandomCardCollection();
        }
        RandomRiggedDeck.prototype.setRigged = function (index) {
            if (index in this.riggedMap) {
                this.currentCard = this.cards.getCardWithValue(this.riggedMap[index]);
            } else {
                this.currentCard = this.cards.getCardAtIndex(index);
            }
        };

        RandomRiggedDeck.prototype.getCurrent = function () {
            return this.currentCard;
        };

        RandomRiggedDeck.prototype.dealNew = function () {
            this.setRigged(++this.currentIndex);

            return this.currentCard;
        };
        return RandomRiggedDeck;
    })(AbstractDeck);
    Cards.RandomRiggedDeck = RandomRiggedDeck;

    var Card = (function () {
        function Card(type, value, side, id) {
            this.type = type;
            this.value = value;
            this.side = side;
            this.id = id;
            if (this.id === undefined) {
                this.id = Card.currentId++;
            }

            if (side === 'back') {
                this.container = $('<div data-id="' + this.id + '" class="card back"></div>');
            } else {
                var cardValue = this.valueToString(), cardIcon = (type == 'hearts') ? '♥' : (type == 'diamonds') ? '♦' : (type == 'spades') ? '♠' : '♣', corner = '<div><span>' + cardValue + '</span><span>' + cardIcon + '</span></div>', icons = '';

                if (value <= 10) {
                    for (var i = 1, l = value; i <= l; i++) {
                        icons += '<span>' + cardIcon + '</span>';
                    }
                } else {
                    icons = (value == 11) ? '<span>♝</span>' : (value == 12) ? '<span>♛</span>' : (value == 13) ? '<span>♚</span>' : '';
                }
                this.container = $('<div data-id="' + this.id + '" class="card value' + cardValue + ' ' + type + '">' + corner + '<div class="icons">' + icons + '</div>' + corner + '</div>');
            }
        }
        Card.prototype.valueToString = function () {
            return ((this.value == 1) ? 'A' : (this.value == 11) ? 'J' : (this.value == 12) ? 'Q' : (this.value == 13) ? 'K' : String(this.value));
        };

        Card.prototype.prettify = function () {
            return {
                "Suit": this.type,
                "Rank": this.valueToString()
            };
        };

        Card.prototype.toString = function () {
            var s = '';
            var pret = this.prettify();

            for (var prop in pret) {
                s += prop + " : " + pret[prop];
            }
            return s;
        };

        Card.prototype.setCss = function (toSet) {
            this.container.css(toSet);
        };

        Card.prototype.getFlipped = function () {
            var newSide = '';
            if (this.side === 'back') {
                newSide = 'front';
            } else if (this.side === 'front') {
                newSide = 'back';
            } else {
                throw new Error("No such card side");
            }

            return new Card(this.type, this.value, newSide, this.id);
        };

        Card.prototype.index = function () {
            return this.container.index();
        };

        Card.prototype.toJSON = function () {
            this.container = undefined;
            return this;
        };
        Card.currentId = 0;
        return Card;
    })();
    Cards.Card = Card;
})(Cards || (Cards = {}));
var G;
(function (G) {
    G.ANIM_DELAY = 300;
    G.PATTERNS = [
        [{ deg: 0, top: 0 }],
        [{ deg: 5, top: 0 }, { deg: -5, top: 0 }],
        [{ deg: 5, top: 15 }, { deg: -1, top: 0 }, { deg: -5, top: 15 }],
        [
            { deg: 9, top: 20 }, { deg: 4, top: 0 }, { deg: -4, top: 0 },
            { deg: -9, top: 15 }],
        [
            { deg: 12, top: 50 }, { deg: 8, top: 10 }, { deg: -4, top: 0 },
            { deg: -12, top: 15 }, { deg: -16, top: 40 }],
        [
            { deg: 14, top: 40 }, { deg: 8, top: 10 }, { deg: -2, top: 5 },
            { deg: -5, top: 15 }, { deg: -8, top: 40 }, { deg: -14, top: 70 }],
        [
            { deg: 14, top: 70 }, { deg: 8, top: 30 }, { deg: 4, top: 10 },
            { deg: 0, top: 5 }, { deg: -4, top: 20 }, { deg: -8, top: 40 },
            { deg: -16, top: 70 }]
    ];
})(G || (G = {}));
/// <reference path='../libs/jquery.d.ts'/>
/// <reference path='./cards.ts'/>
/// <reference path='./globals.ts'/>
var Players;
(function (Players) {
    var AbstractPlayer = (function () {
        // private cardsContainer:JQuery;
        // private totalContainer:JQuery;
        // typescript doesn't have protected variables
        function AbstractPlayer(cardsContainer, totalContainer, isSafari) {
            this.cardsContainer = cardsContainer;
            this.totalContainer = totalContainer;
            this.isSafari = isSafari;
            this.isDealer = undefined;
            this.hand = new Cards.Hand();
        }
        AbstractPlayer.prototype.getScore = function () {
            return this.hand.sum();
        };

        AbstractPlayer.prototype.displayScore = function () {
            this.totalContainer.html(String(this.getScore()));
        };

        AbstractPlayer.prototype.resetHand = function () {
            this.hand = new Cards.Hand();
            this.totalContainer.html('');
            this.cardsContainer.html('');
        };

        AbstractPlayer.prototype.updateTotal = function (newTotal) {
            this.totalContainer.html(String(newTotal));
        };

        // addCard(side, callback) {
        AbstractPlayer.prototype.addCard = function (card, callback, isDealer) {
            var _this = this;
            // var cardData  = this.cards[this.cardsIndex],
            // container = ( player == 'player' ) ? this.pCardsContainer : this.dCardsContainer,
            // card      = this.buildCard(this.cardsIndex, cardData.type, cardData.card, side),
            var zIndex;

            this.hand.push(card);

            // this.cardsIndex++;
            // this.canDoAction = false;
            card.setCss({
                'top': '-150%',
                'left': '100%'
            });

            this.cardsContainer.append(card.container);

            if (isDealer === false) {
                zIndex = card.index();
            } else if (isDealer === true) {
                zIndex = 50 - card.index();
            } else {
                throw new Error("AbstractPlayer should never get cards");
            }

            // zIndex = this.isDealer ? card.index() : 50-card.index();
            card.setCss({ 'z-index': String(zIndex) });

            setTimeout(function () {
                card.setCss({
                    'top': '0%',
                    'left': 10 * card.index() + '%'
                });
                _this.rotateCards();

                setTimeout(function () {
                    _this.centerContainer();

                    // if ( player == 'player' ) this.addToPlayerTotal(cardData.value);
                    // else                      this.addToDealerTotal(cardData.value);
                    // this.canDoAction = true;
                    if (callback != undefined)
                        callback.call();
                }, G.ANIM_DELAY + 100);
            }, 10);
        };

        AbstractPlayer.prototype.centerContainer = function () {
            var lastCard = this.cardsContainer.children('.card:last-child'), totalWidth = 0;

            if (lastCard.length == 0)
                return;

            totalWidth = lastCard.position().left + lastCard.width();

            // if ( this.html.attr('browser') == 'Safari' )
            if (this.isSafari) {
                this.cardsContainer.css('-webkit-transform', 'translate3d(' + -totalWidth / 2 + 'px,0,0)');
            } else {
                this.cardsContainer.css('margin-left', -totalWidth / 2 + 'px');
            }
        };

        AbstractPlayer.prototype.rotateCards = function (isDealer) {
            if (isDealer === undefined) {
                throw new Error("Not implemented error");
            }

            var cards = this.cardsContainer.children('.card'), numCards = cards.length - 1, increment = (isDealer) ? 1 : -1, pattern = (G.PATTERNS[numCards]) ? G.PATTERNS[numCards] : G.PATTERNS[G.PATTERNS.length - 1];

            cards.each(function (i) {
                var deg = (i < pattern.length) ? pattern[i].deg : pattern[pattern.length - 1].deg, offset = (i < pattern.length) ? pattern[i].top : pattern[pattern.length - 1].top + (20 * (i - pattern.length + 1));

                $(this).css({
                    '-webkit-transform': 'rotate(' + deg * increment + 'deg)',
                    '-khtml-transform': 'rotate(' + deg * increment + 'deg)',
                    '-moz-transform': 'rotate(' + deg * increment + 'deg)',
                    '-ms-transform': 'rotate(' + deg * increment + 'deg)',
                    'transform': 'rotate(' + deg * increment + 'deg)',
                    'top': offset * -increment + 'px'
                });
            });
        };

        AbstractPlayer.prototype.checkBlackjack = function () {
            return this.getScore() === 21;
        };

        AbstractPlayer.prototype.lastCard = function () {
            return this.hand.lastCard();
        };

        AbstractPlayer.prototype.hasBusted = function () {
            return this.getScore() > 21;
        };
        return AbstractPlayer;
    })();
    Players.AbstractPlayer = AbstractPlayer;

    var Dealer = (function (_super) {
        __extends(Dealer, _super);
        function Dealer() {
            _super.apply(this, arguments);
        }
        // isDealer:boolean = true;
        // constructor(cardsContainer:JQuery,
        // 			totalContainer:JQuery,
        // 			isSafari:boolean){
        // 	super(cardsContainer, totalContainer, isSafari);
        // 	this.isDealer = true;
        // }
        Dealer.prototype.doTurn = function () {
        };

        Dealer.prototype.addCard = function (card, callBack) {
            return _super.prototype.addCard.call(this, card, callBack, true);
        };

        Dealer.prototype.rotateCards = function () {
            _super.prototype.rotateCards.call(this, true);
        };

        Dealer.prototype.reveal = function () {
            var card = $('.back'), oldCard = this.lastCard(), newCard = oldCard.getFlipped();

            newCard.setCss({
                'left': 10 * card.index() + '%',
                'z-index': 50 - card.index()
            });

            oldCard.container.after(newCard.container).remove();
            this.displayScore();
        };

        Dealer.prototype.doneBetting = function () {
            return this.getScore() > 17;
        };
        return Dealer;
    })(AbstractPlayer);
    Players.Dealer = Dealer;

    var Player = (function (_super) {
        __extends(Player, _super);
        function Player(cardsContainer, totalContainer, isSafari, bankContainer, bankValue) {
            if (typeof bankValue === "undefined") { bankValue = 100; }
            _super.call(this, cardsContainer, totalContainer, isSafari);
            this.cardsContainer = cardsContainer;
            this.totalContainer = totalContainer;
            this.isSafari = isSafari;
            this.bankContainer = bankContainer;
            this.bankValue = bankValue;
            // isDealer = false;
            this.betSize = 10;
            this.doubled = false;
        }
        Player.prototype.changeBankroll = function (betMultiplier) {
            this.bankValue += betMultiplier * this.betSize;
            this.bankContainer.html(String(this.bankValue));
        };

        Player.prototype.addCard = function (card, callback) {
            _super.prototype.addCard.call(this, card, callback, false);
            this.displayScore();
        };

        Player.prototype.rotateCards = function () {
            _super.prototype.rotateCards.call(this, false);
        };

        Player.prototype.changeBet = function (toValue) {
            console.log("Player, changing bet to " + String(toValue));
            this.betSize = toValue;
            console.log("New bet size: " + this.betSize);
        };

        Player.prototype.win = function () {
            this.changeBankroll(this.doubled ? 4 : 2);
        };

        Player.prototype.lose = function () {
            this.changeBankroll(0);
        };

        Player.prototype.push = function () {
            this.changeBankroll(this.doubled ? 2 : 1);
        };
        return Player;
    })(AbstractPlayer);
    Players.Player = Player;
})(Players || (Players = {}));
/// <reference path='./cards.ts'/>
/// <reference path='../libs/jquery.d.ts'/>
var Context;
(function (Context) {
    (function (Action) {
        Action[Action["Hit"] = 0] = "Hit";
        Action[Action["Stand"] = 1] = "Stand";
        Action[Action["Double"] = 2] = "Double";
    })(Context.Action || (Context.Action = {}));
    var Action = Context.Action;

    var HandHistory = (function () {
        function HandHistory() {
            this.actions = new Array();
        }
        HandHistory.prototype.actionToString = function (act) {
            switch (act) {
                case 0 /* Hit */:
                    return "Hit";
                    break;

                case 1 /* Stand */:
                    return "Stand";
                    break;

                case 2 /* Double */:
                    return "Double";
                    break;
            }
        };

        HandHistory.prototype.toJSON = function () {
            var _this = this;
            this.actionsTaken = this.actions.map(function (x) {
                return _this.actionToString(x);
            });
            this.actions = undefined;
            return this;
        };
        return HandHistory;
    })();
    Context.HandHistory = HandHistory;

    var DeckManager = (function () {
        function DeckManager(riggedMap) {
            this.riggedMap = riggedMap;
        }
        DeckManager.prototype.newDeck = function (index) {
            console.log("Building deck for index " + index);

            if (index in this.riggedMap) {
                console.log("Rigged");
                return this.riggedMap[index]();
            } else {
                console.log("Not rigged");
                return this.riggedMap['default']();
            }
        };
        return DeckManager;
    })();
    Context.DeckManager = DeckManager;

    var StateManager = (function () {
        function StateManager(maxHands, displayContainer, deckManager) {
            this.maxHands = maxHands;
            this.displayContainer = displayContainer;
            this.deckManager = deckManager;
            this.currentHandIndex = 0;
            this.canDoAction = true;
            this.isPlaying = false;
            this.gameDealed = false;
            this.isStanding = false;
            this.gameEnded = false;
            this.history = new Array();
            this.currentHandHistory = new HandHistory();
        }
        StateManager.prototype.withCheck = function (callback) {
            // console.log("checking: ");
            // ["isPlaying", "canDoAction", "isStanding", "gameEnded"].map( (prop) => {
            // 	console.log("this." + prop + " = " + this[prop]);
            // 	return ""
            // });
            if (!this.isPlaying || !this.canDoAction || this.isStanding || this.gameEnded) {
                return;
            } else {
                callback();
            }
        };

        StateManager.prototype.recordAction = function (action) {
            this.currentHandHistory.actions.push(action);
        };

        StateManager.prototype.hit = function () {
            this.recordAction(0 /* Hit */);
        };

        StateManager.prototype.stand = function () {
            this.recordAction(1 /* Stand */);
            this.isStanding = true;
        };

        StateManager.prototype.doubledown = function () {
            this.recordAction(2 /* Double */);
        };

        StateManager.prototype.endTurn = function (dealerHand, playerHand) {
            console.log("About to end turn...");

            if (dealerHand.lastCard() === undefined || playerHand.lastCard() === undefined) {
                return;
            }

            this.currentHandHistory.playerHand = playerHand;
            this.currentHandHistory.dealerHand = dealerHand;
            this.history.push(this.currentHandHistory);

            this.currentHandHistory = new HandHistory();

            this.displayContainer.html(String(this.maxHands - (++this.currentHandIndex)));
        };

        StateManager.prototype.dealable = function () {
            return !(this.isPlaying || !this.canDoAction || this.gameEnded);
        };

        StateManager.prototype.bettable = function () {
            return !(this.isPlaying || this.gameEnded);
        };

        StateManager.prototype.deckConstructor = function () {
            return this.deckManager.newDeck(this.currentHandIndex);
        };

        StateManager.prototype.atMaxHands = function () {
            return this.maxHands <= this.currentHandIndex;
        };

        StateManager.prototype.historyToString = function () {
            // var toPrint : string[] = this.history.map((x) => {
            // 	return [
            // 		x.dealerHand.toString(),
            // 		x.playerHand.toString(),
            // 		x.actions.map((y) => {
            // 			return this.actionToString(y);
            // 		}).toString()
            // 	].toString();
            // });
            // console.log(toPrint);
            // console.log(toPrint.toString());
            var jdp = JSON.stringify(this.history, undefined, 4);
            console.log(jdp);

            $('body').html("<pre>" + jdp + "</pre>");
        };
        return StateManager;
    })();
    Context.StateManager = StateManager;
})(Context || (Context = {}));
/*
*  BytesJack fork
*/
/// <reference path='../libs/jquery.d.ts'/>
/// <reference path='../libs/bootstrap.d.ts'/>
/// <reference path='./players.ts'/>
/// <reference path='./cards.ts'/>
/// <reference path='./globals.ts'/>
/// <reference path='./context.ts'/>

// Static class hack (auto init)
$(document).ready(function () {
    window.App = new App();
});

//  Class
// var App = function() { };
var App = (function () {
    function App() {
        var _this = this;
        //  Constants
        this.MAX_TURNS = 10;
        this.KEY_SPACE = 32;
        this.KEY_S = 83;
        this.KEY_D = 68;
        this.KEY_1 = 49;
        this.KEY_2 = 50;
        this.KEY_3 = 51;
        //  Variables
        this.types = ['clubs', 'diamonds', 'hearts', 'spades'];
        // isPlaying       = false;
        // gameDealed      = false;
        this.dealNav = $('#deal');
        this.actionsNav = $('#actions');
        this.doubleBtn = $('#double');
        this.chips = $('#chips');
        this.allChips = $('.chip');
        this.currentBet = this.allChips.first().data('value');
        this.resizeTimer = null;
        // canDoAction     = true;
        // isStanding      = false;
        // gameEnded       = false;
        this.html = $('html');
        this.isSafari = this.html.attr('browser') === 'Safari';
        this.dealer = new Players.Dealer($('#dealer-cards'), $('#dealer-total'), this.isSafari);
        this.player = new Players.Player($('#player-cards'), $('#player-total'), this.isSafari, $('#bankroll'));
        // hands count from zero
        this.deckManager = new Context.DeckManager({
            "default": function () {
                return new Cards.RandomRiggedDeck({});
            },
            "4": function () {
                return new Cards.RandomRiggedDeck({
                    "0": 10,
                    "1": 7,
                    "2": 6
                });
            } });
        this.state = new Context.StateManager(this.MAX_TURNS, $('#left-text'), this.deckManager);
        this.deckConstructor = function () {
            return _this.state.deckConstructor();
        };
        this.deck = this.deckConstructor();
        this.initialize.apply(this, arguments);
    }
    //  public
    // pro.initialize = function(opts) { initialize() };
    // pro.deal       = function() { deal() };
    // pro.hit        = function() { hit() };
    // pro.stand      = function() { stand() };
    // pro.doubledown = function() { doubledown() };
    // ?? not clear why they have opts
    App.prototype.initialize = function (opts) {
        $('a[href="#"]').bind('click', function (e) {
            e.preventDefault();
        });
        this.initBet();
        this.initResize();
        this.initKeyboardKeys();
        this.initDisplay();

        setTimeout(function () {
            window.scrollTo(0, 1);
        }, 500);
    };

    App.prototype.initDisplay = function () {
        $('#chart').tooltip({
            title: "Click to see more.",
            placement: "bottom"
        });

        $('#chart').on('click', function () {
            var toShow = $(this).attr('src');

            // console.log("got " + toShow);
            $('#modalImg').attr('src', toShow);
            $('#myModal').modal('show');
        });
    };

    //  Resize management
    App.prototype.initResize = function () {
        var _this = this;
        $(window).bind('resize', function () {
            _this.onWindowResize;
        });
        this.onWindowResize(null);
    };

    App.prototype.onWindowResize = function (e) {
        var _this = this;
        clearTimeout(this.resizeTimer);
        this.resizeTimer = setTimeout(function () {
            _this.centerContainers();
        }, 100);
    };

    App.prototype.initBet = function () {
        // ugly because we need access to these things in the closure
        var _this = this;
        this.allChips.bind('click', function (e) {
            var chip = $(this);
            if (_this.state.isPlaying || chip.hasClass('desactivate'))
                return;

            _this.allChips.removeClass('bet');
            chip.addClass('bet');

            // console.log("Trying to change bet to " + String(chip.data('value')));
            _this.player.changeBet(chip.data('value'));

            _this.chips.prepend(chip);
        });
    };

    //  Keyboard managment
    App.prototype.initKeyboardKeys = function () {
        $(document).bind('keydown', this.onKeyDown);
        $(document).bind('keyup', this.onKeyUp);
    };

    App.prototype.onKeyDown = function (e) {
        switch (e.keyCode) {
            case this.KEY_SPACE:
                (this.state.isPlaying) ? this.actionsNav.children('li:first-child').children('a').addClass('active') : this.dealNav.children('a').addClass('active');
                break;
            case this.KEY_S:
                this.actionsNav.children('li:nth-child(2)').children('a').addClass('active');
                break;
            case this.KEY_D:
                this.actionsNav.children('li:nth-child(3)').children('a').addClass('active');
                break;
            case this.KEY_1:
                this.selectChip(0);
                break;
            case this.KEY_2:
                this.selectChip(1);
                break;
            case this.KEY_3:
                this.selectChip(2);
                break;
        }
    };

    App.prototype.onKeyUp = function (e) {
        e.preventDefault();

        switch (e.keyCode) {
            case this.KEY_SPACE:
                if (this.state.isPlaying) {
                    this.hit();
                    this.actionsNav.children('li:first-child').children('a').removeClass('active');
                } else {
                    this.deal();
                    this.dealNav.children('a').removeClass('active');
                }
            case this.KEY_S:
                this.stand();
                this.actionsNav.children('li:nth-child(2)').children('a').removeClass('active');
                break;
            case this.KEY_D:
                this.doubledown();
                this.actionsNav.children('li:nth-child(3)').children('a').removeClass('active');
                break;
            case this.KEY_1:
                this.selectChip(0);
                break;
            case this.KEY_2:
                this.selectChip(1);
                break;
            case this.KEY_3:
                this.selectChip(2);
                break;
        }
    };

    App.prototype.selectChip = function (index) {
        if (!this.state.bettable())
            return;
        this.allChips.eq(index).trigger('click');
    };

    App.prototype.addCard = function (side, toAdd, callback) {
        // var cardData  = this.cards[this.cardsIndex];
        var cardData = this.deck.dealNew();
        var newCard = new Cards.Card(cardData.type, cardData.card, side, this.deck.currentIndex);

        toAdd.addCard(newCard, callback);
    };

    App.prototype.centerContainers = function () {
        this.dealer.centerContainer();
        this.player.centerContainer();
    };

    //  Game management
    App.prototype.deal = function () {
        var _this = this;
        if (!this.state.dealable())
            return;

        this.state.isPlaying = true;

        if (this.state.gameDealed) {
            this.doubleBtn.removeClass('desactivate');
            this.player.resetHand();
            this.dealer.resetHand();
            this.deck = this.deckConstructor();
            this.player.doubled = false;
            this.state.canDoAction = true;
            this.state.isStanding = false;
            $('#message').remove();
        }

        this.player.changeBankroll(-1);
        this.disableWhile(function () {
            return _this.distributeCards();
        });
        this.state.gameDealed = true;
    };

    App.prototype.hit = function () {
        var _this = this;
        this.state.withCheck(function () {
            _this._hit();
        });
    };

    App.prototype.stand = function () {
        var _this = this;
        this.state.withCheck(function () {
            _this._stand();
        });
    };

    App.prototype.doubledown = function () {
        var _this = this;
        this.state.withCheck(function () {
            _this._doubledown();
        });
    };

    App.prototype._hit = function () {
        var _this = this;
        this.state.hit();

        this.doubleBtn.addClass('desactivate');
        this.addCard('front', this.player, function () {
            if (_this.player.getScore() > 21)
                _this.lose('lose-busted');
        });
    };

    App.prototype._stand = function () {
        var _this = this;
        this.state.stand();

        // this.revealDealerCard();
        this.dealer.reveal();

        setTimeout(function () {
            if (!_this.dealer.doneBetting())
                _this.dealerTurn();
            else
                _this.end();
        }, G.ANIM_DELAY);
    };

    App.prototype._doubledown = function () {
        var _this = this;
        if (this.doubleBtn.hasClass('desactivate')) {
            return;
        }

        this.state.doubledown();

        this.player.changeBankroll(-1);
        this.player.doubled = true;
        this.addCard('front', this.player, function () {
            if (_this.player.hasBusted())
                _this.lose('lose-busted');
            else
                _this.stand();
        });
    };

    App.prototype.dealerTurn = function () {
        var _this = this;
        this.addCard('front', this.dealer, function () {
            _this.dealer.displayScore();

            if (!_this.dealer.doneBetting())
                _this.dealerTurn();
            else
                _this.end();
        });
    };

    App.prototype.push = function (msg) {
        var _this = this;
        this._showAndQuit(msg, function () {
            return _this.player.push();
        });
    };

    App.prototype.win = function (msg) {
        var _this = this;
        this._showAndQuit(msg, function () {
            return _this.player.win();
        });
    };

    App.prototype.lose = function (msg) {
        var _this = this;
        this._showAndQuit(msg, function () {
            return _this.player.lose();
        });
    };

    App.prototype._showAndQuit = function (msg, callback) {
        this.showMessage(msg);
        callback();
        this.stopGame();
    };

    App.prototype.showMessage = function (status) {
        var msg = document.createElement('div'), content = '', message = $('#message');

        if (message.length > 0)
            message.remove();

        msg.className = status;
        msg.id = 'message';

        switch (status) {
            case 'win':
                content = 'You win';
                break;
            case 'win-blackjack':
                content = 'You win<span>Blackjack</span>';
                break;
            case 'win-dealer-busted':
                content = 'You win<span>Dealer busted</span>';
                break;
            case 'lose':
                content = 'You lose';
                break;
            case 'lose-blackjack':
                content = 'You lose<span>Blackjack</span>';
                break;
            case 'lose-busted':
                content = 'You lose<span>Busted</span>';
                break;
            case 'push':
                content = 'Push<span>No winner</span>';
                break;
            case 'game-over':
                content = 'Game over';
                break;
            default:
                content = '<span>Something broke, don’t know what happened...</span>';
                break;
        }

        msg.innerHTML = content;
        this.player.cardsContainer.after(msg);
    };

    App.prototype.end = function () {
        var pScore = this.player.getScore(), dScore = this.dealer.getScore();

        if (this.dealer.hasBusted()) {
            this.win('win-dealer-busted');
        } else if (dScore > pScore) {
            this.lose('lose');
        } else if (pScore > dScore) {
            this.win('win');
        } else {
            this.push('push');
        }
    };

    App.prototype.endGame = function () {
        this.showMessage('game-over');
        this.state.gameEnded = true;

        var overlay = document.createElement('div');
        overlay.id = 'overlay';

        $('body').append(overlay);

        this.state.historyToString();
    };

    App.prototype.stopGame = function () {
        var _this = this;
        this.state.isPlaying = false;
        this.dealNav.show();
        this.actionsNav.hide();
        this.chips.removeClass('disabled');

        this.allChips.each(function (i) {
            var chip = $(_this);
            if (chip.data('value') > _this.player.bankValue) {
                chip.addClass('desactivate');

                var chipsAvailable = _this.allChips.removeClass('bet').not('.desactivate');
                if (chipsAvailable.length == 0)
                    _this.endGame();
                else {
                    var newChip = chipsAvailable.last();
                    newChip.addClass('bet');
                    _this.player.changeBet(newChip.data('value'));
                    _this.chips.prepend(newChip);
                }
            } else if (chip.hasClass('desactivate')) {
                chip.removeClass('desactivate');
            }
        });

        // not sure where else this should go
        this.state.endTurn(this.dealer.hand, this.player.hand);
        if (this.state.atMaxHands()) {
            this.endGame();
        }
    };

    App.prototype.disableWhile = function (callback) {
        this.state.canDoAction = false;
        var ret = callback();

        // need to do this in checkBlackjack
        // this.state.canDoAction = true;
        return ret;
    };

    App.prototype.distributeCards = function () {
        // this.state.canDoAction = false;
        var _this = this;
        // console.log("distributing cards");
        this.addCard('front', this.player, function () {
            _this.addCard('front', _this.dealer, function () {
                _this.addCard('front', _this.player, function () {
                    _this.addCard('back', _this.dealer, function () {
                        _this.checkBlackjack();
                    });
                });
            });
        });

        // this.state.canDoAction = true;
        this.dealNav.hide();
        this.actionsNav.show();
        this.chips.addClass('disabled');
    };

    App.prototype.checkBlackjack = function () {
        var pHas = this.player.checkBlackjack(), dHas = this.dealer.checkBlackjack();

        if (pHas && dHas)
            this.push('Push - No winner');
        else if (pHas)
            this.win('win-blackjack');
        else if (dHas) {
            this.lose('lose-blackjack');
            this.dealer.reveal();
        }

        this.state.canDoAction = true;
    };
    return App;
})();

/*
* Browser Detect <http://teev.io/blog/text/13423292>
*/
var BrowserDetect = {
    init: function () {
        this.browser = this.searchString(this.dataBrowser) || "An unknown browser";
        this.version = this.searchVersion(navigator.userAgent) || this.searchVersion(navigator.appVersion) || "an unknown version";
        this.OS = this.searchString(this.dataOS) || "an unknown OS";

        var b = document.documentElement;
        b.setAttribute('browser', this.browser);
        b.setAttribute('version', this.version);
        b.setAttribute('os', this.OS);
    },
    searchString: function (data) {
        for (var i = 0; i < data.length; i++) {
            var dataString = data[i].string;
            var dataProp = data[i].prop;
            this.versionSearchString = data[i].versionSearch || data[i].identity;
            if (dataString) {
                if (dataString.indexOf(data[i].subString) != -1)
                    return data[i].identity;
            } else if (dataProp)
                return data[i].identity;
        }
    },
    searchVersion: function (dataString) {
        var index = dataString.indexOf(this.versionSearchString);
        if (index == -1)
            return;
        return parseFloat(dataString.substring(index + this.versionSearchString.length + 1));
    },
    dataBrowser: [
        {
            string: navigator.userAgent,
            subString: "Chrome",
            identity: "Chrome"
        },
        {
            string: navigator.userAgent,
            subString: "OmniWeb",
            versionSearch: "OmniWeb/",
            identity: "OmniWeb"
        },
        {
            string: navigator.vendor,
            subString: "Apple",
            identity: "Safari",
            versionSearch: "Version"
        },
        // { //Makes Typescript angry
        //     prop: window.opera,
        //     identity: "Opera",
        //     versionSearch: "Version"
        // },
        {
            string: navigator.vendor,
            subString: "iCab",
            identity: "iCab"
        },
        {
            string: navigator.vendor,
            subString: "KDE",
            identity: "Konqueror"
        },
        {
            string: navigator.userAgent,
            subString: "Firefox",
            identity: "Firefox"
        },
        {
            string: navigator.vendor,
            subString: "Camino",
            identity: "Camino"
        },
        {
            string: navigator.userAgent,
            subString: "Netscape",
            identity: "Netscape"
        },
        {
            string: navigator.userAgent,
            subString: "MSIE",
            identity: "Explorer",
            versionSearch: "MSIE"
        },
        {
            string: navigator.userAgent,
            subString: "Gecko",
            identity: "Mozilla",
            versionSearch: "rv"
        },
        {
            string: navigator.userAgent,
            subString: "Mozilla",
            identity: "Netscape",
            versionSearch: "Mozilla"
        }
    ],
    dataOS: [
        {
            string: navigator.platform,
            subString: "Win",
            identity: "Windows"
        },
        {
            string: navigator.platform,
            subString: "Mac",
            identity: "Mac"
        },
        {
            string: navigator.userAgent,
            subString: "iPhone",
            identity: "iPhone/iPod"
        },
        {
            string: navigator.platform,
            subString: "Linux",
            identity: "Linux"
        }
    ]
};
BrowserDetect.init();
