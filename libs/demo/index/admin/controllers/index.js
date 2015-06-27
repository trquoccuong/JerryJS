'use strict'
class Controllers extends JerryController {
    constructor(myModule) {
        super(myModule);
        this.index = function (req, res) {
            res.send('index - admin - function');
        };
    }
}

module.exports = Controllers;