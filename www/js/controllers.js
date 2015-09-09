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
  
  var user_id = $scope.currentUser.id;

  var url = 'http://localhost:3000' || 'https://formidableforms.herokuapp.com';

  $http.get(url + "/users/" + user_id + "/forms").success(
    function(resp){
      console.log(resp);
      $scope.forms = resp;
    }).error(function(resp){
      console.log(resp)
    });
});


