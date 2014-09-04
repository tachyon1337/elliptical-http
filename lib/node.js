


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
