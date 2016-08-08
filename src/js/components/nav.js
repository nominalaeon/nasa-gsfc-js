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
