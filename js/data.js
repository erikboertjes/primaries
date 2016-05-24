var states = [];
var votes = [];
var candidates = [];
var scenarios = ["actual","wta","proportional"];

var stories = [
	{id:"actual", label:"Actual",
		explanationLine1:"Actual situation: some states follow some sort of 'Winner Takes All' principle, others divide delegates proportionally",
		explanationLine2:"to the number of popular votes, and many have a hybrid version, with ceilings and thresholds."
	},
	{id:"wta", label: "Winner Take All",
		explanationLine1: "What if all states follow the 'Winner Take All' scheme?",
		explanationLine2: "All delegates go the the candidate with the highest number of popular votes."
	},
	{id:"proportional", label: "Proportional",
		explanationLine1: "What if all states divide delegates proportionally to the number of popular votes (without a threshold or a ceiling)?",
		explanationLine2: ""
	},
	{id:"trump", label: "Optimize for Trump",
		explanationLine1: "Assign a voting system (i.e. 'Winner Take All' or 'proportional') to each state, in a way that is most favourable for Trump",
		explanationLine2: "(the letters below each state indicate the chosen system: 'w' for Winner Take All, 'p' for Proportional)"
	},
	{id:"cruz", label: "Optimize for Cruz",
		explanationLine1: "Assign a voting system (i.e. 'Winner Take All' or 'proportional') to each state, in a way that is most favourable for Cruz",
		explanationLine2: "(the letters below each state indicate the chosen system: 'w' for Winner Take All, 'p' for Proportional)"
	},
	{id:"kasich", label: "Optimize for Kasich",
		explanationLine1: "Assign a voting system (i.e. 'Winner Take All' or 'proportional') to each state, in a way that is most favourable for Kasich",
		explanationLine2: "(the letters below each state indicate the chosen system: 'w' for Winner Take All, 'p' for Proportional)"
	}
];

var sortCriteria = [
	{id:"time", label:"Voting date",
		explanationLine1: "Order according to moment of voting",
		explanationLine2: ""
	},
	{id:"size", label:"Size",
		explanationLine1: "Order according to total number of delegates",
		explanationLine2: ""
	},
	{id:"trump", label:"Dlgts for Trump",
		explanationLine1: "Order according to number of delegates received by Trump (in the selected scenario)",
		explanationLine2: ""
	},
	{id:"cruz", label:"Dlgts for Cruz",
		explanationLine1: "Order according to number of delegates received by Cruz (in the selected scenario)",
		explanationLine2: ""
	},
	{id:"kasich", label:"Dlgts for Kasich",
		explanationLine1: "Order according to number of delegates received by Kasich (in the selected scenario)",
		explanationLine2: ""
	}
];

function loadData(callbackFunction) {
	var dateFormat = d3.time.format("%Y-%m-%d"); //2016-03-01
	d3.csv("data/states.csv",
	//d3.csv("data/states_small.csv",
		function(d) {
			if (dateFormat.parse(d.date) <= new Date() //ignore states that did not have elections yet
				&& d.state != "puerto rico" && d.state != "colorado"
				&& d.state != "american samoa" && d.state != "north dakota"
				&& d.state != "guam" && d.state != "virgin islands") { //and states that have unbound elections
				return {
					state: d.state,
					date: dateFormat.parse(d.date),
					delegates: +d.delegates_total,
					abbreviation: d.abbreviation,
					label: d.label,
					votingsystem1: d.votingsystem_1,
					votingsystem2: d.votingsystem_2
				}
			}
		},
		function(error, rows) {
			states = rows;
			d3.csv("data/votes.csv",
			//d3.csv("data/votes_small.csv",
				function(d) { //check if vote is in a state that has had elections yet
					if ($.grep(states, function(o) { return o.state == d.state }).length > 0) {
						return {
							state: d.state,
							candidate: d.candidate,
							delegates: Math.round(+d.delegates),
							scenario: d.scenario
						}
					}
				},
				function(error, rows) {
					votes = rows;
					candidates = getCandidateNames();
					callbackFunction();
				})
		})
}

function getVotes(query) {
	var results = [];
	for (var i=0; i<votes.length; i++) {
		if ((!query.candidate || votes[i].candidate == query.candidate)
		 && (!query.state || votes[i].state == query.state)
		 && (!query.scenario || votes[i].scenario == query.scenario)) {
		 	results.push(votes[i]);
		 }
	}
	return results;
}

function getCandidateNames() {
	var cList = [];
	//use the first state to get candidate names
	var voteList = getVotes({state:states[0].state, scenario:"actual"});
	for (var i=0; i<voteList.length; i++) {
		if (cList.indexOf(voteList[i].candidate) == -1) cList.push(voteList[i].candidate);
	}
	return cList;
}

function getRemainingNrDelegates(state) {
	var votesInThisState = getVotes({state:state.state, scenario:state.scenario});
	var sumDelegates = 0;
	for (var i=0; i<votesInThisState.length; i++) {
		sumDelegates += votesInThisState[i].delegates;
	}
	return state.delegates - sumDelegates;
}

function getIndexOfState(stateName) {
	var index = -1;
	for (var i=0; i<states.length; i++) {
		if (states[i].state == stateName) {
			index = i;
			break;
		}
	}
	return index;
}

function getNrOfDelegates(candidate, story) {
	var sumDelegates = 0;
	for (var i=0; i<states.length; i++) {
		var scenario = (story == "actual") ? "actual" : states[i].scenario;
		sumDelegates += getVotes({candidate:candidate, state:states[i].state, scenario:scenario})[0].delegates;
	}
	return sumDelegates;
}

function sortStates(criterium) {
	//sort states according to criterium, in given scenario
	states.sort(function(a,b) {
		switch(criterium) {
			case "time": //sort on increasing date, within that: on alphabet
				return a.date < b.date ? -1 :
					a.date > b.date ? 1 :
					a.state < b.state ? -1 : 1;
				break;
			case "size": //sort on descreasing number of delegates, within that: on alphabet
				return a.delegates > b.delegates ? -1 :
					a.delegates < b.delegates ? 1 :
					a.state < b.state ? -1 : 1;
				break;
			case "trump": //sort on decreasing nr of delegates, within that: on alphabet
				var votesA = getVotes({state:a.state, candidate:"trump", scenario:a.scenario})[0].delegates;
				var votesB = getVotes({state:b.state, candidate:"trump", scenario:b.scenario})[0].delegates;
				return votesA > votesB ? -1 :
					votesA < votesB ? 1 :
					a.state < b.state ? -1 : 1;
				break;
			case "cruz": //sort on decreasing nr of delegates, within that: on alphabet
				var votesA = getVotes({state:a.state, candidate:"cruz", scenario:a.scenario})[0].delegates;
				var votesB = getVotes({state:b.state, candidate:"cruz", scenario:b.scenario})[0].delegates;
				return votesA > votesB ? -1 :
					votesA < votesB ? 1 :
					a.state < b.state ? -1 : 1;
				break;
			case "kasich": //sort on decreasing nr of delegates, within that: on alphabet
				var votesA = getVotes({state:a.state, candidate:"kasich", scenario:a.scenario})[0].delegates;
				var votesB = getVotes({state:b.state, candidate:"kasich", scenario:b.scenario})[0].delegates;
				return votesA > votesB ? -1 :
					votesA < votesB ? 1 :
					a.state < b.state ? -1 : 1;
				break;
		}
	});
}

function setScenarioForStates(story) {
	switch(story.id) {
		case "actual":
		case "wta":
		case "proportional":
			for (var i=0; i<states.length; i++) states[i].scenario = story.id;
			break;
		case "trump":
		case "cruz":
		case "kasich":
			optimizeScenarioForCandidate(story.id);
			break;
	}

}

function optimizeScenarioForCandidate(candidate) {
	for (var i=0; i<states.length; i++) {
		//if candidate has votes in wta scenario, set scenario to wta for that state,
		//else set it to proportional
		states[i].scenario =
			getVotes({state:states[i].state, candidate:candidate, scenario:"wta"})[0].delegates > 0 ? "wta"
																																															: "proportional";
	}
}

//this function is used for the info window, when a candidate is selected.
//it takes the top n states from the votes, those are the states with the
//highest number of delegates for the given candidate according to the state's current scenario
function getStatesWithHighestNrOfDelegates(candidate, n) {
	//you don't want the actual states array to be sorted, because that would change the order of the states in the GUI
	var statesCopy = states.slice();
	statesCopy.sort(function(a,b) {
		var votesA = getVotes({state:a.state, candidate:candidate, scenario:a.scenario})[0].delegates;
		var votesB = getVotes({state:b.state, candidate:candidate, scenario:b.scenario})[0].delegates;
		return votesA > votesB ? -1 : 1; //sort on decreasing nr of delegates
	});
	return statesCopy.slice(0,n);
}
