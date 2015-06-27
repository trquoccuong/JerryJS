'use strict';

let path = require('path');
let fs = require('fs');
let glob = require('glob');

let Sequelize = require('sequelize');
let nunjucks = require('nunjucks');
let _ = require('lodash');
let calls = require('callsite');
let fsEx = require('fs-extra');
let thisFolder = __dirname;

let db;
let envBack;
let envFront;
let userConfig;
let Jerry = {};


Jerry.config = function (option) {
    let stack = calls();
    let defaultConfig = {
        backend: {
            path: '/layout/admin'
        },
        frontend: {
            path:'/layout'
        },
        modules: {
            path:'/modules'
        },
        adminRouter: 'admin',
        config: {
            path:'/config'
        },
        custom_filter: {
            path: '/custom_filters'
        }
    }
    let requester = stack[1].getFileName();
    userConfig = defaultConfig;
    /**
     * Install global function
     */

    if (userConfig.basePath) {
        global.JerryBase = userConfig.basePath;
    } else {
        global.JerryBase = path.dirname(requester);
    }
    let config;
    if(!fs.existsSync(JerryBase + userConfig.config.path)){
        fs.mkdirSync(JerryBase + userConfig.config.path);
    }
    if(!fs.existsSync(JerryBase + userConfig.config.path +'/config.js')){
        fsEx.copySync(thisFolder + '/demo/config.js',JerryBase + userConfig.config.path +'/config.js');
        //fs.createReadStream(__dirname + '/demo/config.js').pipe(fs.createWriteStream(JerryBase + userConfig.config.path +'/config.js'));
        console.log('You can change default setting in file config/config.js')
    } else {
        config = require(JerryBase + userConfig.config.path +'/config.js');
    }
    userConfig = _.assign(defaultConfig, config);

    if (userConfig.database && userConfig.database.connString){
        db = new Sequelize(userConfig.database.connString, userConfig.database.option);
    }

    global.JerryModule = require('./JerryModule');
    global.JerryController = require('./JerryController');
    global.JerryRouter = require('./JerryRouter');

    /**
     * Install View
     */
    envBack = new nunjucks.Environment(new nunjucks.FileSystemLoader([JerryBase + userConfig.backend.path, JerryBase + userConfig.modules.path]));
    envFront = new nunjucks.Environment(new nunjucks.FileSystemLoader([JerryBase + userConfig.frontend.path, JerryBase + userConfig.modules.path]));

    glob.sync(JerryBase + userConfig.custom_filter.path + '/*.js').forEach(function (file) {
        require(file)(envBack);
        require(file)(envFront);
    })
    return;
}


Jerry.start = function (app,option) {
    let modules = {}

    if(option && option.force) {
            let link = JerryBase + userConfig.config.path + '/moduleConfig.json'
            if (fs.existsSync(link)) {
                fs.unlinkSync(link);
            }
    }
    if(option && option.manager) {
        if (!fs.existsSync(JerryBase + userConfig.modules.path + '/module')) {
            fsEx.copySync(thisFolder + '/system/module/',JerryBase + '/modules/module/');
        }
        if (!fs.existsSync(JerryBase + userConfig.modules.path + '/router')) {
            fsEx.copySync(thisFolder + '/system/router/',JerryBase + '/modules/router/');
        }
    }

    if (!fs.existsSync(JerryBase + userConfig.config.path + '/moduleConfig.json')) {
        let i = 1;
        glob.sync(JerryBase + userConfig.modules.path + '/*/module.js').forEach(function (file) {
            let mClass = require(path.resolve(file));
            let m = jerryModule(mClass, file);
            if (m) {
                let moduleName = m.configurations.name;
                if (modules[moduleName]) {
                    console.error(`Module ${moduleName} duplicated`);
                    if(modules[moduleName].duplicate) {
                        modules[moduleName].duplicate.push(path.resolve(file,'..'))
                    } else {
                        modules[moduleName].duplicate =[];
                        modules[moduleName].duplicate.push(path.resolve(file,'..'))
                    }
                    return null
                }
                modules[moduleName] = {};
                modules[moduleName].name = moduleName;
                if(option && option.manager) {
                    if(moduleName == 'router' || moduleName == "module") {
                        modules[moduleName].active = true;

                    }
                } else {
                    modules[moduleName].active = false;
                }
                modules[moduleName].path = path.resolve(file,'..');
                modules[moduleName].associate = [];
                modules[moduleName].order = i++;
            }
        })
        let data = JSON.stringify(modules, null, 4);
        
        fs.writeFileSync(JerryBase + userConfig.config.path + '/moduleConfig.json',data);
        
        console.log(`Check file ${userConfig.config.path}/moduleConfig.js for active module `);
    }

    let moduleInfo = JSON.parse(fs.readFileSync(JerryBase + userConfig.config.path + '/moduleConfig.json', 'utf8'));
    let arrModule = Object.keys(moduleInfo).map(function (key) {
        return moduleInfo[key];
    })

    // Remove non active object;

    let filtered = arrModule.filter(function (m) {
        return m.active === true
    })

    // Reorder object;

    let ordered = filtered.sort(function (a, b) {
        return a.order - b.order;
    })

    ordered.forEach(function (m) {
        let mClass = require(path.resolve(m.path + '/module.js'));
        let mod = jerryModule(mClass, m.path + '/module.js', ordered);
        modules[m.name] = mod;
    })
    /**
     * Load route from modules
     */
    if(option && option.manager) {
            let routerInfo = {};
            routerInfo.front = {};
            routerInfo.back ={};
            for (let m in modules) {
                if (modules.hasOwnProperty(m)) {
                    if (modules[m].router) {
                        routerInfo.front[m] = [];
                        modules[m].router.stack.forEach(function (route) {
                            let newRoute = {};
                            newRoute.regexp = route.regexp.toString() || null;
                            newRoute.path = route.route.path || null;
                            newRoute.method = route.route.methods || null;
                            routerInfo.front[m].push(newRoute);
                        })
                   }
                    if (modules[m].admin && modules[m].admin.router) {
                        routerInfo.back[m] = [];
                        modules[m].router.stack.forEach(function (route) {
                            let newRoute = {};
                            newRoute.regexp = route.regexp.toString() || null;
                            newRoute.path = route.route.path || null;
                            newRoute.method = route.route.methods || null;
                            routerInfo.back[m].push(newRoute);
                        })
                    }
                }
            }
            let routerData = JSON.stringify(routerInfo, null, 4);

            fs.writeFileSync(JerryBase + userConfig.config.path + '/routerTable.json',routerData);
    }

    for (let m in modules) {
        if (modules.hasOwnProperty(m)) {
            if (modules[m].router) {
                app.use('/', modules[m].router);
            }
            if (modules[m].admin && modules[m].admin.router) {
                app.use('/' + userConfig.adminRouter + '/', modules[m].admin.router);
            }
        }
    }

    return app

}

function jerryModule(moduleClass, pathModule, listModule) {
    if (!moduleClass.prototype) {
        return null;
    }
    let jerryModule = {};

    jerryModule.path = path.resolve(pathModule, '..');

    jerryModule.render = function (view, option) {
        return new Promise(function (fulfill, reject) {

            if (view.indexOf('.html') == -1) {
                view += '.html';
            }
            view = jerryModule.path + '/views/' +view;
            envFront.loaders[0].searchPaths = [JerryBase + userConfig.frontend.path +'/', jerryModule.path + '/views/'];
            envFront.render(view,option, function (err, html) {
                fulfill(html);
                reject(err);
            })
        })
    }

    jerryModule.adminRender = function (view, option) {

        return new Promise(function (fulfill, reject) {

            if (view.indexOf('.html') == -1) {
                view += '.html';
            }
            view = jerryModule.path + '/admin/views/' + view;

            envBack.loaders[0].searchPaths = [JerryBase + userConfig.backend.path +'/', jerryModule.path + '/admin/views/'];
            envBack.render(view, option, function (err, html) {
                console.log(err);
                reject(err);
            })
        })
    }

    let m = new moduleClass;
    /**
     * Validate configurations
     */
    let configurations = m.configurations
    if (validateConfiguration(configurations)) {
        jerryModule.configurations = configurations;
    } else {
        return null
    }

    /**
     * Validate models
     */

    jerryModule.models = {};
    if (db) {
        let models = m.models;
        if (models) {
            for (let k in models) {
                if (models.hasOwnProperty(k)) {
                    let modelName = models[k].name;
                    jerryModule.models[modelName] = models[k];
                }
            }
        } else {
            // Load all models of this module;
            let myModels = glob.sync(jerryModule.path + '/models/*.js');

            if (listModule) {
                let myAssociate = listModule.filter(function (mod) {
                    return mod.path === jerryModule.path;
                })[0].associate;

                myAssociate.forEach(function (mod) {
                    let k =_.find(listModule, function (obj) {
                        return obj.name === mod
                    })
                    if(k) {
                        glob.sync(k.path + '/models/*.js').forEach(function (file) {
                            myModels.push(file);
                        })
                    }
                });
            }
            //Add models
            myModels.forEach(function (modelPath) {
                let model = db["import"](path.resolve(modelPath));
                let modelName = model.name;
                jerryModule.models[modelName] = model;
            })
            //Make associate
            Object.keys(jerryModule.models).forEach(function (modelName) {
                if ("associate" in jerryModule.models[modelName]) {
                    jerryModule.models[modelName].associate().forEach(function (func) {
                        if (jerryModule.models[func[1]]) {
                            func[0].call(jerryModule.models[modelName], jerryModule.models[func[1]], func[2]);
                        }
                    });
                }
            });
        }
    }

    /**
     * Validate controllers
     */

    let controllers = m.controllers;
    if (!controllers) {
        if (fs.existsSync(jerryModule.path + '/controllers/index.js')) {
            let ControllerClass = require(jerryModule.path + '/controllers/index.js');
            controllers = new ControllerClass(jerryModule);
        }
    }
    if (validateController(controllers)) {
        jerryModule.controllers = controllers;
    }
    /**
     * Validate router
     */

    if (jerryModule.controllers) {
        let moduleRouter = m.router;
        let router;
        if (moduleRouter) {
            router = m.router._router;
        }
        if (!router) {
            let RouterClass = require(path.resolve(jerryModule.path + '/route.js'));
            router = new RouterClass(jerryModule.controllers)._router;

        }
        ;
        if (validateRouter(router)) {
            jerryModule.router = router;
        }
    }

    /**
     * Validate admin controller and route
     */
    if (m.admin) {
        jerryModule.admin = {};

        let adminControllers = m.controllers
        if (validateController(adminControllers)) {
            jerryModule.admin.controllers = adminControllers;
        }

        let adminRouter = m.admin.router._router
        if (validateRouter(adminRouter)) {
            jerryModule.admin.router = adminRouter;
        }
    } else {
        jerryModule.admin = {};
        let adminControllers;
        if (fs.existsSync(jerryModule.path + '/admin/controllers/index.js')) {
            let ControllerClass = require(path.resolve(jerryModule.path + '/admin/controllers/index.js'))
            if (ControllerClass.prototype) {
                adminControllers = new ControllerClass(jerryModule);
            }
        }
        if (validateController(adminControllers)) {
            jerryModule.admin.controllers = adminControllers;
        }
        ;
        if (jerryModule.admin.controllers) {
            let moduleRouter = m.router;
            let router;
            if (moduleRouter) {
                router = m.router._router;
            }
            if (!router) {
                let RouterClass = require(path.resolve(jerryModule.path + "/admin/route.js"));
                if (RouterClass.prototype) {
                    router = new RouterClass(jerryModule.admin.controllers)._router;
                }
            }
            ;
            if (validateRouter(router)) {
                jerryModule.admin.router = router;
            }
        }

    }
    return jerryModule
}
/**
 * SUPPORT FUNCTION
 */
function validateConfiguration(info) {
    if (info) {
        if (!(typeof info.name == 'string' && info.name.match())) return false;
    } else {
        return false
    }
    return true
}

function validateModel(model) {
    return true
}

function validateRouter(router) {
    return true
}

function validateController(controller) {
    return (controller instanceof JerryController)
}


module.exports = Jerry