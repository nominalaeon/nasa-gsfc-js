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
(function () {

    'use strict';

    FrenchDip.register(Images);

    // Class
    function Images() {
        this.name = 'Images';

        this.active = [];

        init.call(this);
    }

    //

    function init() {
        app.Images = this;
    }

})();

(function () {

    'use strict';

    FrenchDip.register(Nav);

    // Class
    function Nav() {
        this.name = 'Nav';

        init.call(this);
    }

    //

    function init() {
        // set active class
        this.root.querySelector('#nav-' + app.state).classList.add('active');
    }

})();

(function () {

    'use strict';

    FrenchDip.register(Tags);

    var isCalling = false;

    // Class
    function Tags() {
        this.name = 'Tags';

        this.display = {
            count: 0,
            index: 0,
            page: 1
        };
        this.images = {};
        this.popular = {};

        init.call(this);
    }

    //

    function init() {
        app.Tags = this;

        this.tagList = this.root.querySelector('.tag-list');

        getPopularTags().then(setPopularTags);
    }

    function bindEvents(tag) {
        tag.addEventListener('click', onClickTag.bind(app.Tags, tag));
    }

    /*=================================
    =            Tag Utils            =
    =================================*/

    function collectActiveTags() {
        var activeEls = app.Tags.tagList.querySelectorAll('.active');
        
        app.Tags.active = [];

        activeEls.forEach(function (el) {
            app.Tags.active.push(el.dataset.title);
        });
    }

    function getPopularTags() {
        var params = {
            method: 'flickr.tags.getListUserPopular'
        }
        return app.getFlickr(params);
    }

    function onClickTag(tag) {
        if (isCalling) {
            return;
        }

        toggleTag(tag);

        return getTagImages().then(displayImages);
    }

    /**
     * API results are a little unwieldy, format them for easier use
     * @param {JSON} results
     */
    function setPopularTags(results) {
        results.who.tags.tag.forEach(setPopularTag);
        app.Tags.tagList.classList.remove('invisible');

        return getTagImages().then(displayImages);
    }
    function setPopularTag(tag, index) {
        var status = index > 3 ? 'active' : 'inactive';

        var li = document.createElement('li');
        var span = document.createElement('span');
        var liText = document.createTextNode(tag._content);
        var spanText = document.createTextNode(tag.count);

        li.setAttribute('id', 'tag-' + tag._content);
        li.dataset.title = tag._content;
        li.classList.add('inactive');

        toggleTag(li, status);
        
        span.appendChild(spanText);
        li.appendChild(liText);
        li.appendChild(span);
        app.Tags.tagList.appendChild(li);

        // Make the Popular Tags globally available
        app.Tags.popular[tag._content] = {
            count: tag.count,
            label: tag._content // Maybe Watson could title-case Flickr's tags?
        };

        bindEvents(li);
    }

    function toggleTag(tag, val) {
        if (!tag.classList || !tag.dataset) {
            return;
        }

        var title = tag.dataset.title;

        if (val === 'active' || tag.classList.contains('active')) {
            tag.classList.remove('active');
            tag.classList.add('inactive');
            title = 'Filter by "' + title + '"';
        } else {
            tag.classList.add('active');
            tag.classList.remove('inactive');
            title = 'Remove "' + title + '" filter';
        }

        tag.setAttribute('title', title);
    }

    /*=======================================
    =            Tag Image Utils            =
    =======================================*/

    /**
     * Display the current index's image off of every active Tag's collection before incrementing the index.
     * @return {Promise}
     */
    function displayImages() {
        var display = app.Tags.display;
        var limit = 15 * display.page;
        
        app.emptyElement(app.Images.root);

        for (var count = 0; count < 15; count) {

            app.Tags.active.forEach(function (tag) {
                if (display.count === limit) {
                    return;
                }

                displayImage(tag, app.Tags.images[tag].photo[display.index]);
                count++;
                display.count++;
            });
            if (display.count < limit) {
                display.index++; // Move on to the next index for each Tag
            } else {
                break;
            }
        }

        isCalling = false;
    }
    function displayImage(tag, image) {
        var urlDefault = 'https://farm' + image.farm + '.staticflickr.com/' +
            image.server + '/' +
            image.id + '_' + image.secret + '.jpg';
        var urlLarge = 'https://farm' + image.farm + '.staticflickr.com/' +
            image.server + '/' +
            image.id + '_' + image.secret + '_b.jpg';

        var container = document.createElement('div');
        var h3 = document.createElement('h3');
        var h3Text = document.createTextNode(image.title);
        var img = document.createElement('img');

        container.classList.add('images__image', 'pure-u-7-24');
        h3.appendChild(h3Text);
        img.setAttribute('src', urlDefault);
        
        container.appendChild(img);
        container.appendChild(h3);

        app.Images.root.appendChild(container);
    }

    function getTagImages() {
        var params = {
            method: 'flickr.photos.search',
            per_page: 15,
            sort: 'date-posted-desc'
        };

        var promises = [];

        collectActiveTags();

        app.Tags.active.forEach(_getTagImages);

        return Promise.all(promises);

        function _getTagImages(tag) {
            if (app.Tags.images[tag]) {
                return;
            }

            isCalling = true;
            params.tags = tag;

            var promise = app.getFlickr(params).then(setTagImages.bind({}, tag));
            promises.push(promise);
        }
    }

    function setTagImages(tag, results) {
        app.Tags.images[tag] = results.photos;
    }

})();
