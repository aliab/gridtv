/*
 GRID TV - Javascript Library
 https://github.com/spsycoder/gridtv/
 Copyright 2012 Saman Malek Ghasemian <samanmg@gmail.com>
 Released under the MIT and GPL licenses.
*/
var GridTV = (function (jQ) {
	var defOpts = {
		container      : 'tv',      //default container
		rows           : 11,        //# of blocks in rows
		cols           : 17,        //# of blocks in cols
		blkClassPrefix : "block",   //blocks class attribute prefix "can be used to specify more classes if useful ;)" also use empty if not important
		clearfixClass  : "clearfix",//clearfix class to be used, use empty if you dont want to be specified
		firstRowClass  : "fr",
		lastRowClass   : "lr",      //use empty if not important
		firstColClass  : "fc",
		lastColClass   : "lc",      //use empty if not important
		colPrefix      : "c", //necessary
		rowPrefix      : "r", //necessary
		start          : 0,         //start frame
		timing         : 3000       //default timing delay between frames in milliseconds
	};
	
	var _currentFrame = 0,
	    _framesLoaded = false,
	    _tickCallback,
	    _frames,
	    _framesCount,
	    _rowElem,
	    _objs = {};

	function showBlocks() { //rows,cols,width,height,margin of blocks
		var r=defOpts.rows, c=defOpts.cols ,W = defOpts.blkW, H = defOpts.blkH, m = defOpts.margin;
		
		/* Table based manipulation */
		// var tv = document.getElementById(defOpts.container);
		// var table = document.createElement('table');
		// var row = document.createElement('tr');
		// for (var i = 1; i <= c; i++) {
		// 	var elem = document.createElement('td');
		// 	elem.setAttribute('class', defOpts.blkClassPrefix+' '+defOpts.colPrefix+i+(i==1 ? ' '+defOpts.firstColClass : '')+(i==c ? ' '+defOpts.lastColClass : ''));
		// 	row.appendChild(elem);
		// };
		// for (var i = 1; i <= r; i++) {
		// 	row.setAttribute('class', 'r'+i);
		// 	table.appendChild(row.cloneNode(true));
		// };
		// tv.appendChild(table);

		/* DIV based manipulation */ /* Optimized version */
		var tv = document.getElementById(defOpts.container);
		var row = document.createElement('div');
		for (var i = 1; i <= c; i++) {
			var elem = document.createElement('div');
			elem.setAttribute('class', defOpts.blkClassPrefix+' '+defOpts.colPrefix+i+(i==1 ? ' '+defOpts.firstColClass : '')+(i==c ? ' '+defOpts.lastColClass : ''));
			row.appendChild(elem);
		};
		for (var i = 1; i <= r; i++) {
			row.setAttribute('class', defOpts.rowPrefix+i+(i==1 ? ' '+defOpts.firstRowClass : '')+(i==r ? ' '+defOpts.lastRowClass : ''));
			tv.appendChild(row.cloneNode(true));
			clearFix();
		};

		/* straight forward division management */
		// for (var i = 1; i <= r; i++) {
		// 	for (var j = 1; j <= c; j++) {
		// 		var elem = document.createElement('div');
		// 		elem.setAttribute('class', defOpts.blkClassPrefix+' '+defOpts.rowPrefix+i+' '+defOpts.colPrefix+j+(j==1 ? ' '+defOpts.firstColClass : '')+(i==1 ? ' '+defOpts.firstRowClass : '')+(j==c ? ' '+defOpts.lastColClass : '')+(i==r ? ' '+defOpts.lastRowClass : ''));
		// 		tv.appendChild(elem);
		// 	};
		// 	clearFix();
		// };
	}

	/*
	add a clearfix box to the tv
	 */
	function clearFix() {
		if (defOpts.clearfixClass === '') return;
		var elem = document.createElement('div');
		elem.setAttribute('class', defOpts.clearfixClass);
		document.getElementById(defOpts.container).appendChild(elem);
	}

	function mergeOptions(options) {
		for(key in options) {
			defOpts[key] = options[key];
		}
	}

	function fixjQ() {
		//special thanks to JAMES PADOLSEY
		jQ.expr[':'].regex = function(elem, index, match) {
			var matchParams = match[3].split(','),
				validLabels = /^(data|css):/,
				attr = {
					method: matchParams[0].match(validLabels) ? matchParams[0].split(':')[0] : 'attr',
					property: matchParams.shift().replace(validLabels,'')
				},
				regexFlags = 'ig',
				regex = new RegExp(matchParams.join('').replace(/^\s+|\s+$/g,''), regexFlags);
			return regex.test(jQuery(elem)[attr.method](attr.property));
		}
	}
	
	return { 
		init: function(options) {
			mergeOptions(options);
			showBlocks();
			fixjQ();
			return this;
		},

		renderObjects: function() {
			var key;
			for(key in _objs) {
				this.renderObject(_objs[key]);
			};
			return this;
		},

		renderObject: function(obj) {
			for (var i = 0; i < obj.blks.length; i++) {
				jQ('.b'+(obj.blks[i].t+obj.base[1])+'-'+(obj.blks[i].l+obj.base[0]))
					.append('<div class="'+(obj.cls)+'"></div>');
			};
			return this;
		},

		addObject: function(obj) {
			if(obj.map instanceof Array) {
				_objs[obj.name]=
					{
						cls   : obj.cls,
						blks  : this.map2array(obj.map,'*'),
						base  : obj.basePoint
					};
			}
			//and other modes
			return this;
		},

		test: function() {
			//
			return _objs;
		},

		map2array: function(map, char) {
			//map as an array of strings
			//char as a character to be determined as a block in mapping
			var r = map.length, c = map[0].length,temp=[];
			for (var i = 0; i < r; i++) {
				for (var j = 0; j < c; j++) {
					if (map[i][j] === char) {
						temp.push({t:i,l:j});
					}
				};
			};
			return temp;
		},

		addObjects: function(objs) {
			for (var i = 0; i < objs.length; i++) {
				this.addObject(objs[i]);
			};
			return this;
		},

		objLen: function(obj) {
			//tanx to Creative Qolami ;)
			var i=0,k;
			for(k in obj) i++;
			return i;
		},

		startTick: function(frms, caTick) {
			if (!_framesLoaded) {
				_frames = frms;
				_tickCallback = caTick;
				_framesCount = this.objLen(frms);
				_framesLoaded = true;
				if (_framesCount==0) return;
			}
			this.renderFrame(_frames[_currentFrame]);
			_tickCallback(); //to be run as callback after each tick
			var delay = _frames[_currentFrame].time || defOpts.timing;
			_currentFrame = _frames[_currentFrame].next || Math.floor((_currentFrame + 1)%_framesCount) ; //circulated next frame
			setTimeout(function(){this.GridTV.startTick()},delay);
		},

		setBlockClass: function(top, left, cls) {
			//its pos from top, and its pos from left
			jQ('.p'+top+'-'+left).addClass(cls);
		},

		stopTick: function() {
			//stop the animation
			//but it is resumable
		},

		shiftObject: function(hor, ver, obj) {
			//slide the objet on screen in 2D directions
			_objs[obj].base[0]+=ver;
			_objs[obj].base[1]+=hor;
			this.renderObject(_objs[obj]);
			return this;
		},

		shiftRotateObject: function(hor, ver, obj) {
		},

		blocks: function(regex) {
			//regex block selector
			return jQ(':regex(class,'+regex+')');
		},

		renderFrame: function(frame) {
			//run frame's process
			frame.proc(this);
		}
	};
}(jQuery));