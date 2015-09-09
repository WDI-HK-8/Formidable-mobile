angular.module('starter.controllers', [])

.controller('AppCtrl', function($scope, $auth, $window) {
  var validateUser = function(){
    $scope.currentUser = JSON.parse($window.localStorage.getItem('current-user'));
    console.log("current user:", $scope.currentUser)
  };
  validateUser();
})

.controller('LogInCtrl', function($scope, $auth, $window, $ionicPopup, $state) {

  var validateUser = function(){
    $scope.currentUser = JSON.parse($window.localStorage.getItem('current-user'));
    console.log("current user:", $scope.currentUser)
  };

  $scope.loginData = {};

  $scope.doLogin = function() {

    $auth.submitLogin($scope.loginData).then(function(resp){
      console.log(resp);

      $window.localStorage.setItem('current-user', JSON.stringify(resp));
      validateUser();

      $state.go('app.forms')

    }).catch(function(resp){
      console.log(resp);
      $ionicPopup.alert({
        title: 'wrong',
        template: 'try again'
      });
    });
  };

  $scope.logout = function(){
    $window.localStorage.setItem('current-user', null);
    validateUser();
  };

})

.controller('FormsCtrl', function($scope, $auth, $window, $http) {
  $http.get("http://localhost:3000/forms").success(
    function(resp){
      console.log(resp);
    }).error(function(resp){
      console.log(resp)
    });
});


