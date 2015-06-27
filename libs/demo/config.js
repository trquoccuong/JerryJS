'use strict'

module.exports = {
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
    database : {
        //connString : 'postgres://quoccuong:@localhost:5432/tech',
        //option : { logging : false}
    },
    basePath : require('path').resolve(__dirname,'..')
}