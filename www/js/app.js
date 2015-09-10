angular.module('starter', ['ionic', 'starter.controllers', 'ng-token-auth'])

.run(function($ionicPlatform) {
  $ionicPlatform.ready(function() {

    if (window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      cordova.plugins.Keyboard.disableScroll(true);

    }
    if (window.StatusBar) {

      StatusBar.styleDefault();
    }
  });
})

.config(function($stateProvider, $urlRouterProvider, $authProvider) {
  $stateProvider

    .state('app', {
    url: '/app',
    abstract: true,
    templateUrl: 'templates/menu.html',
    controller: 'AppCtrl'
  })

  .state('app.login', {
    url: '/login',
    views: {
      'menuContent': {
        templateUrl: 'templates/login.html',
        controller: 'LogInCtrl'
      }
    }
  })

  .state('app.forms', {
    url: '/forms',
    views: {
      'menuContent': {
        templateUrl: 'templates/forms/index.html',
        controller: 'FormsCtrl'
      }
    }
  })

  .state('app.singleForm', {
    url: '/forms/:id',
    views: {
      'menuContent': {
        templateUrl: 'templates/forms/show.html',
        controller: 'ShowFormCtrl'
      }
    }
  })

  .state('app.submissions', {
    url: '/submissions',
    views: {
      'menuContent': {
        templateUrl: 'templates/submissions/index.html',
        controller: 'SubmissionsCtrl'
      }
    }
  });

  $urlRouterProvider.otherwise('/app/login');

  $authProvider.configure({
    apiUrl: 'http://localhost:3000' || 'https://formidableforms.herokuapp.com'
  });
})

.constant('apiUrl', 'http://localhost:3000' || 'https://formidableforms.herokuapp.com');
