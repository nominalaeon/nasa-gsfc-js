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
