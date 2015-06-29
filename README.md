# JerryJS

### Introduction

>JerryJS is a mini framework Nodejs. It use Express for manage route and controller, Sequelize for communicate with database , Nunjucks for view template engine. JerryJS follow "Convention Over Configuration". We make some rules for reuse module across projects. This framework try to wrap all (model,controller,route,view) in module and you can easily import or export to another system. JerryJS includes some support modules for help developer manage system.

### Setup JerryJS

JerryJS cover Express so you need install express.
```
$ npm install jerryjs
$ npm install express
```
If you use database you need install some package depend on your database
```    
$ npm install pg pg-hstore // for Postgres
$ npm install mysql
$ npm install sqlite3

```
### JerryJS Requirement

I write JerryJs with many feature of ES6. For run JerryJS you need iojs newest version.

### Start JerryJS
For beginner
1. Make a new project folder.
2. Make a file server.js
``` 
'use strict';
var express = require('express');
var JerryJS = require("jerryjs");

var app = express();
JerryJS.config();
JerryJS.start(app,{ force : true , manager : true , demo : true });
app.listen(8118);
```
3. Run a command
```
$ node server.js
```
4. Go to browser with link http://localhost:8118/modules


### JerryJS start option

| File  | Desciption |
| ------------- | ------------- |
| force | remake file module Manager every run node |
| manager | enable 2 support module |
| demo |  enable demo module|

### JerryJS project construction
```
-Your project
----config
-------config.js
-------moduleConfig.json
-------routerTable.json
----modules
----custom_filters
----layout
-------admin
----public
----server.js
```

| File  | Desciption |
| ------------- | ------------- |
| config | All JerryJS config |
| modules | folder contain all your modules |
| custom_filters | nunjucks custom filter (optional) |
| layout | backend, frontend layout (optional) |
| public | resources(*.css,*.js,*.jpg , v.v) |
| server.js | running JerryJS |
### JerryJS module construction 

```
-JerryJS module
----admin
--------controllers
------------index.js
--------views
--------route.js
----controllers
--------index.js
----views
----models
----route.js
----module.js

```
| File  | Desciption |
| ------------- | ------------- |
| module.js | File declare  JerryJS module |
| admin | Folder backend |
| admin/controllers/index.js | declare backend controllers |
| admin/views | partial views backend folder |
| admin/route.js | backend router file |
| controllers/index.js | declare frontend controllers |
| views | partial views frontend folder |
| models | file models sequelize of this module |
| route.js | frontend router file |

One module is not really have all this file. Module only need module.js file. **Warning** controllers must be declare in index file before use in router.

### Make a module

```
'use strict';
class Index extends JerryModule {
    constructor(){
        super();
        this.configurations  = {
            name:'index'
        };
    }
};

module.exports = Index;
```

You must have module.configuration.name . This name is unique in project.

### Make a controller
Controller must be declared in file **controllers/index.js**

```
class Controllers extends JerryController {
        constructor(myModule) {
                super(myModule);
                this.index = function (req, res) {
                        res.send('Hello World');
                };
        }
}

module.exports = Controllers;

```

You should declare controller inside **constructor** for use myModule.
myModule contain all information of your module.

| Property  | Desciption |
| ------------- | ------------- |
| myModule.models | Object module models. You can call own models or associated |
| myModule.configurations | all info you set in module.js |

*Note* :You can rename myModule

### Render view

JerryJS has 2 methods to render view. They get template view from  folder **views** inside each module, Some view you want to reuse put them in **layout** folder
```
myModule.render(view, option)
myModule.adminRender(view,option)
```
They return a promise with result is rendered html
*Example:*
```
myModule.render("index.html", {data : queryResults})
.then(function(html){ res.send (html)})
.catch(function(err){console.log(err)});
```

### Make a model

JerryJS use Sequelize for connect database. Put all models file in **models** folder. Sometime you want to call models of other module.You need make an associate models. **Warning** :You only use actived module models
```
"use strict";

module.exports = function (sequelize, DataTypes) {
    let User = sequelize.define("user", {
        id : {type : DataTypes.INTEGER ,
            primaryKey : true,
        autoIncrement :true} ,
        name: DataTypes.STRING(60)
    }, {
        timestamps: false,
        freezeTableName: true
    });
    User.sync();
    return User;
};
```
For associate models add code like below  under the freezeTableName property

```
classMethod :{
    associate : function () {
        return [
            [User.hasmany, 'book', {foreignKey: 'book_id'}]
        ]
    }
}
```
models can has many association. Every association is a array with array[0] is method associate Sequelize, array[2] is model name, array[3] is option. You can find more information

for use models to query database :
```
myModule.models.user.findById(1)
```
You must code this inside controller. Sequelize support many method for query

### Make a route
Jerryjs have all feature of express router. you must declare router inside constructor . You only call controllers of this module. if controller is declared, program will throw an error
```
'use strict';

class DemoRouter extends JerryRouter {
    constructor(controllers){
        super()
        this.route('/').get(controllers.index);
    }
}

module.exports = DemoRouter;
```

### Warning when deploy app

Remove module manager and route manager when deploy app.

### Router  file

JerryJS auto load router in actived module.  This file only use for easy to debug your route. There are two categories: front and back. 

| Property  | Desciption |
| ------------- | ------------- |
| method | method of router( POST, GET, DELETE, PUT) |
| path | url you declare |
| regexp | Regex express |

You can use router manager module for a visual layout.

### Module config file

JerryJS auto create a file moduleConfig.json. This file contain all modules info, you can change this file manually or using module manager layout.

| Property  | Desciption |
| ------------- | ------------- |
| name | module name |
| path | module folder |
| active | module status (only actived module be loaded) |
| associate | List other modules link with this module.if module associated you call module models of all those modules. |
| order | Order loading module (ascending). Order loading sometimemake problems with order router. |
| Duplicate | Only the first active module loaded.Other modules with same name will be added path to this array. Remember module.name is unique in your project |

### Nunjuck filter

Nunjucks support developer make custom filter. To install custom filter to JerryJS, you need create folder name 'custom_filters' and make a filter like this example

### Using middleware

Add middleware before or after JerryJS.start. This middleware auto active. Middleware after app.listen is disable. Read more about middleware at Express site

### Sharing module

Many developer want to recycle module. With JerryJs you can save time to code.Only need zip your module folder and extract this to modules folder you can reuse this module.
You can use layout 'modules' to extract module or use any software