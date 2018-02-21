(function(){
    angular.module("shipadoc",["ngRoute"])
        .value("apiUri", "http://localhost:8080/api/")
        .factory("api", ["$http", function($http){

        }])
        .config(function($routeProvider){
            $routeProvider
                .when("/", {
                    templateUrl : "./views/main.html",
                    controller: "mainController"
                })
        })
        .controller("mainController", ["$scope",function($scope){

        }]);
})();