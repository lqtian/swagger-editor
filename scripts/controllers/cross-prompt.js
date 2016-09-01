'use strict';

var _ = require('lodash');
var angular = require('angular');

SwaggerEditor.controller('CrossOriginPromptCtrl', function FileImportCtrl($scope,
  $uibModalInstance, $rootScope) {

  $scope.ok = function() {

    $uibModalInstance.close();
  };

  $scope.cancel = $uibModalInstance.close;
});
