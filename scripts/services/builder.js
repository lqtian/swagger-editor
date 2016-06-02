'use strict';

var jsyaml = require('js-yaml');
var _ = require('lodash');

SwaggerEditor.service('Builder', function Builder(SwayWorker, simpleYaml, Preferences) {

  var load = _.memoize(jsyaml.load);

  /*
   * Build spec docs from a string value
   * @param {string} stringValue - the string to make the docs from
   * @returns {promise} - Returns a promise that resolves to spec document
   *  object or get rejected because of HTTP failures of external $refs
  */
  var buildDocs = function(stringValue, enableSimpleYaml) {
    var json;

    return new Promise(function(resolve, reject) {
      // If stringVlue is empty, return emptyDocsError
      if (!stringValue) {
        reject({
          specs: null,
          errors: [{emptyDocsError: 'Empty Document Error'}]
        });
      }

      // if jsyaml is unable to load the string value return yamlError
        try {
          json = load(stringValue);
        } catch (yamlError) {
          reject({
            errors: [{yamlError: yamlError}],
            specs: null
          });
        }

        var swaggerRate = 0;
        var simpleYamlRate = 0;
        // Based on all the required 1st-level fields to calculate which format is using. 
        for (var property in json){
          switch(property){
            case 'swagger' :
            case 'info' :
            case 'paths' :
            case 'host' :
            case 'schemes' :
            case 'basePath' :
            case 'products' :
            case 'definitions' :
              swaggerRate++; 
              break;
            case 'api' :
            case 'root' :
            case 'types' :
              simpleYamlRate++; 
              break;
          }
        }
        
        var enableSimpleYaml = false;
        if(swaggerRate < simpleYamlRate)
        {
          enableSimpleYaml = true;
        } 
        Preferences.set('simpleYAML', enableSimpleYaml);        

        var prom = new Promise(function(resolve1, reject1) {
          if(enableSimpleYaml){
            var errors = [];
            simpleYaml.model = Morpho.convertFrom['yaml'].call(Morpho, stringValue, errors, {addDefaults:true}, function(errors){
              if(errors&&errors.length>0){
                var newError = _.map(errors,function(error){
                  return {simpleYamlError:error};
                });

                reject({
                errors: newError,
                specs: simpleYaml.swagger
                });
              } else {
                resolve1();
              }
            });
            var result;
            if(!!simpleYaml.model){
              simpleYaml.swagger = json = Morpho.convertTo['swagger'].call(Morpho, simpleYaml.model, errors, {returnJSON:true});
            }
          }
          else {resolve1();}
        });

      prom.then(function() {
        // Add `title` from object key to definitions
        // if they are missing title
        if (json && _.isObject(json.definitions)) {

          for (var definition in json.definitions) {

            if (_.isObject(json.definitions[definition]) &&
                !_.startsWith(definition, 'x-') &&
                _.isEmpty(json.definitions[definition].title)) {

              json.definitions[definition].title = definition;
            }
          }
        }

        SwayWorker.run({
          definition: json
        }, function(data) {
          if (data.errors.length) {
            reject(data);
          } else {
            resolve(data);
          }
        });
      });
    });
  };

  this.buildDocs = buildDocs;
  
});
