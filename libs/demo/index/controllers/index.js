'use strict';

class Controllers extends JerryController {
        constructor(models) {
                super(models);
                this.index = function (req, res) {
                        res.send('Hello World');
                };
        }
}

module.exports = Controllers;

