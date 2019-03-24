(function() {

'use strict'

var 
	_min = Math.min, 
	_max = Math.max,
	_round = Math.round,
	_abs = Math.abs

function _listen(target, events, handler, listen) {
	for (var i = 0; i < events.length; i++)	
		(listen === false)
		? target.removeEventListener(events[i], handler)
		: target.addEventListener(events[i], handler)
}

var defaults = {
	padding: 10,
	minimapHeightRel: 0.14,
	minimapBandSize: 12,
	colors: {
		background: '#fff',
		minimap: '#f8f8ff',
		minimapFrame: '#c8dde8',
		minimapDrag: 'rgba(200, 190, 190, 0.2)',
		label: '#aaa'
	}
}

var transition = {
	run: false,
	duration: 250,
	ts: 0,
	from: 0,
	to: 0,
	pos: 0,
	onComplete: null
}

// ----------------------------------------------

function VanillaChart(containerId, data) {
/*
	colors: {y0: "#3DC23F", y1: "#F34C44"}
	columns: (3) [Array(113), Array(113), Array(113)]
	names: {y0: "#0", y1: "#1"}
	types: {y0: "line", y1: "line", x: "x"}
*/
	this.data = null
	this.names = {}
	this.options = defaults
	this.container = document.getElementById(containerId)
	if (!this.container) throw new Error('chart container not found!')
	this.canvas = this.container.appendChild(document.createElement('canvas'))
	this.ctx = this.canvas.getContext('2d')
	this.ctx.font = window.getComputedStyle(this.container, null).font
	this.font = this.ctx.font
	this.vw = 0
	this.vh = 0
	this.select = -1

	this.controls = {
		h: 0,
		vh: 0,
		width: 0
	}

	this.minimap = {
		left: 0,
		right: 0,
		rlLeft: 0.75,
		rlRight: 1,
		vh: 0
	}

	this._transitions = {
		minimap: Object.create(transition),
		graph: Object.create(transition),
		pointer: Object.create(transition)
	}

	this.setData(data)

	// handling events:
	var _justifySize = function() {
		this.vw = this.canvas.width  = this.container.clientWidth
		this.vh = this.canvas.height = this.container.clientHeight
		this.minimap.left = _round(this.vw * this.minimap.rlLeft)
		this.minimap.right = _round(this.vw * this.minimap.rlRight)
		this.minimap.vh = _round(this.vh * this.options.minimapHeightRel)
		this.controls.vh = _round(this.vh * 0.15) * (1 + Math.floor((this.controls.width + this.controls.h)/this.vw))
		this.select = -1
		this.draw()
	}

	_listen(window, ['resize','load'], _justifySize.bind(this))
	_listen(this.canvas, ['mousemove', 'toucmove'], this.move.bind(this))
	_listen(this.canvas, ['mousedown', 'touchstart'], this.mousetouch.bind(this))
	
}

(function() {
	// helpers (a spike of private data/methods ):
	var pointerX = 0
	var pointerY = 0
	var _drag = {
		mode: 0,
		start: 0,
		left: 0,
		right: 0,
		runBnd: null,
		doneBnd: null
	}
	
	function _getMinimapRect(self) {
		var mm = self.minimap
		var margin = _round(mm.vh * 0.10)
		return {
			y: self.vh - mm.vh + margin - self.controls.vh,
			x: mm.left,
			w: mm.right - mm.left,
			h: mm.vh - margin * 2
		}
	}

	function _iterateControls(self, cb) {
		var pad = self.options.padding
		var controls = self.controls
		var names = self.names
		var x = pad, i = 1
		var y = self.vh - controls.vh + pad
		for (var col in self.data.names) {
			if (x + names[col].width > self.vw - pad) {
				x = pad
				y = y + controls.h + pad
			}
			cb({x: x, y: y, w: names[col].width, h: controls.h}, col)
			x = x + names[col].width + pad
			i++
		}
	}

	function _inRect(x, y, r) {
		return (r.x <= x && x <= r.x + r.w && r.y <= y && y <= r.y + r.h)
	}

	function _getPointingRegion(self, x, y) {
		var r = _getMinimapRect(self)
		var sb = self.options.minimapBandSize
		if (y < r.y) return 7
		if (_inRect(x, y, r)) {
			if (x < r.x + sb)	return 1
			if (x > r.x + r.w - sb)	return 2
			return 3
		}
		return 0
	}

	function _getColumn(data, name) {
		for (var i = 0; i < data.columns.length; i++) {
			if (data.columns[i][0] === name) return data.columns[i]
		}
		return null
	}

	function _transitions(trns) {
		var result = false
		for (var key in trns) {
			var trn = trns[key]
			result = result || trn.run
			// linear duration(ms) based transition 
			if (trn.run) {
				trn.pos = trn.from + (trn.to - trn.from) / trn.duration * (performance.now() - trn.ts) 
				if ((trn.to > trn.from && trn.pos >= trn.to) || (trn.to < trn.from && trn.pos <= trn.to) || trn.to === trn.from  ) {
					trn.run = false
					trn.pos = trn.to
					if (trn.onComplete) trn.onComplete()
				}
			}
		}
		return result
	} //_transitions

	function _dragRun(e) {
		this.select = -1
		if (e.type === 'touchmove') e = e.targetTouches[0]
		var delta = e.clientX - _drag.start
		var mm = this.minimap
		var sbSize = this.options.minimapBandSize

		if (_drag.mode & 4) delta = -delta //drag by body - reversal
		if (_drag.mode & 1) {
			mm.left = _drag.left + delta
			mm.left = _max(mm.left, 1)
			mm.left = _min(mm.left, mm.right - sbSize * 2 - 1)
		}
		if (_drag.mode & 2) {
			mm.right = _drag.right + delta 
			mm.right = _min(mm.right, this.vw - 1)
			mm.right = _max(mm.right, mm.left + sbSize * 2 + 1)
		}
		mm.rlLeft = mm.left / this.vw
		mm.rlRight = mm.right / this.vw

		var scaleView = this.vw / (this.dataLength - 1)
		var a = _round(mm.left / scaleView) // a, b == 0..dataLength
		var b = _round(mm.right / scaleView)
		this.initTransition('graph', 'current', this.getMaxY(a, b) )
	}

	function _dragDone(e) {
		 if (e.type !== 'touchmove') e.target.style.cursor='default'
		_listen(document, ['mousemove', 'touchmove'], _drag.runBnd, false)
		_listen(document, ['mouseup', 'touchend'], _drag.doneBnd, false)
		_drag.runBnd = null
		_drag.doneBnd = null
		this.initTransition('minimap', 'current', 0, function(){_drag.mode = 0} )
	}

	function _fontShift(font, delta, bold) {
		return font.replace(/(\d*\.?\d+)px/, function(m, p1) {return (bold?'bold ':'') + Number(Number(p1)+delta)+'px' } )
	}

	function _getDateText(unixDate, part) {
		return String.prototype.substr.apply((new Date(unixDate)), [[0, 3], [4, 11],	[4, 6],	[11, 4]][part])
	}

	function _drawRoundedRect(ctx, x, y, w, h, r, corners) {
		var methods = ['arcTo', 'lineTo']
		corners = corners || [0, 0, 0 ,0]
		ctx.moveTo(x+r, y)
		ctx[ methods[corners[0]] ](x+w, y,   x+w, y+h, r) 
		ctx[ methods[corners[1]] ](x+w, y+h, x,   y+h, r)
		ctx[ methods[corners[2]] ](x,   y+h, x,   y,   r)
		ctx[ methods[corners[3]] ](x,   y,   x+w, y,   r)
		return ctx
	}

	function _drawLabelBox(ctx, x, data, visible, i, _labelHeight, bkColor, borderColor, labelColor, vw) {
	// displays info for 1, 2 and more named columns
		var p = 10
		var date = _getColumn(data, 'x')[i]
		var dateLabel = _getDateText(date, 0) + ', ' + _getDateText(date, 2)
		var dateWidth = ctx.measureText(dateLabel).width
		var obj = {}
		var width = 0
		for (var key in data.names) {
			if (visible[key].visible) {
				obj[key] = {}
				obj[key].name = data.names[key]
				obj[key].value = _getColumn(data, key)[i]
				obj[key].width = _max(ctx.measureText(obj[key].name).width, ctx.measureText(obj[key].value).width)
				obj[key].color = data.colors[key]
				width += obj[key].width + p
			}
		}
		width = _max(dateWidth, width) + p
		x = x - width / 2
		if (x < 0) x = 0
		if (x + width > vw) x = vw - width

		ctx.fillStyle = bkColor
		ctx.strokeStyle = borderColor
		ctx.beginPath()
		_drawRoundedRect(ctx, x, 1, width, _labelHeight * 3 + p, 6).fill()
		ctx.stroke()

		ctx.fillStyle = labelColor
		ctx.beginPath()
		ctx.fillText(dateLabel, x + width/2 - dateWidth/2, _labelHeight + p/4)

		var w = 0, _x = x
		var font = ctx.font
		var bold = _fontShift(ctx.font, 2, true)
		for (key in obj) {
			ctx.fillStyle = obj[key].color
			w = obj[key].width
			ctx.font = bold
			ctx.fillText(obj[key].value , _x + p,	_labelHeight*2 + p/4)
			ctx.font = font
			ctx.fillText(obj[key].name ,  _x + p,	_labelHeight*3 + p/4)
			_x = _x + w + 10
		}
		ctx.fill()
	}

	// !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
	function _drawGraph(self, y, height, useMinimap, lineWidth, grid, maxY) {

		var ctx = self.ctx
		var symbolSize = ctx.measureText('M').width
		if (grid)	height = height - symbolSize - 8
		var data = self.data, 
				names = self.names;

		var width = self.vw,
				scaleView = width / (self.dataLength - 1),
				left = 0, 
				right = self.vw,
				a = 0,
				b = self.dataLength;

		if (useMinimap) {
			left = self.minimap.left
			right = self.minimap.right
			a = _round(left / scaleView)
			b = _round(right / scaleView)
		}
		
		var rlLeft = left / width,
				rlRight = right / width,
				scaleX = (1 / (rlRight - rlLeft)),
				scaleY = height / maxY,
				Y0 = y + height,
				visCount = 0;
		
		ctx.lineWidth = lineWidth
		ctx.lineJoin = 'round'
		ctx.font = self.font
		for (var name in names) if (names[name].visible) {
			visCount++
			ctx.beginPath()
			ctx.strokeStyle = data.colors[name]
			var dataY = _getColumn(data, name)
			// [a..b] - no need offscreen drawing
			for (var i = a; i <= b; i++) ctx.lineTo(
				(i * scaleView - left) * scaleX,
				Y0 - dataY[i + 1] * scaleY
			)
			ctx.stroke()
		}

		if (grid && visCount === 0) {
			var msg = 'No data to display'
			var msgWidth = ctx.measureText(msg).width
			ctx.fillStyle = self.options.colors.label
			ctx.font = _fontShift(ctx.font, 4, false)
			ctx.fillText(msg, width/2-msgWidth/2 , height/2)
			return
		}

		if (!grid ) return
		//-------------------------Y - lines / labels
		ctx.lineWidth = 0.2
		ctx.beginPath()
		ctx.strokeStyle = 'grey'
		var stepY = maxY / 8
		ctx.fillStyle = self.options.colors.label
		for (var y = 0; y < 8; y++) {
			ctx.moveTo(0, Y0 - y * stepY * scaleY)
			ctx.lineTo(width, Y0 - y * stepY * scaleY)
			ctx.fillText(_round(y * stepY).toString(), 5, Y0 - y * stepY  * scaleY - symbolSize)
		}
		ctx.stroke()

		//-------------------------X - labels
		var labelSize = symbolSize * 8
		var dense =  _max(_abs(b - a) / width * labelSize, 1)

		var dataX = _getColumn(data, 'x')
		for (var i = a; i < b; i++) {
			var label = _getDateText(dataX[i+1], 2)
			var w = ctx.measureText(label).width

			if (i % _round(dense) === 0) {
				ctx.fillStyle = self.options.colors.label
				ctx.fillText(label, _round((i * scaleView - left) * scaleX - w / 2),	Y0 + symbolSize + 6)
			}	
/*
			if (i % (_round(dense) -1) === 0) {
				ctx.fillStyle = 'rgba(100, 100, 100, ' + (1 - (dense - Math.floor(dense)))   +  ')'
				ctx.fillText(label, _round((i * scaleView - left) * scaleX - w / 2),	Y0 + symbolSize + 6)
			}
*/
		}

		//-------------------------Selection
		if (self.select !== -1) {
			var i = _round((left * scaleX + self.select) / (scaleX * scaleView))
			ctx.beginPath()
			ctx.strokeStyle = 'grey'
			ctx.lineWidth = 0.5
			var x = i * scaleView * scaleX - left * scaleX
			ctx.moveTo(x, symbolSize * 1.8)
			ctx.lineTo(x, height - symbolSize * 1.8)
			ctx.stroke()

			ctx.lineWidth = lineWidth
			for (var name in names) if (names[name].visible) {
				var dataY = _getColumn(data, name)
				ctx.beginPath()
				ctx.strokeStyle = data.colors[name]
				ctx.fillStyle = '#fff'
				var y = Y0 - dataY[i+1] * scaleY
				ctx.arc(x, y, 4, 0, 2*Math.PI, false)
				ctx.fill()
				ctx.stroke()
			}
			
			_drawLabelBox(ctx, x, data, self.names, i+1, symbolSize * 1.4,  self.options.colors.background, self.options.colors.minimap ,self.options.colors.label, width)
		}

	}	// _drawGraph

	function _drawMinimap(self) {
		var ctx = self.ctx
		var sb = self.options.minimapBandSize
		var colors = self.options.colors
		var r = _getMinimapRect(self)

		ctx.beginPath()
		ctx.fillStyle = colors.minimap
		ctx.fillRect(0, r.y, r.x + sb, r.h)
		ctx.fillRect(r.x + r.w - sb, r.y, self.vw - r.x - r.w + sb , r.h)

   	ctx.fillStyle = colors.minimapFrame
		_drawRoundedRect(ctx, r.x,            r.y, sb, r.h, 6, [1,1,0,0])
		_drawRoundedRect(ctx, r.x + r.w - sb, r.y, sb, r.h, 6, [0,0,1,1])
		ctx.fill()

		ctx.fillRect(r.x + sb, r.y, r.w-sb*2, 2)
		ctx.fillRect(r.x + sb, r.y+r.h-2, r.w-sb*2, 2)

		_drawGraph(self,r.y, r.h, false, 1, false, self.getMaxY(1, self.dataLength))
		//animation
		if (_drag.mode !== 0) {
			ctx.beginPath()
			ctx.fillStyle = colors.minimapDrag
		 	ctx.arc(r.x + [0, sb/2, r.w-sb/2, r.w/2][_drag.mode], r.y + r.h/2, self._transitions.minimap.pos,   0, 2*Math.PI, false)
			ctx.fill()
		}
	}

	function _drawControls(self) {
		var ctx = self.ctx
		ctx.font = _fontShift(self.font, 4)
		var data = self.data
		_iterateControls(self, function(r, col){
			ctx.beginPath()
			ctx.fillStyle = self.options.colors.minimap
			_drawRoundedRect(ctx, r.x, r.y, r.w, r.h, r.h/2).fill()
			ctx.textBaseline = 'middle'
			if (self.names[col].visible) {
				ctx.beginPath()
				ctx.fillStyle = data.colors[col]
				ctx.arc(r.x + r.h/2, r.y+r.h/2, r.h/3, 0, 2*Math.PI, false)
				ctx.fill()

				//ctx.font = _fontShift(self.font, 4, true)
				ctx.beginPath()
				ctx.fillStyle = '#fff'
				ctx.fillText('\u2713' , r.x + r.h/2.7, r.y + r.h/2)
			} else {
				ctx.beginPath()
				ctx.strokeStyle = data.colors[col]
				ctx.arc(r.x + r.h/2, r.y+r.h/2, r.h/3, 0, 2*Math.PI, false)
				ctx.stroke()
			}
			ctx.fillStyle = data.colors[col]
			ctx.beginPath()	
			ctx.fillText(data.names[col], r.x + r.h , r.y + r.h/2)
			ctx.textBaseline = 'bottom'
		})

	}

	function _draw() {
		var ctx = this.ctx
		ctx.fillStyle = this.options.colors.background
		ctx.fillRect(0, 0, this.vw, this.vh)
		ctx.font = this.font
		_drawMinimap(this)
		_drawControls(this)

		var h = _round(this.vh - this.minimap.vh - this.controls.vh)
		_drawGraph(this, 0, h, true, 2, true, this._transitions.graph.pos)
		
		var r = this._transitions.pointer.pos
		if (r > 0) {
			ctx.beginPath()
			ctx.fillStyle = 'rgba(200, 190, 190, 0.2)'
			ctx.arc(pointerX, pointerY, r,   0, 2*Math.PI, false)
			if (r > 12)	ctx.arc(pointerX, pointerY, r-12,   0, 2*Math.PI, true)
			ctx.fill()
		}
		
		if (_transitions(this._transitions)) this.draw() // -- re-call while transitions running
	}
	// helpers end

	//--------------------------------------------------------------------------------------
	// VanillaChart.prototype methods:
	this.draw = function() {
		requestAnimationFrame(_draw.bind(this))
	}

	this.move = function(e) {
		var r = e.target.getBoundingClientRect()
		if (e.type === 'touchstart') e = e.targetTouches[0]
		var x = e.clientX - r.left, y = e.clientY - r.top
		if (y < (this.vh - this.minimap.vh - this.controls.vh)) {
			this.select = x
			this.draw()
		}
	}

	this.mousetouch	= function(e) {
		if (_drag.runBnd || _drag.doneBnd) return
		var r = e.target.getBoundingClientRect()
		var event = e
		if (e.type === 'touchstart') e = e.targetTouches[0]
		pointerX = e.clientX - r.left
		pointerY = e.clientY - r.top
		
		_drag.mode = _getPointingRegion(this, pointerX, pointerY)
		if (_drag.mode > 0) {
			e.target.style.cursor = 'w-resize'
			_drag.start = e.clientX
			_drag.left = this.minimap.left
			_drag.right = this.minimap.right
			_drag.runBnd = _dragRun.bind(this)
			_drag.doneBnd = _dragDone.bind(this)
			_listen(document, ['mousemove', 'touchmove'], _drag.runBnd)
			_listen(document, ['mouseup', 'touchend'], _drag.doneBnd)
			this.initTransition('minimap', 'current', _round(this.minimap.vh / 2) )
		} else {
			var self = this
			_iterateControls(this, function(r, col){
				if (_inRect(pointerX, pointerY, r)) {
					event.preventDefault()
					self.setVisibility(col)
					self.initTransition('pointer', 'current', 50, function () { self._transitions.pointer.pos = 0}.bind(self)  )
				}
			})

		}
	}

	this.setData = function(data) {
		this.data = data
		try {
			this.dataLength = data.columns[0].length - 1
		}	catch (e)	{
			throw new TypeError('incorrect <inputData> format')
		}
		var ctx = this.ctx
		ctx.font = _fontShift(this.font, 4, true)
		this.controls.h = ctx.measureText('M').width * 3.5
		this.controls.width = 0
		this.names = {}
		for (var k in data.names)	{
			var w = ctx.measureText(data.names[k]).width + this.controls.h + this.options.padding
			this.controls.width += w
			this.names[k] = {
				visible: true, // visible by default
				width: w
			}
		}	
		this.initTransition('graph', 'current', this.getMaxY() )
	}

	this.setVisibility = function(col, vis) {
		this.names[col].visible = (typeof vis === 'undefined')? !this.names[col].visible : vis
		this.initTransition('graph', 'current', this.getMaxY() )
	}

	this.getMaxY = function(a, b) {
		var max = 0
		a = a || 0
		b = b || this.dataLength
		for (var name in this.names) if (this.names[name].visible) {
			var column = _getColumn(this.data, name)
			for (var i = a + 1; i < b + 1; i++) max = _max(max, column[i])
		}
		return max
	}

	this.initTransition = function(key, from, to, onComplete) {
		var trns = this._transitions
		var trn = trns[key]
		trn.from = (from === 'current')?trn.pos: from
		trn.pos = trn.from
		trn.to = to
		trn.ts = performance.now()
		trn.onComplete = onComplete
		var running = false
		for (var k in trns) running = running || trns[k].run
		if (!running) this.draw()
		trn.run = true
	}


}).call(VanillaChart.prototype)

if (typeof window !== 'undefined') window.VanillaChart = VanillaChart

})()
