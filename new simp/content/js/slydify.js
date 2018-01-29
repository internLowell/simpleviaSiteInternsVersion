;(function( $, window, undefined ) {

	$.slydify = function( settings, element ) {
		this.$el = $( element );
		this.init( settings );
	};

	$.slydify.defaults = {
		sliceCount: 8,
		easing: 'ease-in',
		sideColor: '#222',
		startPosition: 0,
		blockRows: 6,
		blockColumns: 6,
		blocksDelay: 100,
		blocksDuration: 350,
		blindsDuration: 350,
		blindsDelay: 100,
		zipDuration: 350,
		zipDelay: 50,
		barsDuration: 400,
		barsDelay: 40
	};

	$.slydify.prototype = {

		init : function( settings ) {

			this.settings = $.extend( true, {}, $.slydify.defaults, settings );

			this.$images = [], this.$slices = [], this.randArray = [];
			this.w = 0, this.h = 0, this.current = 0, this.prev = 0;
			this.animating = false;
			this.blockCount = this.settings.blockRows * this.settings.blockColumns;

			this.type = 'blocks1';

			var self = this;
			var loaded = 0;
			var $imgs = this.$el.find('img');
			
			this.$el.addClass('slydify');

			$imgs.each(function(i,e) {
				self.$images.push($('<img src="' + $(this).attr('src') + '">'));

				$(this).remove();
				
				self.$images[i].bind('load', function() {
					loaded++;

					$(this).appendTo(self.$el);

					if (this.width > self.w) {
						self.w = this.width;
					}

					if (this.height > self.h) {
						self.h = this.height;
					}

					if (loaded == $imgs.length) {
						self.imgCount = loaded;
						self.layout();
					}

					$(this).css({width: this.width, height: this.height});
					self.$el.css({ width: this.width, height: this.height });
				});
			});

			for (var i = 0; i < this.blockCount; i++) {
				this.randArray[i] = Math.floor(Math.random() * 10 * this.settings.blocksDelay);
			}

		},

		
		layout: function() {
			var self = this;

			this.$el.css({maxWidth: this.w});

			this.$images[this.settings.startPosition].addClass('active').fadeIn(1000).css('display', 'block');


			this.$navNext = $('<div id="nav-next">></div>').css({ top: ((this.h / 2) - 18) + 'px' });
			this.$navPrev = $('<div id="nav-prev"><</div>').css({ top: ((self.h / 2) - 18) + 'px' });
			// this.$navRadios = $('<div id="nav-radios"></div>');

			// for (var j = 0; j < this.imgCount; j++) {
			// 	$('<div class="radio" id=' + j + '/>').appendTo(this.$navRadios);
			// }

			// this.$wrapper.appendTo(this.$el);
			this.$navPrev.appendTo(this.$el);
			this.$navNext.appendTo(this.$el);
			// this.$navRadios.appendTo(this.$el);

			// this.$images[this.settings.startPosition].addClass('current').css('display', 'block');
			// this.$navRadios.children().eq(this.settings.startPosition).addClass('current');


			this.$navPrev.click(function() { self.previous(); });
			this.$navNext.click(function() { self.next(); });
			// this.$navRadios.children().click(function() {
			// 	self.goto(parseInt($(this).attr('id')));
			// });

			
		},

		setup: function() {
			this.$wrapper = $('<div />').addClass('overlay').css({
				width: this.w,
				height: this.h
			});

			var config = $.extend(this.settings, {
				$image: this.$images[this.prev],
				imgCount: this.imgCount,
				width: this.w,
				height: this.h,
				randArray: this.randArray,
				blockCount: this.blockCount,
				type: this.type
			});

			switch (this.type) {
				case 'bars':
				case 'blinds':
				case 'zip':
					this.$slices = [];

					for (var i = 0; i < this.settings.sliceCount; i++) {
						var slice = new $.slice(config, i);
						slice.el().appendTo(this.$wrapper);
						this.$slices.push(slice);
					}
					break;
				case 'blocks1':
				case 'blocks2':
					var count = 0;
					this.$blocks = [];

					for (var j = 0; j < this.settings.blockRows; j++) {
						for (var k = 0; k < this.settings.blockColumns; k++) {
							var block = new $.block(config, count, j, k);
							block.el().appendTo(this.$wrapper);
							this.$blocks.push(block);
							count++;
						}
					}	
					break;
			}

			this.$wrapper.appendTo(this.$el);
			this.$images[this.current].addClass('active').css('display', 'block');
			this.$images[this.prev].removeClass('active').hide();

		},

		next: function() {
			if (!this.animating) {
				this.direction = 'next';
				if (this.current == (this.imgCount - 1)) {
					this.transition(0);
				}
				else {
					this.transition(this.current + 1);
				}
			}
		},

		previous: function() {
			if (!this.animating) {
				this.direction = 'prev';
				if (this.current == 0) {
					this.transition(this.imgCount - 1);
				}
				else {
					this.transition(this.current - 1);
				}
			}
		},

		goto: function(index) {
			if (!this.animating) {
				if (this.current < index) {
					this.direction = 'next';
				}
				else {
					this.direction = 'prev';
				}
				this.transition(index);
			}
		},

		transition: function(index) {
			var self = this;
			var count = 0;

			this.animating = true;
			this.prev = this.current;
			this.current = index;

			self.setup();

			switch (this.type) {
				case 'bars':
				case 'blinds':
				case 'zip':
					for (var i = 0; i < self.settings.sliceCount; i++) {
						self.$slices[i].transition(function() { self.callback(count++); });
					}
					break;
				case 'blocks1':
				case 'blocks2':
					for (var j = 0; j < self.blockCount; j++) {			
						self.$blocks[j].transition(function() { self.callback(count++); });			
					}
					break;
			}
		},

		callback: function(count) {
			var end;

			switch (this.type) {
				case 'bars':
				case 'blinds':
				case 'zip':
					end = (this.settings.sliceCount * 2) - 1;
					break;
				case 'blocks1':
				case 'blocks2':
					end = (this.settings.blockCount * 2) - 1;
					break;
			}
			
			if (count === end) {
				this.$wrapper.remove();
				this.animating = false;
			}
		}
	};

	$.slice = function(config, pos) {
		this.config = config;
		this.pos = pos;
		this.layout();
	};

	$.slice.prototype = {
		layout : function() {
			this.w = Math.floor(this.config.width / this.config.sliceCount);
			this.h = this.config.height;
			var delay = 100, 
				duration = 350,
				ex = this.config.width - (this.w * this.config.sliceCount);

			switch (this.config.type) {
				case 'bars': 
					duration = this.config.barsDuration;
					delay = this.config.barsDelay;
					this.transitionStyle = { 
						opacity: 0.5,
						'-webkit-transform': 'translate(0,' + this.h + 'px)'
					};
					break;
				case 'blinds': 
					duration = this.config.blindsDuration;
					delay = this.config.blindsDelay;
					this.transitionStyle = {
						opacity: 0.5,
						'-webkit-transform': 'scaleX(0.0001)'
					};
					break;
				case 'zip':
					duration: this.config.zipDuration;
					delay = this.config.zipDelay;
					this.transitionStyle = {
						opacity: 0.3,
						'-webkit-transform': 'translate(0,' + ((((this.pos + 1) % 2) === 0) ? this.h : -this.h) + 'px)'
					};
					break;
			}

			this.sliceStyle = {
				width: (this.pos === this.config.sliceCount - 1) ? this.w + ex : this.w, 
				height: this.h,
				left: Math.floor(this.w * this.pos),
				'-webkit-transition' : 'all ' + duration + 'ms ' + this.config.easing,
				'-moz-transition' : 'all ' + duration + 'ms ' + this.config.easing,
				'-o-transition' : 'all ' + duration + 'ms ' + this.config.easing,
				'-ms-transition' : 'all ' + duration + 'ms ' + this.config.easing,
				'transition' : 'all ' + duration + 'ms ' + this.config.easing,
				'-webkit-transition-property' : 'opacity transform',
				'-webkit-transition-delay': this.pos * delay + 'ms',
				'transition-delay': this.pos * delay + 'ms',
				backgroundImage: 'url("' + this.config.$image.attr('src') + '")',
				backgroundPosition: -(Math.floor(this.pos * this.w)) + 'px 0px',
			};
		},

		transition: function(callback) {
			var self = this; 
			setTimeout(function() {
				self.$el.css(self.transitionStyle).one('webkitTransitionEnd transitionend', function(e) {
					e.stopPropagation();
					if ($.isFunction(callback)) {
						callback.call();
					}
				});
			}, 1);

		},

		el : function() {
			this.$el = $('<div />').css(this.sliceStyle);
			return this.$el;
		}
	};

	$.block = function(config, pos, row, col) {
		this.config = config;
		this.pos = pos;
		this.row = row;
		this.col = col;
		this.layout();
	};

	$.block.prototype = {
		layout: function() {
			this.w = Math.floor(this.config.width / this.config.blockColumns);
			this.h = Math.floor(this.config.height / this.config.blockRows);

			var exW = this.config.width - (this.w * this.config.blockColumns),
				exH = this.config.height - (this.h * this.config.blockRows),
				rightEdge = (this.col === this.config.blockColumns - 1) ? true : false,
				bottomEdge = (this.row === this.config.blockRows - 1) ? true : false;

			switch (this.config.type) {
				case 'blocks1': 
					this.transitionStyle = {
						opacity: 0,
						transform: 'scale(0.8)'
					};
					break;
				case 'blocks2':
					this.transitionStyle = {
						opacity: 0,
						transform: 'scale(0.8)'
					};
					break;
			}

			this.blockStyle = {
				width: (rightEdge) ? this.w + exW : this.w,
				height: (bottomEdge) ? this.h + exH : this.h,
				left: Math.floor(this.w * this.col),
				top: Math.floor(this.h * this.row),
				'-webkit-transition' : 'all ' + this.config.blocksDuration + 'ms ' + this.config.easing,
				'-moz-transition' : 'all ' + this.config.blocksDuration + 'ms ' + this.config.easing,
				'-o-transition' : 'all ' + this.config.blocksDuration + 'ms ' + this.config.easing,
				'-ms-transition' : 'all ' + this.config.blocksDuration + 'ms ' + this.config.easing,
				'transition' : 'all ' + this.config.blocksDuration + 'ms ' + this.config.easing,
				'-webkit-transition-property' : 'opacity transform ',
				'-webkit-transition-delay': this.config.randArray[this.pos]+'ms',
				'transition-delay': this.config.randArray[this.pos]+'ms',
				backgroundImage: 'url("' + this.config.$image.attr('src') + '")',
				backgroundPosition: -(Math.floor(this.col * this.w)) + 'px ' + -Math.floor(this.row * this.h) + 'px',
			};
		},

		transition: function(callback) {
			var self = this;

			setTimeout(function() {
				self.$el.css(self.transitionStyle).one('webkitTransitionEnd transitionend', function(e) {
					e.stopPropagation();
					if ($.isFunction(callback)) {
						callback.call();
					}
				});
			}, 1);
		},

		el: function() {
			this.$el = $('<div />').css(this.blockStyle);
			return this.$el;
		}
	};

	$.fn.slydify = function( settings ) {
		var self = $.data( this, 'slydify' );
		this.each(function() {
			if ( self ) {
				self._init();
			}
			else {
				self = $.data( this, 'slydify', new $.slydify( settings, this ) );
			}
		});
		return self;
	};
})( jQuery, window );