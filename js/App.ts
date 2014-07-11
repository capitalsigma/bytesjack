/*
 *  BytesJack fork
 */

/// <reference path='../libs/jquery.d.ts'/>
/// <reference path='../libs/bootstrap.d.ts'/>
/// <reference path='./players.ts'/>
/// <reference path='./cards.ts'/>
/// <reference path='./globals.ts'/>
/// <reference path='./context.ts'/>

// TODO: breaks if you hit stand (or whatever) while cards are being dealt
// TODO: doesn't count "doubled" score correctly sometimes (?)

interface Window {
	App: App;
}


// Static class hack (auto init)
$(document).ready(function(){ window.App = new App() });

//  Class
// var App = function() { };

class App {
	//  Constants
	MAX_TURNS = 10;

    KEY_SPACE   = 32;
    KEY_S       = 83;
    KEY_D       = 68;
    KEY_1       = 49;
    KEY_2       = 50;
    KEY_3       = 51;

	//  Variables
	types = ['clubs', 'diamonds', 'hearts', 'spades'];
	// isPlaying       = false;
	// gameDealed      = false;
	dealNav         = $('#deal');
	actionsNav      = $('#actions');
	doubleBtn       = $('#double');
	chips           = $('#chips');
	allChips        = $('.chip');
	currentBet      = this.allChips.first().data('value');
	resizeTimer     = null;
	// canDoAction     = true;
	// isStanding      = false;
	// gameEnded       = false;
	html            = $('html');
	isSafari = this.html.attr('browser') === 'Safari';
	dealer = new Players.Dealer($('#dealer-cards'), $('#dealer-total'),
								this.isSafari);
	player = new Players.Player($('#player-cards'), $('#player-total'),
								this.isSafari, $('#bankroll'));
	// hands count from zero
	deckManager = new Context.DeckManager({
		"default": () => { return new Cards.RandomRiggedDeck({}); },
		"4": () => { return new Cards.RandomRiggedDeck({
			"0": 10,
			"1": 7,
			"2": 6,
			// "3": 1
		}); }});

	state = new Context.StateManager(this.MAX_TURNS, $('#left-text'),
				 					 this.deckManager);
	deckConstructor = () => { return this.state.deckConstructor(); };

	deck = this.deckConstructor();


	constructor () {
		this.initialize.apply(this, arguments);
	}



	//  public
	// pro.initialize = function(opts) { initialize() };
	// pro.deal       = function() { deal() };
	// pro.hit        = function() { hit() };
	// pro.stand      = function() { stand() };
	// pro.doubledown = function() { doubledown() };

	// ?? not clear why they have opts
	public initialize(opts) {
		$('a[href="#"]').bind('click', function(e){ e.preventDefault(); });
		this.initBet();
		this.initResize();
		this.initKeyboardKeys();
		this.initDisplay();

		setTimeout(function(){
			window.scrollTo(0, 1)
		}, 500);
	}

	private initDisplay() {
		$('#chart').tooltip({
			title: "Click to see more.",
			placement: "bottom"
		});

		$('#chart').on('click', function() {
			var toShow = $(this).attr('src');

			// console.log("got " + toShow);

			$('#modalImg').attr('src', toShow);
			$('#myModal').modal('show');
		});
	}

	//  Resize management
	private initResize() {
		$(window).bind('resize', () => { this.onWindowResize });
		this.onWindowResize(null);
	}

	private onWindowResize(e:any) {
		clearTimeout(this.resizeTimer);
		this.resizeTimer = setTimeout( () => {
			this.centerContainers();
		}, 100);
	}


	private initBet () {
		// ugly because we need access to these things in the closure
		var _this = this;
		this.allChips.bind('click', function(e){
			var chip = $(this);
			if ( _this.state.isPlaying || chip.hasClass('desactivate') ) return;

			_this.allChips.removeClass('bet');
			chip.addClass('bet');
			// console.log("Trying to change bet to " + String(chip.data('value')));
			_this.player.changeBet(chip.data('value'));

			_this.chips.prepend(chip);
      });
	}

	//  Keyboard managment
	private initKeyboardKeys() {
		$(document).bind('keydown', this.onKeyDown);
		$(document).bind('keyup', this.onKeyUp);
	}

	private onKeyDown(e:any) {
		switch ( e.keyCode ) {
        case this.KEY_SPACE :
			( this.state.isPlaying )
				? this.actionsNav.children('li:first-child').children('a').addClass('active')
				: this.dealNav.children('a').addClass('active');
			break;
        case this.KEY_S :
			this.actionsNav.children('li:nth-child(2)').children('a').addClass('active');
			break;
        case this.KEY_D :
			this.actionsNav.children('li:nth-child(3)').children('a').addClass('active');
			break;
        case this.KEY_1 :
			this.selectChip(0);
			break;
        case this.KEY_2 :
			this.selectChip(1);
			break;
        case this.KEY_3 :
			this.selectChip(2);
			break;
		}
	}

	private onKeyUp(e) {
		e.preventDefault();

		switch ( e.keyCode ) {
        case this.KEY_SPACE :
			if ( this.state.isPlaying ) {
				this.hit();
				this.actionsNav.children('li:first-child').children('a').removeClass('active')
			} else {
				this.deal();
				this.dealNav.children('a').removeClass('active');
			}
        case this.KEY_S :
			this.stand();
			this.actionsNav.children('li:nth-child(2)').children('a').removeClass('active');
			break;
        case this.KEY_D :
			this.doubledown();
			this.actionsNav.children('li:nth-child(3)').children('a').removeClass('active');
			break;
        case this.KEY_1 : this.selectChip(0); break;
        case this.KEY_2 : this.selectChip(1); break;
        case this.KEY_3 : this.selectChip(2); break;
		}
	}

	private selectChip (index){
		if (!this.state.bettable()) return;
		this.allChips.eq(index).trigger('click');
	}

	private addCard(side, toAdd:Players.AbstractPlayer, callback){
		// var cardData  = this.cards[this.cardsIndex];
		var cardData = this.deck.dealNew();
		var newCard = new Cards.Card(cardData.type, cardData.card, side,
									 this.deck.currentIndex);

		toAdd.addCard(newCard, callback);
	}

	private centerContainers(){
		this.dealer.centerContainer();
		this.player.centerContainer();
	}


	//  Game management
	public deal(){
		if (!this.state.dealable()) return;

		this.state.isPlaying = true;

		if ( this.state.gameDealed ) {
			this.doubleBtn.removeClass('desactivate');
			this.player.resetHand();
			this.dealer.resetHand();
			this.deck       = this.deckConstructor();
			this.player.doubled     = false;
			this.state.canDoAction = true;
			this.state.isStanding  = false;
			$('#message').remove();
		}

		this.player.changeBankroll(-1);
		this.disableWhile(() => this.distributeCards());
		this.state.gameDealed = true;
	}



	public hit(){
		this.state.withCheck(() => { this._hit(); });
	}

	public stand() {
		this.state.withCheck(() => { this._stand(); });
	}

	public doubledown() {
		this.state.withCheck(() => { this._doubledown(); });
	}

	private _hit(){
		this.state.hit();

		this.doubleBtn.addClass('desactivate');
		this.addCard('front', this.player, () => {
			if (this.player.getScore() > 21) this.lose('lose-busted');
		});
	}

	private _stand()
	{
		this.state.stand();
		// this.revealDealerCard();
		this.dealer.reveal();

		setTimeout( () => {
			if (!this.dealer.doneBetting()) this.dealerTurn();
			else this.end();
		}, G.ANIM_DELAY);
	}

	public _doubledown()
	{
		if (this.doubleBtn.hasClass('desactivate')) {
			return;
		}

		this.state.doubledown();

		this.player.changeBankroll(-1);
		this.player.doubled = true;
		this.addCard('front', this.player, () => {
			if (this.player.hasBusted()) this.lose('lose-busted');
			else this.stand();
		});
	}

	private dealerTurn()
	{
		this.addCard('front', this.dealer, () => {
			this.dealer.displayScore();

			if (!this.dealer.doneBetting()) this.dealerTurn();
			else this.end();
		});
	}



	private push( msg )
	{
		this._showAndQuit(msg, () => this.player.push());
	}

	private win( msg )
	{
		this._showAndQuit(msg, () => this.player.win());
	}

	private lose( msg )
	{
		this._showAndQuit(msg, () => this.player.lose());
	}

	private _showAndQuit(msg: String, callback) {
		this.showMessage(msg);
		callback();
		this.stopGame();
	}

	private showMessage( status )
	{
		var msg       = document.createElement('div'),
        content   = '',
        message   = $('#message');

		if ( message.length > 0 ) message.remove();

		msg.className = status;
		msg.id        = 'message';

		switch ( status ) {
        case 'win': content =
				'You win'; break;
        case 'win-blackjack': content =
				'You win<span>Blackjack</span>'; break;
        case 'win-dealer-busted': content =
				'You win<span>Dealer busted</span>'; break;
        case 'lose': content =
				'You lose'; break;
        case 'lose-blackjack': content =
				'You lose<span>Blackjack</span>'; break;
        case 'lose-busted': content =
				'You lose<span>Busted</span>'; break;
        case 'push': content =
				'Push<span>No winner</span>'; break;
        case 'game-over': content =
				'Game over'; break;
        default: content =
				'<span>Something broke, don’t know what happened...</span>';
			break;
		}

		msg.innerHTML = content;
		this.player.cardsContainer.after(msg);
	}

	private end()
	{
		var pScore  = this.player.getScore(),
        dScore  = this.dealer.getScore();

		if (this.dealer.hasBusted()) {
			this.win('win-dealer-busted');
		} else if ( dScore > pScore ) {
			this.lose('lose');
		} else if ( pScore > dScore ) {
			this.win('win');
		} else {
			this.push('push');
		}
	}

	private endGame()
	{
		this.showMessage('game-over');
		this.state.gameEnded = true;

		var overlay = document.createElement('div');
		overlay.id = 'overlay';

		$('body').append(overlay);

		this.state.historyToString();
	}

	private stopGame()
	{
		this.state.isPlaying = false;
		this.dealNav.show();
		this.actionsNav.hide();
		this.chips.removeClass('disabled');

		this.allChips.each((i) => {
			var chip = $(this);
			if ( chip.data('value') > this.player.bankValue ) {
				chip.addClass('desactivate');

				var chipsAvailable =
					this.allChips.removeClass('bet').not('.desactivate');
				if ( chipsAvailable.length == 0 ) this.endGame();
				else {
					var newChip = chipsAvailable.last();
					newChip.addClass('bet');
					this.player.changeBet(newChip.data('value'));
					this.chips.prepend(newChip);
				}

			} else if ( chip.hasClass('desactivate') ) {
				chip.removeClass('desactivate');
			}
		});

		// not sure where else this should go
		this.state.endTurn(this.dealer.hand, this.player.hand);
		if (this.state.atMaxHands()) {
			this.endGame();
		}
	}

	private disableWhile(callback) {
		this.state.canDoAction = false;
		var ret = callback();
		// need to do this in checkBlackjack
		// this.state.canDoAction = true;

		return ret;
	}

	private distributeCards()
	{
		// this.state.canDoAction = false;

		// console.log("distributing cards");

		this.addCard('front', this.player, () => {
			this.addCard('front', this.dealer, () => {
				this.addCard('front', this.player, () => {
					this.addCard('back', this.dealer, () => {
						this.checkBlackjack();
					});
				});
			});
		});

		// this.state.canDoAction = true;

		this.dealNav.hide();
		this.actionsNav.show();
		this.chips.addClass('disabled');
	}

	private checkBlackjack()
	{
		var pHas  = this.player.checkBlackjack(),
        dHas  = this.dealer.checkBlackjack();

		if (pHas && dHas) this.push('Push - No winner');
		else if (pHas) this.win('win-blackjack');
		else if (dHas) {
			this.lose('lose-blackjack');
			this.dealer.reveal();
		}

		this.state.canDoAction = true;
	}
}

/*
 * Browser Detect <http://teev.io/blog/text/13423292>
*/
var BrowserDetect = {
    init: function () {
        this.browser = this.searchString(this.dataBrowser) || "An unknown browser";
        this.version = this.searchVersion(navigator.userAgent)
        || this.searchVersion(navigator.appVersion)
        || "an unknown version";
        this.OS = this.searchString(this.dataOS) || "an unknown OS";

        var b = document.documentElement;
        b.setAttribute('browser',  this.browser);
        b.setAttribute('version', this.version );
        b.setAttribute('os', this.OS);
    },
    searchString: function (data) {
        for (var i=0;i<data.length;i++)	{
            var dataString = data[i].string;
            var dataProp = data[i].prop;
            this.versionSearchString = data[i].versionSearch || data[i].identity;
            if (dataString) {
                if (dataString.indexOf(data[i].subString) != -1)
                return data[i].identity;
            }
            else if (dataProp)
            return data[i].identity;
        }
    },
    searchVersion: function (dataString) {
        var index = dataString.indexOf(this.versionSearchString);
        if (index == -1) return;
        return parseFloat(dataString.substring(index+this.versionSearchString.length+1));
    },
    dataBrowser: [
    {
        string: navigator.userAgent,
        subString: "Chrome",
        identity: "Chrome"
    },
    { 	string: navigator.userAgent,
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
    {		// for newer Netscapes (6+)
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
    { 		// for older Netscapes (4-)
        string: navigator.userAgent,
        subString: "Mozilla",
        identity: "Netscape",
        versionSearch: "Mozilla"
    }
    ],
    dataOS : [
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