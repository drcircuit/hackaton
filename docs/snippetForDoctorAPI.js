return {
    doctors : function(specialities){
        return $http.get("https://api.betterdoctor.com/2016-03-01/doctors?query="+specialities+"&skip=2&limit=100&user_key=5e0a642f40c171b37bf212585bbb7d29");
    },
    specialties: function () {
        var results = [];
        var errors = [];
        return $http.get("https://api.betterdoctor.com/2016-03-01/specialties?skip=0&limit=100&user_key=" + key)
            .then(function(data){
                results = results.concat(data.data.data);
                sleep(500);
                return $http.get("https://api.betterdoctor.com/2016-03-01/specialties?skip=101&limit=100&user_key=" + key);
            })
            .then(function(data){
                results = results.concat(data.data.data);
                sleep(500);
                return $http.get("https://api.betterdoctor.com/2016-03-01/specialties?skip=201&limit=100&user_key=" + key);
            })
            .then(function(data){
                results = results.concat(data.data.data);
                sleep(500);
                return $http.get("https://api.betterdoctor.com/2016-03-01/specialties?skip=301&limit=100&user_key=" + key);
            })
            .then(function(data){
                results = results.concat(data.data.data);
                return new Promise(function(resolve, reject){
                    if(errors.length > 0){
                        reject(errors);
                    }
                    resolve(results);
                });
            })
            .catch(function(err){
                errors.push(err);
            })
    }
};