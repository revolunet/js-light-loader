/**
 * ----------------------------------------------------------------------------
 * "THE BEER-WARE LICENSE" (Revision 42):
 * <bydooweedoo@gmail.com> wrote this file. As long as you retain this notice you
 * can do whatever you want with this stuff. If we meet some day, and you think
 * this stuff is worth it, you can buy me a beer in return.
 * Rémi MAREK
 * ----------------------------------------------------------------------------
 *
 * Dynamic javascript and css files loader written in javascript.
 * http://github.com/bydooweedoo/js-light-loader
 *
 * @class Loader
 */
Loader = {
	/**
	 * Current Loader version
	 *
	 * @property {string} version
	 */
	version: '0.1',

	/**
	 * Store files by appName key.
	 *
	 * @private
	 * @property {object} files
	 */
	files: {},

	/**
	 * Application name
	 *
	 * @private
	 * @property {string} appName
	 */
	appName: '',

	/**
	 * Default callback to call after application started
	 *
	 * @private
	 * @property {function} callback
	 */
	callback: function() {},

	/**
	 * Number of loaded elements
	 *
	 * @private
	 * @property {Int} loadedElements
	 */
	loadedElements: 0,

	/**
	 * Number to total elements
	 *
	 * @private
	 * @property {Int} totalElements
	 */
	totalElements: 0,

	/**
	 * Show loading mask
	 *
	 * @private
	 * @property {Boolean} showMask
	 */
	showMask: true,

	/**
	 * Add application files
	 *
	 * @method addApplication
	 * @param {string} appName Application name
	 * @param {Array} files List of files string (or dict to force a file type)
	 * @return {boolean} True if succeed else false
	 */
	addApplication: function(appName, files) {
		this.files[appName] = files;
		for (var file in files) {
			if (typeof files[file] == 'string' &&
                this.getFileExtension(files[file]) == 'Js') {
				this.totalElements += 1;
			}
		}
		return (true);
	},

	/**
	 * Start loading your application
	 *
	 * @method start
	 * @param {string} appName Application name
	 * @param {function} callback Your callback which be fired after all files loaded
	 * @return {boolean} True if succeed else false
	 */
	start: function(appName, callback) {
		this.appName = appName || this.appName;
		this.callback = callback || function() {};
		if (this.showMask) {
            document.body.innerHTML +=
                ('<div id="loading-mask"></div>' +
                 '<div id="loading">' +
                 '<span id="loading-message">Loading ' +
                 this.appName + '. Please wait...</span>' +
                 '</div>');
        }
		return (this.load());
	},

	/**
	 * Create an element and add it to the config.appendTo parameter
	 *
	 * @private
	 * @param {object} config Element configuration
	 * @return {boolean} True if succeed else false
	 */
	createElement: function(config) {
		var e = document.createElement(config.element);
		for (var i in config) {
			if (i != 'element' &&
					i != 'appendTo') {
				e[i] = config[i];
			}
		}
		var root = document.getElementsByTagName(config.appendTo)[0];
		return (typeof root.appendChild(e) == 'object');
	},

	/**
	 * Load all application files
	 *
	 * @private
	 * @method load
	 * @return {boolean} True if succeed else false
	 */
	load: function() {
		var date = new Date();
		var timestamp = date.getTime();
		for (var app in this.files) {
			if (this.showMask) {
                this.createElement({
                    element: 'script',
                    type: 'text/javascript',
                    innerHTML: 'document.getElementById("loading-message").innerHTML = "Loading ' +
                            this.appName + '/' + app + '...";',
                    appendTo: 'body'
                });
            }
			for (var file in this.files[app]) {
                if (typeof this.files[app][file] != 'function') {
                    var extension = this.getFileExtension(this.files[app][file]);
                    if (typeof this['load' + extension] == 'function') {
                        this['load' + extension](this.files[app][file] + '?ts=' + timestamp);
                    }
                }
            }
		}
	},

	/**
	 * Get file extension from its url
	 * Exception for google jsapi forced to 'Js'
     *
	 * @method getFileExtension
	 * @param {string} url File url
	 * @return {string} Cutted and Caml cased file extension
	 */
	getFileExtension: function(url) {
		if (url.indexOf('/jsapi') > -1) {
            return ('Js');
        }
		var i = (url + '').lastIndexOf('.');
		var extension = url.substr(i + 1);
		return (extension.substr(0, 1).toUpperCase() + extension.substr(1));
	},

	/**
	 * Load css file
	 *
	 * @private
	 * @method loadCss
	 * @param {string} url File url
	 * @return {boolean} True if succeed else false
	 */
	loadCss: function(url) {
		var result = this.createElement({
				element: 'link',
				rel: 'stylesheet',
				type: 'text/css',
				href: url,
				appendTo: 'head'
			});
		return (result);
	},

	/**
	 * Load javascript file
	 *
	 * @private
	 * @method loadJs
	 * @param {string} url File url
	 * @return {boolean} True if succeed else false
	 */
	loadJs: function(url) {
		var result = this.createElement({
				element: 'script',
				type: 'text/javascript',
				onload: this.elementLoaded,
				onreadystatechange: this.elementReadyStateChanged,
				src: url,
				appendTo: 'head'
			});
		return (result);
	},

	/**
	 * Callback fired when an element loaded (Firefox/Chrome)
	 *
	 * @private
	 * @method elementLoaded
	 */
	elementLoaded: function() {
		Loader.loadedElements += 1;
		if (Loader.loadedElements == Loader.totalElements) {
			Loader.finish();
		}
	},

	/**
	 * Callback fired when an element loaded (IE only)
	 *
	 * @private
	 * @method elementLoaded
	 */
	elementReadyStateChanged: function() {
        if (this.readyState == 'loaded' ||
            this.readyState == 'complete') {
            Loader.elementLoaded();
        }
	},

	/**
	 * Called when all files loaded
	 *
	 * @private
	 * @method finish
	 */
	finish: function() {
        if (this.showMask && typeof(Ext) == 'object') {
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
            }
		Loader.callback();
	},

	/**
	 * Reset apps and files
	 *
	 * @private
	 * @method reset
	 */
	reset: function() {
        Loader.files = {}
        Loader.loadedElements = 0;
        Loader.totalElements = 0;
        Loader.appName = '';
    }
};
