


//umd pattern

(function (root, factory) {
    if (typeof module !== 'undefined' && module.exports) {
        //commonjs
        module.exports = factory($);
    } else if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define(['jquery'], factory);
    } else {
        // Browser globals (root is window)
        root.elliptical.http=root.elliptical.http | {};
        root.elliptical.http.browser=factory(root.$);
        root.returnExports = root.elliptical.http.browser;
    }
}(this, function ($) {

    var browser={
        send: function (params, callback) {
            var settings = {
                type: params.method || 'GET',
                dataType: params.dataType || 'json',
                url: params.protocol + '://' + params.host + ':' + (params.port || 80) + params.path

            };

            if (params.data) {
                params.data = JSON.stringify(params.data);
                settings.data = params.data;
                settings.contentType = 'application/json';

            }
            if (params.authorization) {
                settings.beforeSend = function (req) {
                    req.setRequestHeader('Authorization', params.authorization);
                }
            }

            var ajax = $.ajax(settings).done(function (data, status) {
                try {
                    if(typeof data==='string'){
                        data=JSON.parse(data);
                    }
                    callback(null, data);

                } catch (ex) {

                    var _err = {
                        statusCode: 500,
                        message: ex
                    };
                    callback(_err, null);
                }

            }).fail(function (data, status, errThrown) {
                var err={};
                err.statusCode=data.status;
                err.message=errThrown;

                callback(err, null);
            });
        }
    };

    return browser;
}));



module.exports={
    send: function (params, callback) {

        var http=(params.protocol==='http') ? require('http') : require('https');


        /* http.request settings */
        var settings = {
            host: params.host,
            port: params.port || 80,
            path: params.path,
            headers: params.headers || {},
            method: params.method || 'GET'
        };

        if (params.data) {
            params.data = JSON.stringify(params.data);
            settings.headers['Content-Type'] = 'application/json';
            settings.headers['Content-Length'] = params.data.length;
        }
        if (params.authorization) {
            settings.headers['Authorization'] = params.authorization;
        }

        /* send the request */
        var req = http.request(settings);

        /* if data, write it to the request */
        if (params.data) {
            req.write(params.data);
        }

        /* when the response is received */
        req.on('response', function (res) {
            res.body = '';
            res.setEncoding('utf-8');

            /* concat the data chunks */
            res.on('data', function (chunk) {

                res.body += chunk
            });

            /* when the response has finished */
            res.on('end', function () {

                /* fire the callback */

                try {

                    var len=res.body.length;
                    var data;
                    var err={};
                    if(len>0){

                        data = JSON.parse(res.body);
                        if(res.statusCode >=200 && res.statusCode <=206){
                            callback(null, data);
                        }else{
                            err.statusCode=res.statusCode;
                            err.message=data;
                            callback(err, null);
                        }
                    }else{
                        if(res.statusCode >=200 && res.statusCode <=206){
                            data={};
                            data.statusCode=res.statusCode;
                            callback(null, data);
                        }else{
                            err.statusCode=res.statusCode;
                            callback(err,null);
                        }

                    }


                } catch (ex) {

                    err = {
                        statusCode: 500,
                        message: ex
                    };
                    callback(err, null);

                }

            });

            req.on('error', function (e) {
                var err = {};
                err.statusCode = 500 || e.statusCode;
                err.message = e.message;

                callback(err, null);

            });
        });


        /* end the request */
        req.end();


    }
};


/*
 * =============================================================
 * elliptical.http v0.9.1
 * =============================================================
 * Copyright (c) 2014 S.Francis, MIS Interactive
 * Licensed MIT
 *
 * Dependencies:
 * node.js
 * browser.js
 */

//umd pattern

(function (root, factory) {
    if (typeof module !== 'undefined' && module.exports) {
        //commonjs
        var transport=require('./node');
        if(typeof window != 'undefined'){
            //we are in a browserify bundle
            transport=require('./browser');
        }
        module.exports = factory(transport,require('elliptical-crypto'));
    } else if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define(['./browser','elliptical-crypto'], factory);
    } else {
        // Browser globals (root is window)
        var browser=root.elliptical.http.browser;
        var base64=root.elliptical.http.base64;
        var http=factory(browser,base64);
        http.browser=browser;
        http.base64=base64;
        root.elliptical.http=http;
        root.returnExports = root.elliptical.http;
    }
}(this, function (transport,crypto) {

    var http={
        send: function (options, callback) {
            transport.send(options,function(err,data){
                if (callback) {
                    callback(err, data);
                }
            });
        },

        base64Encrypt: crypto.base64Encrypt,

        encodeSessionToken: function(token){
            var authorization = 'Session ' + token;
            return authorization;
        },

        encodeOAuthToken: function(token){
            var authorization = 'OAuth ' + token;
            return authorization;
        }


    };

    http.crypto=crypto;

    return http;


}));
