if (typeof console == 'undefined') {
	console = {
		log: function(args) {
			alert(args);
    }
	};
}

/**
 * Loader
 *
 * @class Loader
 */
Loader = {
	/**
	 * Store files by appName key.
	 *
	 * @private
	 * @property {object} files
	 */
	files: { },
	appName: '',
	callback: function() { },
	code: null,
	loadedElements: 0,
	totalElements: 0,

	addApplication: function(appName, files) {
		this.files[appName] = files;
		for (var file in files) {
			if (files[file].substr(-3) == '.js') {
				this.totalElements += 1;
			}
		}
	},

	start: function(appName, callback) {
		this.appName = appName || this.appName;
		this.callback = callback || function() { };
		document.body.innerHTML += (
	    '<div id="loading-mask"></div>' +
      '<div id="loading">' +
			'<span id="loading-message" style="background: url(\'images/loader.gif\') no-repeat left center;">Loading ' + this.appName + '. Please wait...</span>' +
			'</div>');
		this.load();
	},

	createElement: function(config) {
		var e = document.createElement(config.element);
		for (var i in config) {
			if (i != 'element' && i != 'appendTo') {
				e[i] = config[i];
			}
		}
		document.getElementsByTagName(config.appendTo)[0].appendChild(e);
	},

	load: function() {
		var date = new Date();
		var timestamp = date.getTime();
		for (var app in this.files) {
			this.createElement({
				element: 'script',
				type: 'text/javascript',
				innerHTML: 'document.getElementById("loading-message").innerHTML = "Loading ' + this.appName + '/' + app + '...";',
				appendTo: 'body'
			});
			for (var file in this.files[app]) {
				if (this.files[app][file].substr(-4) == '.css') {
					this.createElement({
						element: 'link',
						rel: 'stylesheet',
					  type: 'text/css',
						href: this.files[app][file] + '?ts=' + timestamp,
						appendTo: 'head'
					});
				} else {
					this.createElement({
						element: 'script',
						type: 'text/javascript',
						onload: this.elementLoaded,
						src: this.files[app][file] + '?ts=' + timestamp,
						appendTo: 'body'
					});
				}
			}
		}
	},

	elementLoaded: function() {
		Loader.loadedElements += 1;
		if (Loader.loadedElements == Loader.totalElements) {
			Loader.finish();
		}
	},

	finish: function() {
		var loadingMask = Ext.get('loading-mask');
		var loading = Ext.get('loading');
		loading.fadeOut({ duration: 0.2, remove: true });
		loadingMask.setOpacity(0.9);
		loadingMask.shift({
				xy: loading.getXY(),
					width: loading.getWidth(),
					height: loading.getHeight(),
					remove: true,
					duration: 1,
					opacity: 0.1,
					easing: 'bounceOut'
					});
		Loader.callback();
	},
};
