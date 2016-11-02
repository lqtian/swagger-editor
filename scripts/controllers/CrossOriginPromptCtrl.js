'use strict';


SwaggerEditor.controller('CrossOriginPromptCtrl', function CrossOriginPromptCtrl($scope,
  $uibModalInstance, $rootScope, simpleYaml,YAML) {
  YAML.dump(simpleYaml.swagger, function(error, result){
  var yamlBlob = new Blob([result], {type: 'text/plain'});
  $scope.yamlDownloadHref = window.URL.createObjectURL(yamlBlob);
  $scope.yamlDownloadUrl = [
        'text/plain',
        'swagger.yaml',
        $scope.yamlDownloadHref
      ].join(':');
  
  if(error) {$scope.swaggerSpec = "Error"; return;}
  {$scope.swaggerSpec = result; return;}
  });
  
  $scope.copy=function(){
    var copyTextarea = document.querySelector('#prompt-swaggerspec');
    copyTextarea.select();

    try {
      var successful = document.execCommand('copy');
      var msg = successful ? 'successful' : 'unsuccessful';
      console.log('Copying text command was ' + msg);
    } catch (err) {
      console.log('Oops, unable to copy');
    }
  };
});
