(function(){
    angular.module("shipadoc",["ngRoute"])
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