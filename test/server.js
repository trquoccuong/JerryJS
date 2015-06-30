'use strict'

let Jerry = require('../index.js');

let app = new Jerry;

app.config({ force : true , manager : true , demo : true });

app.listen(8118);