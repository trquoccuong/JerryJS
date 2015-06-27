'use strict';
let fs = require('fs');
let config = require(JerryBase + '/config/config');

class Controllers extends JerryController {
    constructor(myModule) {
        super(myModule);
        this.index = function (req, res) {
            var moduleInfo = JSON.parse(fs.readFileSync(JerryBase + config.config.path + '/routerTable.json', 'utf8'));

            myModule.render('index.html',{dataFront : moduleInfo.front,dataBack :moduleInfo.back}).then(function (html) {
                res.send(html);
            }).catch(function (err) {
                res.send(err);
            })
        };
    }
}

module.exports = Controllers;

