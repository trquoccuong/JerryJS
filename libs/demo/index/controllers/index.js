'use strict';

class Controllers extends JerryController {
        constructor(myModule) {
                super(myModule);
                this.index = function (req, res) {
                    myModule.render('index').then(function (html) {
                        res.send(html);
                    })
                };
        }
}

module.exports = Controllers;

