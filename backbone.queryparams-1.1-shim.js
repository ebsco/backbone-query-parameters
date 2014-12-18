//
// Works around issue introduced in Backbone 1.1 by https://github.com/jashkenas/backbone/pull/2766
//
// This file is unnecessary under Backbone 1.0 and earlier.
//
// Note that https://github.com/jashkenas/backbone/pull/2890 should hopefully make this irrevelant
//
(function (root, factory) {
	if (typeof exports === 'object' && root.require) {
		module.exports = factory(require("underscore"), require("backbone"));
	} else if (typeof define === "function" && define.amd) {
		// AMD. Register as an anonymous module.
		define(["underscore", "backbone"], function (_, Backbone) {
			// Use global variables if the locals are undefined.
			return factory(_ || root._, Backbone || root.Backbone);
		});
	} else {
		// RequireJS isn't being used. Assume underscore and backbone are loaded in <script> tags
		factory(_, Backbone);
	}
}(this, function (_, Backbone) {

	var hashStripper = /#.*/;

	Backbone.History.prototype.navigate = function (fragment, options) {
		/*jshint curly:false */
		if (!Backbone.History.started) return false;
		if (!options || options === true) options = { trigger: !!options };

		var url = this.root + (fragment = this.getFragment(fragment || '')),
			hashMatch = fragment.match(hashStripper),
			hash = hashMatch ? hashMatch[0] : '',
			strippedFragment = fragment.replace(hashStripper, ''),
			fragmentChanged = true;

		// Modified from the upstream impl:
		// Strip the fragment of the hash for matching.
		fragment = fragment.replace(hashStripper, '');

		if (this.fragment === fragment) {
			fragmentChanged = false;
		} else {
			this.fragment = fragment;
		}

		// Don't include a trailing slash on the root.
		if (fragment === '' && url !== '/') url = url.slice(0, -1);

		// If pushState is available, we use it to set the fragment as a real URL.
		if (this._hasPushState) {
			this.history[options.replace ? 'replaceState' : 'pushState']({}, document.title, url + hash);

			// If hash changes haven't been explicitly disabled, update the hash
			// fragment to store history.
		} else if (this._wantsHashChange) {
			this._updateHash(this.location, fragment + hash, options.replace);
			if (this.iframe && (fragment !== this.getFragment(this.getHash(this.iframe)))) {
				// Opening and closing the iframe tricks IE7 and earlier to push a
				// history entry on hash-tag change.  When replace is true, we don't
				// want this.
				if (!options.replace) this.iframe.document.open().close();
				this._updateHash(this.iframe.location, fragment + hash, options.replace);
			}

			// If you've told us that you explicitly don't want fallback hashchange-
			// based history, then `navigate` becomes a page refresh.
		} else {
			if (fragmentChanged) {
				return this.location.assign(url + hash);				
			} else {
				return this.location.assign(hash);
			}
		}
		if (options.trigger && fragmentChanged) return this.loadUrl(fragment);
	};

}));
