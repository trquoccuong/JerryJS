'use strict';

class Router extends JerryRouter {
    constructor(controllers){
        super()
        this.route('/router').get(controllers.index);
    }
}

module.exports = Router;
