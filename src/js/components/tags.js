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
