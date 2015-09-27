module = angular.module "issueMaps", ["ui.router", "uiGmapgoogle-maps"]

module.config ($stateProvider, $urlRouterProvider)->

  $urlRouterProvider.otherwise "/"

  $stateProvider
  .state "home",
    url: "/"
    templateUrl: "templates/_home.html"

module.factory "Issue", require "./services/issue"
module.controller "MapController", require "./controllers/map_controller"