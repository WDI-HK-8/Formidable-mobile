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

.controller('ShowFormCtrl', function($scope, $stateParams, $http, apiUrl, $ionicPopup, $state) {

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
      
      var answers = {};
      
      submissionId = resp.id;
      
      $scope.contents.forEach(function(content) {
        answerValues = [$scope.submits[content.index]];
        answers[content.id] = answerValues;
        
      });

      console.log("answers", answers)

      var hash = {answers: answers}
      
      $http.post(apiUrl + '/submissions/' + submissionId + '/answers', hash).success(function(response) {
        console.log("response", response);
      });

      $ionicPopup.alert({
        title: 'Success',
        template: 'Form answers successfully submitted'
      }).then(function(){
        $state.go('app.forms');
      });
    }).error(function(resp){
      console.log(resp)
      $ionicPopup.alert({
        title: 'Error',
        template: 'Error while submitting. Please try again.'
      });
    });
  };

})

.controller('SubmissionsCtrl', function($scope, $stateParams, $http, apiUrl) {
  var user_id = $scope.currentUser.id;

  $http.get(apiUrl + "/users/" + user_id + "/forms").success(
    function(resp){
      console.log("list forms",resp);
      var forms = resp;
      
      forms.forEach(function(form) {

        $http.get(apiUrl + "/forms/" + form.id + "/submissions").success(
          function(resp){
            console.log("list submissions for 1 form",resp);
            $scope.submissions = resp;
            $scope.submissions.forEach(function(submission) {
              submission.name = form.name;
            });
        }).error(function(resp){
            console.log(resp)
        });
      });

    }).error(function(resp){
      console.log(resp)
    });
});


