(function () {
    function createProgress(progress, element, radius) {
        var colors = {
            pink: '#E1499A',
            yellow: '#f0ff08',
            green: '#32e4dd'
        };

        var color = colors.green;

        var radius = radius || 50;
        var border = 3;
        var padding = radius / 2;
        var startPercent = 0;
        var endPercent = progress;

        var twoPi = Math.PI * 2;
        var formatPercent = d3.format('.0%');
        var boxSize = (radius + padding) * 2.2;

        var count = Math.abs((endPercent - startPercent) / 0.01);
        var step = endPercent < startPercent ? -0.01 : 0.01;

        var arc = d3
            .arc()
            .startAngle(0)
            .innerRadius(radius)
            .outerRadius(radius - border);
        var parent = d3.select(element);

        var svg = parent
            .append('svg')
            .attr('width', boxSize)
            .attr('height', boxSize);

        var defs = svg.append('defs');

        var filter = defs.append('filter').attr('id', 'blur');

        filter
            .append('feGaussianBlur')
            .attr('in', 'SourceGraphic')
            .attr('stdDeviation', '3');

        var g = svg
            .append('g')
            .attr('transform', 'translate(' + boxSize / 2 + ',' + boxSize / 2 + ')');

        var meter = g.append('g').attr('class', 'progress-meter');

        meter
            .append('path')
            .attr('class', 'background')
            .attr('fill', '#ccc')
            .attr('fill-opacity', 0.5)
            .attr('d', arc.endAngle(twoPi));

        var foreground = meter
            .append('path')
            .attr('class', 'foreground')
            .attr('fill', color)
            .attr('fill-opacity', 1)
            .attr('stroke', color)
            .attr('stroke-width', 5)
            .attr('stroke-opacity', 1)
            .attr('filter', 'url(#blur)');

        var front = meter
            .append('path')
            .attr('class', 'foreground')
            .attr('fill', color)
            .attr('fill-opacity', 1);

        var numberText = meter
            .append('text')
            .attr('fill', '#fff')
            .attr('text-anchor', 'middle')
            .attr('dy', '.35em');

        function updateProgress(progress) {
            foreground.attr('d', arc.endAngle(twoPi * progress));
            front.attr('d', arc.endAngle(twoPi * progress));
            numberText.text(formatPercent(progress));
        }

        var progress = startPercent;

        (function loops() {
            updateProgress(progress);

            if (count > 0) {
                count--;
                progress += step;
                setTimeout(loops, 10);
            }
        })();
    }

    angular
        .module('shipadoc', ['ngRoute', "ui.bootstrap.modal"])
        .value('apiUri', 'http://localhost:8080/api/')
        .directive('circle', function () {
            return {
                link: function (scope, element, attrs) {
                    console.log(attrs.percent);
                    createProgress(attrs.percent, element[0], 40);
                }
            };
        })
        .filter('to_trusted', [
            '$sce',
            function ($sce) {
                return function (text) {
                    return $sce.trustAsHtml(text);
                };
            }
        ])
        .factory('api', [
            '$http',
            'apiUri',
            function ($http, url) {
                return {
                    projects: function () {
                        return $http.get(url + 'projects');
                    },
                    project: function (id) {
                        return $http.get(url + 'projects/' + id);
                    },
                    fund: function(id){
                        return $http.get(url + 'projects/' + id+"/fund");
                    },
                    doctor: function (id) {
                        return $http.get(url + 'doctors/' + id);
                    }
                };
            }
        ])
        .config(function ($routeProvider) {
            $routeProvider
                .when('/', {
                    templateUrl: './views/main.html',
                    controller: 'mainController'
                })
                .when('/projects/:id', {
                    templateUrl: './views/project.html',
                    controller: 'projectController'
                });
        })
        .controller('mainController', [
            '$scope',
            'api',
            function ($scope, api) {
                api
                    .projects()
                    .then(function (res) {
                        var colsPerRow = 2;
                        $scope.projects = res.data.reduce(function (rows, key, index) {
                            key.index = index;
                            key.percent = Number(key.funded) / Number(key.requested);
                            if (key.percent > 1.0) {
                                key.percent = 1.0;
                            }
                            return (
                                (index % colsPerRow === 0
                                    ? rows.push([key])
                                    : rows[rows.length - 1].push(key)) && rows
                            );
                        }, []);
                        console.log($scope.projects);
                    })
                    .catch(function (err) {
                        $scope.error = err;
                        console.log(err);
                    });
            }
        ])
        .controller('projectController', [
            '$scope',
            '$routeParams',
            '$timeout',
            'api',
            function ($scope, $params, $timeout, api) {
                var previousProgress = 0;
                var load = function(){
                    api.project($params.id)
                        .then(function (res) {
                            console.log(res.data);
                            $scope.project = res.data;
                            $scope.project.raised = Number($scope.project.funded).toFixed(2);
                            $scope.project.requested = Number($scope.project.requested).toFixed(
                                2
                            );
                            $scope.project.due = moment($scope.project.due_date*1000);
                            $scope.project.daysLeft = $scope.project.due.diff(moment(),'days');
                            $scope.progress =
                                Number($scope.project.funded) / Number($scope.project.requested);
                            var converter = new showdown.Converter();
                            $scope.project.description = converter.makeHtml(
                                $scope.project.description
                            );

                            if($scope.progress - previousProgress > 0.01) {
                                console.log("hi");
                                $('div#content').empty();
                                createProgress($scope.progress, 'div#content', 50);
                                previousProgress = $scope.progress;
                            }
                            Promise.all($scope.project.interested.map(function (d) {
                                return api.doctor(d);
                            }))
                                .then(function (stuff) {
                                    console.log(stuff);
                                    $scope.doctors = stuff.map(function(d){
                                        return d.data;
                                    });
                                })
                                .catch(function (err) {
                                    console.log(err);
                                });
                        })
                        .catch(function (err) {
                            console.log(err);
                        });
                    //$timeout(load, 10000);
                };
                $scope.showDoctor = function(doctor){
                    console.log(doctor);
                    $scope.showDoctorModal = true;
                    $scope.selectedDoctor = doctor;
                };
                $scope.closeDoctor = function(){
                    $scope.showDoctorModal = false;
                }
                $scope.open = function () {
                    $scope.showModal = true;
                };

                $scope.ok = function () {
                    $scope.showModal = false;
                };

                $scope.cancel = function () {
                    $scope.showModal = false;
                };
                load();
                api.fund($params.id)
                    .then(function(res){
                        $scope.funding = res.data;
                    })
                    .catch(function(err){
                        console.log(err);
                    });

            }
        ]);

})();
