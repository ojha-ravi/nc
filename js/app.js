function onReady() {
	var clock = new com.raviojha.AlarmClock("clock", -1830);
	var clock2 = new com.raviojha.Clock("clock2", -19800, "GST");
	var clock3 = new com.raviojha.TextClock("clock3");
}

// Static Properties/Method
Date.__interval = 0;
Date.__aDates = [];
Date.addToInterval = function(date) {
	// 'this' here is actual class class not the object
	this.__aDates.push(date);
	if (!this.__interval) {
		this.__interval = setInterval(function() {
			Date.updatesDates();
		}, 1000);
	}
}

Date.updatesDates = function() {
	for (var i=0;i<this.__aDates.length;i++) {
		if (this.__aDates[i] instanceof Date) {
			this.__aDates[i].updateSeconds();
		} else if (this.__aDates[i] instanceof Function) {
			this.__aDates[i]();
		} else if(this.__aDates[i] && this.__aDates[i]['update']) {
			this.__aDates[i].update();
		}
	}
}

Date.prototype.updateSeconds = function() {
	this.setSeconds(this.getSeconds() + 1);
};

Date.prototype.autoClock = function(isAuto) {
	clearInterval(this.clockInterval);
	if(isAuto) {
		// var self = this;
		// this.clockInterval = setInterval(function(){
		// 	self.updateSeconds();
		// }, 1000);
		Date.addToInterval(this);
	}
};

var com = com || {};
com.raviojha = com.raviojha || {};

com.raviojha.Clock = function(id, offset, label) {
	offset = offset || 0;
	label = label || "";
	var d = new Date();
	var offset = (offset + d.getTimezoneOffset())*60*1000;
	this.date = new Date(offset + d.getTime());
	this.date.autoClock(true);
	this.id = id;
	this.label = label;
	this.tick(true);
	var self = this;
	Date.addToInterval(function() {
		self.updateClock();
	});
}

com.raviojha.Clock.prototype.tick = function(isTick) {
	this.isTicking = isTick;
	// clearInterval(this.myInternalInterval);
	// if(isTick) {
	// 	var self = this;
	// 	this.myInternalInterval = setInterval(function() {
	// 		self.updateClock();
	// 	}, 1000);
	// 	this.updateClock();
	// }
}

com.raviojha.Clock.prototype.updateClock = function() {
	if (this.isTicking) {
		var date = this.date;
		date.updateSeconds();
		var clock = document.getElementById(this.id);
		clock.innerHTML = this.formtOutput(date.getHours(), date.getMinutes(), date.getSeconds(), this.label)
	}
};

com.raviojha.Clock.prototype.formtOutput = function(h, m, s, label) {
	return this.formatDigits(h) + " : " + this.formatDigits(m) + " : " + this.formatDigits(s) + " " + label;
}

com.raviojha.Clock.prototype.formatDigits = function(val) {
	if (val < 10) {
		val = "0" + val;
	}
	return val;
};

com.raviojha.Clock.prototype.version = "1.00"

com.raviojha.TextClock = function(id, offset, label) {
	com.raviojha.Clock.apply(this, arguments);
}

com.raviojha.TextClock.prototype = Object.create(com.raviojha.Clock.prototype);
com.raviojha.TextClock.prototype.constructor = com.raviojha.TextClock;

com.raviojha.Clock.prototype.version = "1.01"
com.raviojha.TextClock.prototype.formtOutput = function(h, m, s, label) {
	return this.formatDigits(h) + "-" + this.formatDigits(m) + "-" + this.formatDigits(s) + " " + label;
}

com.raviojha.AlarmClock = function(id, offset, label, ah, am) {
	com.raviojha.Clock.apply(this, arguments);
	this.almH = ah;
	this.almM = am;
	this.dom = document.getElementById(id);
	this.dom.contentEditable = true;
	this.doUpdate = true;
	var self = this;

	this.dom.addEventListener("focus", function() {
		this.innerHTML = this.innerHTML.slice(0, this.innerHTML.lastIndexOf(":"));
		self.tick(false);
	});

	this.dom.addEventListener("blur", function() {
		var a = this.innerHTML.split(":");
		self.almH = parseInt(a[0]);
		self.almM = parseInt(a[1]);
		if ((self.almH >= 0 && self.almH < 24) && (self.almM >= 0 && self.almM < 60)) {
			var event = new Event("restart_tick");
			this.dispatchEvent(event);
		}
	});

	this.dom.addEventListener("restart_tick", function() {
		self.tick(true);
	});
}

com.raviojha.AlarmClock.prototype = Object.create(com.raviojha.Clock.prototype);
com.raviojha.AlarmClock.prototype.constructor = com.raviojha.AlarmClock;

com.raviojha.AlarmClock.prototype.formtOutput = function(h, m, s, label) {
	if (h === this.almH && m === this.almM) {
		var snd = new Audio("art/beep.mp3");
		snd.play();
		return "ALARM WAKE UP";
	} else {
		return com.raviojha.Clock.prototype.formtOutput.apply(this, arguments);
	}
}


window.onload = onReady;


// updateClock();
// setInterval(updateClock, 1000);
// setInterval(c.updateClock.bind(c), 1000);
// setInterval(function() {
// 	this.updateClock();
// }, 1000)
// setInterval(this.updateClock.bind(this), 1000)
