/*
 GRID TV - Javascript Library
 https://github.com/spsycoder/gridtv/
 Copyright 2012 Saman Malek Ghasemian <samanmg@gmail.com>
 Released under the MIT and GPL licenses.
*/
var GridTV = (function (jQ) {
	var defOpts = {
		container      : 'tv',           //default container
		rows           : 11,            //# of blocks in rows
		cols           : 17,            //# of blocks in cols
		blkW           : 50,          //px
		blkH           : 50,          //px
		margin         : 2,            //default grid margin in px
		blkClassPrefix : "block b",    //blocks class attribute prefix "can be used to specify more classes if useful ;)"
		start          : 0,            //start frame
		timing         : 3000          //default timing delay between frames in milliseconds
	};
	
	var currentFrame = 0,
	    framesLoaded = false,
	    tickCallback,
	    _frames,
	    _framesCount,
	    _objs = {};

	function showBlocks(r, c, W, H, m) { //rows,cols,width,height,margin of blocks
		var str='',top,left;
		for (var i = 1; i <= r; i++) {
			str+='<div class="clearfix"></div>';
			for (var j = 1; j <= c; j++) {
				top = m + (i - 1) * (H + m);
				left = m + (j - 1) * (W + m);
				str+='<div style="margin:'+m+'px '+(j==c ? m+'px' : '0')+' '+(i==r ? m+'px' : '0')+' '+m+'px;width:'+W+'px;height:'+H+'px;" class="'+defOpts.blkClassPrefix+i+'-'+j+'"></div>';
			};
		};
		str+='<div class="clearfix"></div>';
		jQ('#'+defOpts.container).append(str);
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
			var r = defOpts.rows, c = defOpts.cols, w = defOpts.blkW, h = defOpts.blkH, m = defOpts.margin;
			showBlocks(r, c, w, h, m);
			var mw = c*(w+m)+m;//container width
			jQ('#'+defOpts.container).css('width',mw+'px');
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
			//tanx to hashem
			var i=0,k;
			for(k in obj) i++;
			return i;
		},

		startTick: function(frms, caTick) {
			if (!framesLoaded) {
				_frames = frms;
				tickCallback = caTick;
				_framesCount = this.objLen(frms);
				framesLoaded = true;
			}
			this.renderFrame(_frames[currentFrame]);
			tickCallback(); //to be run as callback after each tick
			var delay = _frames[currentFrame].time || defOpts.timing;
			currentFrame = _frames[currentFrame].next || Math.floor((currentFrame + 1)%_framesCount) ; //circulated next frame
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