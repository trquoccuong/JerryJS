'use strict';
class IndexRouter extends JerryRouter {
    constructor(controllers){
        super()
        this.route('/').get(controllers.index);
    }
}

module.exports = IndexRouter;