'use strict';
let express = require('express');


class JerryRouter {
    constructor(){
        let router = express.Router();
        for(let k in router) {
            this[k] = router[k];
        }
        this._router = router;
    }
}

module.exports = JerryRouter;