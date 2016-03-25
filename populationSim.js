// initialize global variables


// main
$(document).ready(function(){


    $("#startingPop").val(2);
    $("#startingAge").val(18);

    $("#birthrate").val(2);

    $("#fertilityRate").val(4);
    $("#firstChildAge").val(24);
    $("#minAge").val();
    $("#maxAge").val();

    $("#avgLifespan").val(67);
    $("#childhoodMortality").val(0);

    $("#simLength").val(100);
    $("#simSpeed").val(50);

    $("#stopSimBtn").hide();
    var stopSim = false;

    $("#descriptionBtn").click(function() {
        $.ajax({
            url: "README.md",
            context: document.body,
            success: function(readMeHTML){
                var converter = new showdown.Converter();
                $("#description-content").html(converter.makeHtml(readMeHTML));
            }
        });
    });

    $("#startSimBtn").click(function() {
        stopSim = false;
        $("#startSimBtn").hide();
        $("#stopSimBtn").show();
        var $outputElem = $("#simResultDiv");
        $outputElem.html("");

        // gather inputs
        var startingPop = parseInt($("#startingPop").val());
        var avgStartingAge = parseInt($("#startingAge").val());
        var birthrate = parseInt($("#birthrate").val());

        var birthModeByNumKids = $("#byNumKids").is(':checked');
        var fertilityRate = parseInt($("#fertilityRate").val());
        var firstChildAge = parseInt($("#firstChildAge").val());
        var minAge = parseInt($("#minAge").val());
        var maxAge = parseInt($("#maxAge").val());

        var deathAge = parseInt($("#avgLifespan").val());
        var childhoodMortalityRate = parseInt($("#childhoodMortality").val());

        var simLength = parseInt($("#simLength").val());
        var simSpeed = parseInt($("#simSpeed").val());

        // we assume that half the people born in any given year are women
        // we will use this variable to toggle whether or not there is an extra woman in years with an odd number
        // I'm giving a head start by saying the first
        var nextKidIsAGirl = true;

        // track the popluation by sim year
        var simulationResults = [];
        // track the number of deaths
        var deadPeople = 0;
        
        // initialize population array which will break down the population by age.
        // conveniently array[0] -> age 0, array[21] -> age 21, array[65] -> age 65, etc.
        var currentPop = startingPop;
        var population = [];
        for (var x = 0; x < deathAge; x++) {
            population.push(0);
        }
        
        // create starting population
        // TODO: populate based on avg age and std deviation
        // -1 because the first thing we do in our simYear is age everyone; so -1 to startingAge to compensate
        population[avgStartingAge-1] = startingPop;
        
        // for the purposes of simulation everyone will give birth on the same years following the average birth rate.
        var birthingAges = [];
        if (birthModeByNumKids) {
            for (x = 0; x < fertilityRate; x++) {
                birthingAges.push(firstChildAge + (x * birthrate));
            }
        } else {
            for (x = minAge; x < maxAge; x++) {
                if ((x - minAge) % birthrate === 0) {
                    birthingAges.push(x);
                }
            }
        }
        
        var populationGraphData = [[0,startingPop]];
        var birthGraphData = [[0,0]];
        var deathGraphData = [[0,0]];
        var populationGraph = new Dygraph(document.getElementById("populationGraph"), populationGraphData, {
            labels: [ "simYear", "Population" ],
            showRangeSelector: true,
            title: 'Population over time',
            xlabel: 'SimYears',
            ylabel: 'Population',
            legend: 'always',
        });
        var birthGraph = new Dygraph(document.getElementById("birthGraph"), birthGraphData, {
            labels: [ "simYear", "Births" ],
            showRangeSelector: true,
            title: 'Births over time',
            xlabel: 'SimYears',
            ylabel: 'Births',
            legend: 'always',
        });
        var deathGraph = new Dygraph(document.getElementById("deathGraph"), deathGraphData, {
            labels: [ "simYear", "Deaths" ],
            showRangeSelector: true,
            title: 'Deaths over time',
            xlabel: 'SimYears',
            ylabel: 'Deaths',
            legend: 'always',
        });

        //for (; simYear < simLength; simYear++) 
        var simYear = 0;
        function simulateYear() {
            // make room for a new round of infants
            population.unshift(0)
        
            // for each age at which women give birth
            _.each(birthingAges, function(birthingAge) {
                // get # people of at the birthing age
                var people = population[birthingAge];
                // assume half are women
                var mothers = 0;
                if (people % 2 === 0) {
                    mothers = people / 2
                }
                else {
                    if (nextKidIsAGirl) {
                        mothers = Math.ceil(people / 2);
                    } else {
                        mothers = Math.floor(people / 2);
                    }
                    nextKidIsAGirl = !nextKidIsAGirl;
                }

                var stillBorns = 0;
                if (childhoodMortalityRate > 0) {
                    for (var x = 0; x < mothers; x++) {
                        if (randomEvent(childhoodMortalityRate)) {
                            stillBorns++;
                        }
                    }
                }

                // make babies! (population age 0)
                population[0] += mothers-stillBorns;
            });

            // kill old people and gather yearly population info 
            var currentYearDeaths = population.pop();
            deadPeople += currentYearDeaths;
            var currentYearPopulation = _.reduce(population, function(population, yearlyPop){ return population + yearlyPop; }, 0);
            
            simulationResults[simYear] = {
                births: population[0],
                deaths: currentYearDeaths,
                population: currentYearPopulation
            };
            
            simYear++;
            populationGraphData.push([simYear, currentYearPopulation]);
            birthGraphData.push([simYear, population[0]]);
            deathGraphData.push([simYear, currentYearDeaths]);
            populationGraph.updateOptions( { 'file': populationGraphData } );
            birthGraph.updateOptions( { 'file': birthGraphData } );
            deathGraph.updateOptions( { 'file': deathGraphData } );
            
            if ( simYear < simLength && !stopSim ){
                setTimeout( simulateYear, simSpeed );
            }
            else {
                $("#startSimBtn").show();
                $("#stopSimBtn").hide();
            }
            //$outputElem.append("Year " + (simYear+1) + ": " + JSON.stringify(simulationResults[simYear]) + "<br/>");
            $("#resultSummaryDiv").html("<h2>Current Population: " + currentYearPopulation + " Dead People: " + deadPeople + "</h2>");
        };
        
        simulateYear();
    });

    $("#stopSimBtn").click(function() {
        stopSim = true;
    });
});

randomEvent = function (pctChanceOfHappening) {
    if (pctChanceOfHappening > 0) {
        var randomNumUpToOneHundred = Math.floor(Math.random() * 100);
        if (randomNumUpToOneHundred < pctChanceOfHappening) {
            return true;
        }
    }
    return false;
}

coinFlip = function () {
    return (Math.floor(Math.random() * 2) === 0);
}