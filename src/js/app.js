(function () {

    'use strict';

    var _handler = {};

    function Site() {
        this.name = 'Site';

        imagesLoaded(this.root, init.bind(this));
    }

    FrenchDip.register(Site);

    window.app = window.app || {};
    extend(window.app, {
        // Define Global helper methods
        emptyElement: emptyElement,
        extend: extend,
        get: get,
        getFlickr: getFlickr,
        isEmpty: isEmpty,
        titleCase: titleCase,

        // Define Global helper properties
        flickr: {
            key: 'a5e95177da353f58113fd60296e1d250',
            gsfcId: '24662369@N07',
            url: 'https://api.flickr.com/services/rest/?'
        },
        state: getState()
    });

    /**
     * Adds "loaded" class to HTML element once the site's images are all loaded.
     *     CSS: "html.loaded" allows default styles and content to appear, hides janky load flickers
     *     JS: "html.loaded" gives a hook for initializing DOM manipulation
     */
    function init(ImgsLoaded) {
        _handler = this;
        _handler.root.classList.remove('transition-disabler');
    }

    function getState() {
        var state = window.location.pathname.replace(/[/]?([a-z-]*)([.]html)?.*/, '$1');
        if (isEmpty(state)) {
            state = 'home';
        }
        return state;
    }

    /*==================================================================================
    =            Vanilla JS replacements for common framework functionality            =
    ==================================================================================*/

    function emptyElement(el) {
        while (el.hasChildNodes()) {
            el.removeChild(el.firstChild);
        }
    }

    /**
     * Extends one Object off of another
     * @param  {Object} out If method is used in an assignment context, the first argument needs to be an empty array, otherwise, extend() assumes you're using the out parameter as the Object to be extended.
     * @return {Object}
     */
    function extend(out) {
        out = out || {};

        for (var i = 1; i < arguments.length; i++) {
            if (!arguments[i])
                continue;

            for (var key in arguments[i]) {
                if (arguments[i].hasOwnProperty(key))
                    out[key] = arguments[i][key];
            }
        }

        return out;
    };

    /**
     * Retrieves data from a defined location
     * @param  {[type]} url    [description]
     * @param  {[type]} params [description]
     * @return {[type]}        [description]
     */
    function get(url, payload) {
        var promise = new Promise(function (resolve, reject) {
            _getPromise(resolve, reject, url, payload);
        });
        return promise;
    }

    function getFlickr(params) {
        var url = app.flickr.url + 'format=json' +
            '&nojsoncallback=1' +
            '&api_key=' + app.flickr.key +
            '&user_id=' + app.flickr.gsfcId;
        for (var key in params) {
            url = url + '&' + key + '=' + params[key];
        }

        return app.get(url).then(_transformResponse);

        function _transformResponse(rsp) {
            return JSON.parse(rsp);
        }
    }

    /**
     * General purpose check for Object validity. By these definitions, "isEmpty" means undefined, null, an empty String, an Array with length of 0, or an Object with no properties.
     * Boolean value "false" will not be flagged as empty.
     * This method only addresses String, Array, and Object primitives. All other types will not be flagged as empty.
     * @param  {Any}  arg The Object to be inspected
     * @return {Boolean}
     */
    function isEmpty(arg) {
        if (!arg && arg !== false) {
            return true;
        }

        var isEmpty = false;
        isEmpty = typeof arg === 'string' ? arg !== '' : false;
        isEmpty = typeof arg === 'array' ? arg.length : false;
        isEmpty = typeof arg === 'object' ? Object.keys(arg).length : false;
        return isEmpty ? true : false; // returns `true` instead of length values collected in tests.
    }

    function titleCase(str) {
        if(!str.length) {
            return "";
        }
        str = str.split(" ");
        for(var i = 0; i < str.length; i++) {
            str[i] = str[i].charAt(0).toUpperCase() + (str[i].substr(1).length ? str[i].substr(1) : '');
        }
        return (str.length ? str.join(" ") : str);
    };

    function _getPromise(resolve, reject, url, payload) {
        var xhr = new XMLHttpRequest();
        xhr.onreadystatechange = function () {
            if (xhr.readyState === 4) {
                //do something with xhr.responseText
            }
        };
        xhr.open('GET', url);
        xhr.send();
        xhr.onload = _onLoad;
        xhr.onerror = _onError;

        function _onLoad() {
            if (this.status >= 200 && this.status < 300) {
                // Performs the function "resolve" when this.status is equal to 2xx
                resolve(this.response);
            } else {
                // Performs the function "reject" when this.status is different than 2xx
                reject(this.statusText);
            }
        }

        function _onError() {
            reject(this.statusText);
        }
    }

})(window);