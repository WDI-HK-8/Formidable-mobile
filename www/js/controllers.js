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

.controller('FormsCtrl', function($scope, $auth, $window, $http, apiUrl) {
  
  var user_id = $scope.currentUser.id;

  $http.get(apiUrl + "/users/" + user_id + "/forms").success(
    function(resp){
      console.log(resp);
      $scope.forms = resp;
    }).error(function(resp){
      console.log(resp)
    });
})

.controller('ShowFormCtrl', function($scope, $stateParams, $http, apiUrl) {

  var user_id = $scope.currentUser.id;

  $http.get(apiUrl + "/forms/" + $stateParams.id).success(function(resp){
    console.log("Form infos",resp);
    $scope.form = resp;
    $scope.contents = resp.contents;

  }).error(function(resp){
    console.log(resp)
  });

  $scope.submits = {};

  $scope.submitAnswers = function() {
    $http.post(apiUrl + "/forms/" + $stateParams.id + "/submissions").success(function(resp){
      console.log("submission create",resp);
      console.log($scope.submits)
      
      var answer = {};
      
      submissionId = resp.id;
      $scope.contents.forEach(function(content) {
        answerValues = [$scope.submits[content.index]];
        answer = {
          submission_id: submissionId,
          values: answerValues
        }
        console.log("answer", answer)
        
        $http.post(apiUrl + '/contents/' + content.id + '/answers', answer).success(function(response) {
          console.log("response", response);
        });
      });

    }).error(function(resp){
      console.log(resp)
    });
  };

});


