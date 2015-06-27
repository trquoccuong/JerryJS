'use strict';

class ModuleRouter extends JerryRouter {
    constructor(controllers){
        super()
        this.route('/modules').get(controllers.index);
        this.route('/modules/import').post(controllers.importModule);
    }
}

module.exports = ModuleRouter;