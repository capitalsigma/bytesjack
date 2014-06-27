/// <reference path='./cards.ts'/>
/// <reference path='../libs/jquery.d.ts'/>

module Context {
	export enum Action {
		Hit,
		Stand,
		Double
	}

	export class HandHistory {
		playerHand:Cards.Hand;
		dealerHand:Cards.Hand;
		actions:Array<Action>;
		public actionsTaken:Array<string>;

		constructor () {
			this.actions = new Array<Action>();
		}


		actionToString (act:Action) {
			switch (act) {
			case Action.Hit:
				return "Hit";
				break;

			case Action.Stand:
				return "Stand";
				break;

			case Action.Double:
				return "Double";
				break;
			}
		}

		toJSON () {				// hack
			this.actionsTaken = this.actions.map((x) => {
				return this.actionToString(x)
			});
			this.actions = undefined;
			return this;
		}
	}

	export class DeckManager {
		constructor(private riggedMap) { }

		newDeck(index) {
			console.log("Building deck for index " + index);

			if (index in this.riggedMap) {
				console.log("Rigged");
				return this.riggedMap[index]();
			} else {
				console.log("Not rigged");
				return this.riggedMap['default']();
			}
		}
	}

	export class StateManager {
		private history:Array<HandHistory>;
		private currentHandIndex:number = 0;
		private currentHandHistory:HandHistory;

		public canDoAction:boolean = true;
		public isPlaying:boolean = false;
		public gameDealed:boolean = false;
		public isStanding:boolean = false;
		public gameEnded:boolean = false;


		public withCheck(callback) {
			// console.log("checking: ");

			// ["isPlaying", "canDoAction", "isStanding", "gameEnded"].map( (prop) => {
			// 	console.log("this." + prop + " = " + this[prop]);
			// 	return ""
			// });

			if(!this.isPlaying || !this.canDoAction ||
			   this.isStanding || this.gameEnded) {
				return;
			} else {
				callback();
			}
		}

		constructor(public maxHands, private displayContainer:JQuery,
					private deckManager:DeckManager) {
			this.history = new Array<HandHistory>();
			this.currentHandHistory = new HandHistory();
		}

		recordAction (action:Action) {
			this.currentHandHistory.actions.push(action);
		}

		hit() {
			this.recordAction(Action.Hit);
		}

		stand() {
			this.recordAction(Action.Stand);
			this.isStanding = true;
		}

		doubledown() {
			this.recordAction(Action.Double);
		}

 		endTurn (dealerHand:Cards.Hand, playerHand:Cards.Hand) {
			console.log("About to end turn...");

			if (dealerHand.lastCard() === undefined ||
				playerHand.lastCard() === undefined) {
				return;
			}

			this.currentHandHistory.playerHand = playerHand;
			this.currentHandHistory.dealerHand = dealerHand;
			this.history.push(this.currentHandHistory);

			this.currentHandHistory = new HandHistory();

			this.displayContainer.html(
				String(this.maxHands - (++this.currentHandIndex)));
		}

		dealable() {
			return !(this.isPlaying || !this.canDoAction
					 || this.gameEnded );
		}

		bettable() {
			return !(this.isPlaying || this.gameEnded);
		}

		deckConstructor() {
			return this.deckManager.newDeck(this.currentHandIndex);
		}

		atMaxHands() {
			return this.maxHands <= this.currentHandIndex;
		}

		historyToString() {
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
		}
	}

}