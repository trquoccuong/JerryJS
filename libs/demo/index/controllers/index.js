'use strict';

class Controllers extends JerryController {
        constructor(models) {
                super(models);
                this.index = function (req, res) {
                        res.send('Hello Jerry');
                };
        }
}

module.exports = Controllers;

