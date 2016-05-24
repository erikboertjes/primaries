var stateInfoPanel;
var candidateInfoPanel;

var PANEL_X = 30;
var PANEL_Y = 100;

var NR_STATES_IN_CANDIDATE_PANEL = 10;

//add two panels (initially invisible) for showing state info and candidate info
function initInfoPanels() {
	stateInfoPanel = svg.append("g")
						.attr("visibility","hidden")
						.attr("transform", "translate(" + PANEL_X + "," + PANEL_Y + ")")
						.attr("class", "infoPanel");
	
	stateInfoPanel
		.append("rect")
		.attr("class","infoPanelBackground")
		.attr("width", 375)
		.attr("height", 140)
		.attr("x", -10)
		.attr("y", -10);
	
	stateInfoPanel
		.append("text")
		.attr("id","stateInfoPanelStateName")
		.attr("x", 0)
		.attr("y", 10);
		
	stateInfoPanel.selectAll(".stateInfoPanelScenarioLabel")
		//.data(scenarios)
		.data(["actual*","winner takes all","proportional"])
		.enter()
		.append("text")
		.attr("class","stateInfoPanelScenarioLabel")
		.attr("x", function(d,i) { return 60 + i*85; })
		.attr("y", 32)
		.text(function(d) { return d });
		
	stateInfoPanel.selectAll(".stateInfoPanelCandidateLabel")
		.data(candidates)
		.enter()
		.append("text")
		.attr("class","stateInfoPanelCandidateLabel")
		.attr("x",0)
		.attr("y", function(d,i) { return 50 + i*16 })
		.text(function(d) { return capitalizeFirstLetter(d); });
		
	stateInfoPanel
		.append("text")
		.attr("class","stateInfoPanelVotingSystemDescription")
		.attr("id","stateInfoPanelVotingSystemDescriptionLine1")
		.attr("x", 0)
		.attr("y", 105);
		
	stateInfoPanel
		.append("text")
		.attr("class","stateInfoPanelVotingSystemDescription")
		.attr("id","stateInfoPanelVotingSystemDescriptionLine2")
		.attr("x", 0)
		.attr("y", 117);
		
	candidateInfoPanel = svg.append("g")
						.attr("visibility","hidden")
						.attr("transform", "translate(" + PANEL_X + "," + PANEL_Y + ")")
						.attr("class", "infoPanel");
	
	candidateInfoPanel
		.append("rect")
		.attr("class","infoPanelBackground")
		.attr("x", -10)
		.attr("y", -10)
		.attr("width", 300)
		.attr("height", 220);
		
	candidateInfoPanel
		.append("text")
		.attr("id", "candidateInfoPanelCandidateName")
		.attr("x", 0)
		.attr("y", 10);
		
	candidateInfoPanel.selectAll(".candidateInfoPanelScenarioLabel")
		.data(scenarios)
		.enter()
		.append("text")
		.attr("class","candidateInfoPanelScenarioLabel")
		.attr("x", function(d,i) { return 100 + i*50; })
		.attr("y", 32)
		.text(function(d) { return d });
}

function showStateInfo(state) {

	initInfoPanels();
	stateInfoPanel.select("#stateInfoPanelStateName")
		.text(function() { return state.abbreviation + " | " + state.label
			+ " | " + state.delegates + " delegates"
			+ " | " + formatDate(state.date) ; });

	//clear all numbers
	stateInfoPanel.selectAll(".stateInfoPanelDelegateCount").remove();
	
	var voteList = getVotes({state:state.state});
	
	
	stateInfoPanel.selectAll(".stateInfoPanelDelegateCount")
		.data(voteList, function(d) { return d.state + "_" + d.candidate + "_" + d.scenario; })
		.enter()
		.append("g")
		.attr("class","stateInfoPanelDelegateCount")
		.attr("transform", function(d) {
			var x = 58 + scenarios.indexOf(d.scenario) * 85;
			var y = 37 + candidates.indexOf(d.candidate) * 16;
			return "translate(" + x + "," + y + ")";
		})
		.each(function(d) {
			//background, highlight if number's scheme corresponds to selected story
			d3.select(this)
				.append("rect")
				.attr("width", 40)
				.attr("height", 16)
				.attr("fill", function() {
					var state = $.grep(states, function(o) { return o.state == d.state })[0];
					return (state.scenario == d.scenario) ? HIGHLIGHT_COLOR : "none";
				})
				.attr("opacity",0.5);
				
			d3.select(this)
				.append("text")
				.attr("x",2)
				.attr("y",14)
				.text(function(d) {return d.delegates;});
		})

	stateInfoPanel.selectAll(".stateInfoPanelDelegateCount")
		.data(voteList, function(d) { return d.state + "_" + d.candidate + "_" + d.scenario; })
		.exit()
		.remove();
		
	stateInfoPanel.select("#stateInfoPanelVotingSystemDescriptionLine1")
		.text(function() {
			return state.votingsystem1 == "" ? "" : "* " + state.votingsystem1;
		});
		
	stateInfoPanel.select("#stateInfoPanelVotingSystemDescriptionLine2")
		.text(function() { return state.votingsystem2 });
		
	stateInfoPanel
		.attr("visibility","visible");
}

function hideStateInfo() {
	stateInfoPanel
		.attr("visibility","hidden");
	removeInfoPanels();
}

function showCandidateInfo(candidate) {
	initInfoPanels();
	candidateInfoPanel.select("#candidateInfoPanelCandidateName")
		.text(function() { return capitalizeFirstLetter(candidate)
			+ " | " + getNrOfDelegates(candidate) + " delegates"
			+ " | top " + NR_STATES_IN_CANDIDATE_PANEL + " states:"});
	
	var topStates = getStatesWithHighestNrOfDelegates(candidate, NR_STATES_IN_CANDIDATE_PANEL);
	//get votes for this candidate for the top states
	var voteList = [];
	for (var i=0; i<topStates.length; i++) {
		voteList = voteList.concat(getVotes({state:topStates[i].state, candidate:candidate}));
	}
	
	//clear all numbers
	candidateInfoPanel.selectAll(".candidateInfoPanelStateLabel").remove();
	
	candidateInfoPanel.selectAll(".candidateInfoPanelStateLabel")
		.data(topStates, function(d) { return d.state })
		.enter()
		.append("text")
		.attr("class","candidateInfoPanelStateLabel")
		.attr("x",0)
		.attr("y", function(d,i) { return 50 + i*16 })
		.text(function(d) { return d.label });
		
	//clear all values
	candidateInfoPanel.selectAll(".candidateInfoPanelDelegateCount").remove();

	candidateInfoPanel.selectAll(".candidateInfoPanelDelegateCount")
		.data(voteList, function(d) { return d.state + "_" + d.candidate + "_" + d.scenario; })
		.enter()
		.append("g")
		.attr("class","candidateInfoPanelDelegateCount")
		.attr("transform", function(d) {
			var x = 98 + scenarios.indexOf(d.scenario) * 50;
			var index = -1;
			for (var i=0; i<topStates.length; i++) {
				if (topStates[i].state == d.state) {
					index = i;
					break;
				}
			}
			var y =  37 + index * 16;
			return "translate(" + x + "," + y + ")";
		})
		.each(function(d) {
			d3.select(this)
				.append("rect")
				.attr("x", 0)
				.attr("y", 0)
				.attr("width", 40)
				.attr("height", 16)
				.attr("fill", function() {
					var state = $.grep(states, function(o) { return o.state == d.state })[0];
					return (state.scenario == d.scenario) ? HIGHLIGHT_COLOR : "none";
				})
				.attr("opacity",0.5);
				
			d3.select(this)
				.append("text")
				.attr("x",2)
				.attr("y",14)
				.text(function(d) {return d.delegates;})
		});
		
		

	candidateInfoPanel
		.attr("visibility","visible");
}

function hideCandidateInfo() {
	candidateInfoPanel
		.attr("visibility","hidden");
	removeInfoPanels();
}

function removeInfoPanels() {
	svg.selectAll(".infoPanel").remove();
}