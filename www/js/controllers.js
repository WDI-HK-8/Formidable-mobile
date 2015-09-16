angular.module('starter.controllers', [])

.controller('AppCtrl', function($scope, $auth, $window, $state) {
  var validateUser = function(){
    $scope.currentUser = JSON.parse($window.localStorage.getItem('current-user'));
    console.log("current user:", $scope.currentUser)
  };
  validateUser();

  $scope.logout = function(){
    $window.localStorage.setItem('current-user', null);
    validateUser();
    $state.go('app.login');
  };
})

.controller('LogInCtrl', function($scope, $auth, $window, $ionicPopup, $state) {

  var validateUser = function(){
    $scope.currentUser = JSON.parse($window.localStorage.getItem('current-user'));
    console.log("current user:", $scope.currentUser)
  };

  // Login
  $scope.loginData = {};

  $scope.doLogin = function() {

    $auth.submitLogin($scope.loginData).then(function(resp){
      console.log(resp);

      $window.localStorage.setItem('current-user', JSON.stringify(resp));
      validateUser();

      $state.go('app.forms');
      $scope.loginData = {};

    }).catch(function(resp){
      console.log(resp);
      $ionicPopup.alert({
        title: 'Could not login',
        template: 'Please try again'
      });
    });
  };

  // Logout
  $scope.logout = function(){
    $window.localStorage.setItem('current-user', null);
    validateUser();
  };

})

.controller('FormsCtrl', function($scope, $auth, $window, $http, apiUrl) {
  var validateUser = function(){
    $scope.currentUser = JSON.parse($window.localStorage.getItem('current-user'));
    console.log("current user:", $scope.currentUser)
  };
  validateUser();
  
  var user_id = $scope.currentUser.id;

  $scope.getForms = function(){
    // Get list of forms for current user
    $http.get(apiUrl + "/users/" + user_id + "/forms").success(function(resp){
        console.log(resp);
        $scope.forms = resp;
    }).error(function(resp){
      console.log(resp)
    }).finally(function() {
      $scope.$broadcast('scroll.refreshComplete')
    });
  }

  $scope.getForms();
})

.controller('ShowFormCtrl', function($scope, $stateParams, $http, apiUrl, $ionicPopup, $state, $ionicModal) {

  var user_id = $scope.currentUser.id;

  // Get list of fields for 1 form
  var options = [];

  $http.get(apiUrl + "/forms/" + $stateParams.id).success(function(resp){
    console.log("Form infos",resp);
    $scope.form = resp;
    $scope.contents = resp.contents;

    $scope.contents.forEach(function(content) {
      if (content.options !== null) {
        content.options.forEach(function(option) {
          var hash = {'name': option, checked: false}
          options.push(hash);
        });
        content.options = options;
        options = [];
        console.log('refined options ',content.options,options);
      }
    });

  }).error(function(resp){
    console.log(resp)
  });

  // Submit answers
  $scope.submits = {};
  $scope.likeSubmits = {};
  $scope.signature = null;

  $scope.submitAnswers = function() {
    var random = {submission: {signature: $scope.signature}};
    // Create a submission
    $http.post(apiUrl + "/forms/" + $stateParams.id + "/submissions", random).success(function(resp){
      console.log("submission create",resp);
      
      // Add each answer for each field into an object called hash
      var answers = {};
      submissionId = resp.id;

      $scope.contents.forEach(function(content) {
        
        // Get answer from text/textarea fields
        if(content.category == 'text' || content.category == 'textarea'){
          $scope.likeSubmits[content.index] = [$scope.submits[content.index]];
        }

        // Get answer from dropdown fields or radio fields
        if(content.category == 'dropdown') {
          if($scope.submits[content.index]) {
            $scope.likeSubmits[content.index] = [$scope.submits[content.index]['name']];
          }
        }

        // Get answer from checkbox fields
        if(content.category == 'checkbox' || content.category == 'radio') {
          $scope.likeSubmits[content.index] = []
          content.options.forEach(function(option) {
            if(option.checked) {
              $scope.likeSubmits[content.index].push(option.name);
            }
          });
        }
        console.log($scope.likeSubmits)

        if(content.category != 'description') {
          answerValues = $scope.likeSubmits[content.index];
          answers[content.id] = answerValues;
        }
      });
      console.log("answers", answers)

      var hash = {answers: answers}
      
      // Submit the hash to submissions
      $http.post(apiUrl + '/submissions/' + submissionId + '/answers', hash).success(function(response) {
        console.log("response", response);
        
        // Popup success after submitting
        $ionicPopup.alert({
          title: 'Success',
          template: 'Form answers successfully submitted'
        }).then(function(){
          $state.go('app.forms');
        });
      });

    }).error(function(resp){
      console.log(resp)
      $ionicPopup.alert({
        title: 'Error',
        template: 'Error while submitting. Please try again.'
      });
    });
  };

  var signaturePad;
  var canvas;
 
  $scope.clearCanvas = function() {
      signaturePad.clear();
  };
 
  $scope.saveCanvas = function() {
      if(signaturePad.isEmpty()) {
        $ionicPopup.alert({
          title: 'Error',
          template: 'Please sign the page'
        });
      } else {
        $scope.signature = signaturePad.toDataURL();
        $scope.closeSignatureModal();
        $scope.submitAnswers();
      }
  };
 
  $scope.resizeCanvas = function() {
    var ratio = 1.0;
    canvas.width = canvas.offsetWidth * ratio;
    canvas.height = canvas.offsetHeight * ratio;
    canvas.getContext('2d').scale(ratio, ratio);
  };
 
  $scope.showSignatureModal = function() {
    $ionicModal.fromTemplateUrl("templates/signature.html", {
      scope: $scope,
      animation: 'slide-in-up'
    }).then(function(modal) {
      $scope.signatureModal = modal;
      $scope.signatureModal.show();
      canvas = angular.element($scope.signatureModal.modalEl).find('canvas')[0];
      $scope.resizeCanvas();
      signaturePad = new SignaturePad(canvas, {
        minWidth: 1,
        maxWidth: 1.5
      });
    });
  };
 
  $scope.closeSignatureModal = function() {
    $scope.signatureModal.hide();
    $scope.signatureModal.remove();
    signaturePad = canvas = $scope.signatureModal = null;
  };

})

.controller('SubmissionsCtrl', function($scope, $stateParams, $http, apiUrl) {
  var user_id = $scope.currentUser.id;

  $scope.getForms = function(){
    // Get list of forms for current user
    $http.get(apiUrl + "/users/" + user_id + "/forms").success(function(resp){
        console.log(resp);
        $scope.forms = resp;
    }).error(function(resp){
      console.log(resp)
    }).finally(function() {
      $scope.$broadcast('scroll.refreshComplete')
    });
  }

  $scope.getForms();
})

.controller('FormSubmissionsCtrl', function($scope, $stateParams, $http, apiUrl) {

  // Get the form name
  $http.get(apiUrl + "/forms/" + $stateParams.id).success(function(resp){
    console.log("Form infos",resp);
    $scope.form = resp;

  }).error(function(resp){
    console.log(resp)
  });

  $scope.getSubmissions = function(){
    // Get list of submissions for 1 form
    $http.get(apiUrl + "/forms/" + $stateParams.id + "/submissions").success(
      function(resp){
        console.log("list submissions",resp);
        $scope.submissions = resp;

    }).error(function(resp){
        console.log(resp)
    }).finally(function() {
      $scope.$broadcast('scroll.refreshComplete')
    });
  }

  $scope.getSubmissions();
})

.controller('AnswersSubmissionCtrl', function($scope, $stateParams, $http, apiUrl) {

  // Get list of answers for 1 submission
  $http.get(apiUrl + "/submissions/" + $stateParams.id).success(
    function(resp){
      console.log("submission infos",resp);
      $scope.answers = resp.answers;
      $scope.signature = resp.signature;
      // Get content label for each answer
      $scope.answers.forEach(function(answer){

        var contentId = answer.content_id;
        
        $http.get(apiUrl + "/contents/" + contentId).success(function(resp){
          console.log(resp);
          answer.label = resp.label
        });

        // Transform answers (arrays) into string
        answer.values = answer.values.join(", ")
      });

  }).error(function(resp){
      console.log(resp)
  });
});


