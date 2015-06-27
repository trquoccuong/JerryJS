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
    custom_filter: {
        path: '/custom_filters'
    },
    database : {
        //connString : 'postgres://quoccuong:@localhost:5432/tech',
        //option : { logging : false}
    },
    basePath : require('path').resolve(__dirname,'..')
}