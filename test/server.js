'use strict'

let Jerry = require('../index.js');

let app = new Jerry;

app.config({ manager : true , demo : true });

app.listen(8118);