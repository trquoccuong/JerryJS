'use strict';

class DemoRouter extends JerryRouter {
    constructor(controllers){
        super()
        this.route('/').get(controllers.index);
    }
}

module.exports = DemoRouter;