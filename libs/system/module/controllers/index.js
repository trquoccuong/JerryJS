'use strict';
let fs = require('fs');
let config = require(JerryBase + '/config/config'),
    formidable = require('formidable'),
    admzip = require('adm-zip');


class Controllers extends JerryController {
    constructor(myModule) {
        super(myModule);
        this.index = function (req, res) {
            var moduleInfo = JSON.parse(fs.readFileSync(JerryBase + config.config.path + '/moduleConfig.json', 'utf8'));
            let arrModule = Object.keys(moduleInfo).map(function (key) {
                return moduleInfo[key];
            })
            myModule.render('index.html',{data : arrModule}).then(function (html) {
                res.send(html);
            }).catch(function (err) {
                res.send(err);
            })
        };
        this.importModule = function (req,res) {
            let max_size = 100;
            let form = new formidable.IncomingForm();
            form.parse(req, function (err, fields, files) {
                let file_size = Math.round(files.zip_file.size / 1000);
                let file_name = files.zip_file.name;
                let tmp_path = files.zip_file.path;

                if (file_size > max_size) {
                    console.log("File upload is too large! Max file size is " + max_size + " KB");
                    return res.redirect('/modules');
                }

                if (file_name.substr(file_name.lastIndexOf('.') + 1) != 'zip') {
                    console.log("Only zip file is allowed!");
                    return res.redirect('/modules');
                }

                // Use admzip to unzip uploaded file
                let zip = new admzip(tmp_path);
                let zipEntries = zip.getEntries();

                // Extract all inside files to /modules
                try {
                    zipEntries.forEach(function (zipEntry) {
                        if (zipEntry.isDirectory == false) {
                            zip.extractEntryTo(zipEntry.entryName, JerryBase + config.modules.path);
                        }
                    });
                } catch (error) {
                    console.log(error);
                }
                
            });
        }
        this.saveModule = function (req,res) {
            let data = JSON.parse(req.body.info)
            let test = JSON.stringify(data,null,4);
            fs.writeFileSync(JerryBase + config.config.path + '/moduleConfig.json', test);
            res.json({
                type: 'success'
            })
            process.exit();
        }
    }
}

module.exports = Controllers;

