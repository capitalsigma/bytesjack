module G {

	export var ANIM_DELAY = 300;
	export var PATTERNS = [
        [{deg: 0, top: 0}],
        [{deg: 5, top: 0}, {deg: -5, top: 0}],
        [{deg: 5, top: 15}, {deg: -1, top: 0}, {deg: -5, top: 15}],
        [{deg: 9, top: 20}, {deg: 4, top: 0}, {deg: -4, top: 0},
		 {deg: -9, top: 15}],
        [{deg: 12, top: 50}, {deg: 8, top: 10}, {deg: -4, top: 0},
		 {deg: -12, top: 15}, {deg: -16, top: 40}],
        [{deg: 14, top: 40}, {deg: 8, top: 10}, {deg: -2, top: 5},
		 {deg: -5, top: 15}, {deg: -8, top: 40}, {deg: -14, top: 70}],
        [{deg: 14, top: 70}, {deg: 8, top: 30}, {deg: 4, top: 10},
		 {deg: 0, top: 5}, {deg: -4, top: 20}, {deg: -8, top: 40},
		 {deg: -16, top: 70}]
    ];
}