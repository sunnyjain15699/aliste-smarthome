var http = require('http');

function log(message, message1, message2) {
    console.log(message + message1 + message2);
}


function stubControlFunctionToYourCloud(path,powerResult,request,context) {
  var options = {
    host: 'YOUR.CLOUD.SERVICE',
    port: 80,
    path: path,
    method: 'POST'
  };


  console.log('http request : ',options.toString());
  http.request(options, function(res) {
    console.log('STATUS: ' + res.statusCode);
    console.log('HEADERS: ' + JSON.stringify(res.headers));

    var contextResult = {
        "properties": [{
            "namespace": "Alexa.PowerController",
            "name": "powerState",
            "value": powerResult,
            "timeOfSample": new Date(), //retrieve from result.
            "uncertaintyInMilliseconds": 50
        }]
    };
    var responseHeader = request.directive.header;
    responseHeader.namespace = "Alexa";
    responseHeader.name = "Response";
    responseHeader.messageId = responseHeader.messageId + "-R";

    var endPoint = request.directive.endpoint;
    var response = {
        context: contextResult,
        event: {
            header: responseHeader,
            endpoint: {
                scope:endPoint.scope,
                endpointId:endPoint.endpointId
            }
        },
        payload: {}

    };
    log("DEBUG", "Alexa.PowerController ", JSON.stringify(response));
    context.succeed(response);
  }).end();
}

exports.handler = function (request, context) {
    if (request.directive.header.namespace === 'Alexa.Discovery' && request.directive.header.name === 'Discover') {
        log("DEBUG:", "Discover request",  JSON.stringify(request));
        handleDiscovery(request, context, "");
    }
    else if (request.directive.header.namespace === 'Alexa.PowerController') {
        if (request.directive.header.name === 'TurnOn' || request.directive.header.name === 'TurnOff') {
            log("DEBUG:", "TurnOn or TurnOff Request", JSON.stringify(request));
            handlePowerControl(request, context);
        }
    }
    else {
        log("DEBUG:", "Some other request",  JSON.stringify(request));
    }

    function handleDiscovery(request, context) {
        var payload = {
            "endpoints":
            [
                {
                    "endpointId": "demo_id",
                    "manufacturerName": "Smart Device Company",
                    "friendlyName": "LED",
                    "description": "LED Switch",
                    "displayCategories": ["SWITCH"],
                    "cookie": {
                        "key1": "arbitrary key/value pairs for skill to reference this endpoint.",
                        "key2": "There can be multiple entries",
                        "key3": "but they should only be used for reference purposes.",
                        "key4": "This is not a suitable place to maintain current endpoint state."
                    },
                    "capabilities":
                    [
                        {
                          "type": "AlexaInterface",
                          "interface": "Alexa",
                          "version": "3"
                        },
                        {
                            "interface": "Alexa.PowerController",
                            "version": "3",
                            "type": "AlexaInterface",
                            "properties": {
                                "supported": [{
                                    "name": "powerState"
                                }],
                                 "retrievable": false
                            }
                        }
                    ]
                }
            ]
        };
        var header = request.directive.header;
        header.name = "Discover.Response";
        log("DEBUG", "Discovery Response: ", JSON.stringify({ header: header, payload: payload }));
        context.succeed({ event: { header: header, payload: payload } });
    }

    function handlePowerControl(request, context) {
        // get device ID passed in during discovery
        var requestMethod = request.directive.header.name;
        // get user token pass in request
        //var requestToken = request.directive.payload.scope.token;
        var powerResult;

        if (requestMethod === "TurnOn") {

            // Make the call to your device cloud for control
            stubControlFunctionToYourCloud('/setLedOn',"ON",request,context);
        }
       else if (requestMethod === "TurnOff") {
            // Make the call to your device cloud for control and check for success
            stubControlFunctionToYourCloud('/setLedOff',"OFF",request,context);
        }
    }
};