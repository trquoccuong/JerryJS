'use strict'
class Controllers extends JerryController {
    constructor(myModule) {
        super(myModule);
        this.index = function (req, res) {
            res.send('Hello Jerry Admin');
        };
    }
}

module.exports = Controllers;