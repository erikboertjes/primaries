//add buttons for choosing scenario, and ordering of states

var BUTTON_SCENARIO_WIDTH = 110;
var BUTTON_SORT_WIDTH = 110;
var BUTTON_HEIGHT = 20;

var BUTTON_AREA_SCENARIO_X = 20;
var BUTTON_AREA_SCENARIO_Y = 640;

var BUTTON_AREA_SORT_X = 750;
var BUTTON_AREA_SORT_Y = 640;

var scenarioButtons;
var sortButtons;

function initButtons() {
	
	//scenario buttons
	
	scenarioButtons = svg.append("g")
		.attr("transform", "translate(" + BUTTON_AREA_SCENARIO_X + "," + BUTTON_AREA_SCENARIO_Y + ")");
	
	scenarioButtons
		.append("text")
		.attr("class","buttonHeading")
		.attr("x", 0)
		.attr("y", 10)
		.text("Scenario");
		
	scenarioButtons
		.append("text")
		.attr("class","buttonSubHeading")
		.attr("x", 60)
		.attr("y", 10)
		.text("(click to select)");
		
	scenarioButtons.selectAll(".scenarioButton")
		.data(stories)
		.enter()
		.append("g")
		.attr("class","scenarioButton")
		.attr("transform", function(d,i) {
			var x = i*(BUTTON_SCENARIO_WIDTH + 2);
			var y = 18;
			return "translate(" + x + "," + y + ")";
		})
		.each(function(d) {
			d3.select(this)
				.append("rect")
				.attr("width", BUTTON_SCENARIO_WIDTH)
				.attr("height", BUTTON_HEIGHT);
				
			d3.select(this)
				.append("text")
				.attr("class","buttonLabel")
				.attr("x", 3)
				.attr("y", 14)
				.text(function(d) {
					return d.label;
				});
		})
		.on("click", function(d) {
			selectedStory = d;
			setScenarioForStates(selectedStory);
			sortStates(selectedSortCriterium);
			visualize();
		})
		.on("mouseover", function(d) {
			//show explanation about hovered scenario
			d3.select("#scenarioExplanationLine1")
				.attr("visibility","visible")
				.text(function() {return d.explanationLine1});
			d3.select("#scenarioExplanationLine2")
				.attr("visibility","visible")
				.text(function() {return d.explanationLine2});
		})
		.on("mouseout", function(d) {
			d3.select("#scenarioExplanationLine1")
				.attr("visibility","hidden");
			d3.select("#scenarioExplanationLine2")
				.attr("visibility","hidden");
			
		})

	//explanation field
	scenarioButtons
		.append("text")
		.attr("class", "explanationLine")
		.attr("id", "scenarioExplanationLine1")
		.attr("x", 0)
		.attr("y", BUTTON_HEIGHT + 34)
		.attr("visibility","hidden");
		
	scenarioButtons
		.append("text")
		.attr("class", "explanationLine")
		.attr("id", "scenarioExplanationLine2")
		.attr("x", 0)
		.attr("y", BUTTON_HEIGHT + 50)
		.attr("visibility","hidden");
		
			
	
	//state sort buttons
	
	sortButtons = svg.append("g")
		.attr("transform", "translate(" + BUTTON_AREA_SORT_X + "," + BUTTON_AREA_SORT_Y + ")");
	
	sortButtons
		.append("text")
		.attr("class","buttonHeading")
		.attr("x", 0)
		.attr("y", 10)
		.text("Sort states");
		
	sortButtons
		.append("text")
		.attr("class","buttonSubHeading")
		.attr("x", 75)
		.attr("y", 10)
		.text("(click to select)");
		
	sortButtons.selectAll(".sortButton")
		.data(sortCriteria)
		.enter()
		.append("g")
		.attr("class","sortButton")
		.attr("transform", function(d,i) {
			var x = i*(BUTTON_SORT_WIDTH + 2);
			var y = 18;
			return "translate(" + x + "," + y + ")";
		})
		.each(function(d) {
			d3.select(this)
				.append("rect")
				.attr("width", BUTTON_SORT_WIDTH)
				.attr("height", BUTTON_HEIGHT);
				
			d3.select(this)
				.append("text")
				.attr("class","buttonLabel")
				.attr("x", 3)
				.attr("y", 14)
				.text(function(d) {
					return d.label;
				});
		})
		.on("click", function(d) {
			selectedSortCriterium = d.id;
			sortStates(selectedSortCriterium);
			visualize();
		})
		.on("mouseover", function(d) {
			//show explanation about hovered scenario
			d3.select("#sortExplanationLine1")
				.attr("visibility","visible")
				.text(function() {return d.explanationLine1});
			d3.select("#sortExplanationLine2")
				.attr("visibility","visible")
				.text(function() {return d.explanationLine2});
		})
		.on("mouseout", function(d) {
			d3.select("#sortExplanationLine1")
				.attr("visibility","hidden");
			d3.select("#sortExplanationLine2")
				.attr("visibility","hidden");
			
		})
		
	//explanation field
	sortButtons
		.append("text")
		.attr("class", "explanationLine")
		.attr("id", "sortExplanationLine1")
		.attr("x", 0)
		.attr("y", BUTTON_HEIGHT + 34)
		.attr("visibility","hidden");
		
	sortButtons
		.append("text")
		.attr("class", "explanationLine")
		.attr("id", "sortExplanationLine2")
		.attr("x", 0)
		.attr("y", BUTTON_HEIGHT + 50)
		.attr("visibility","hidden");
		
}

//update button color
function updateButtons() {
	scenarioButtons.selectAll(".scenarioButton")
		.each(function(d) {
			//update rectangle color
			d3.select(this).selectAll("rect")
				.attr("fill", function(d) {
					return (selectedStory.id == d.id) ? HIGHLIGHT_COLOR : "#888888"
				});
			//update font color
			d3.select(this).selectAll(".buttonLabel")
				.attr("fill", function(d) {
					return (selectedStory.id == d.id) ? "#000000" : "#ffffff"
				});
		});
		
	sortButtons.selectAll(".sortButton")
		.each(function(d) {
			//update rectangle color
			d3.select(this).selectAll("rect")
				.attr("fill", function(d) {
					return (selectedSortCriterium == d.id) ? HIGHLIGHT_COLOR : "#888888"
				});
			//update font color
			d3.select(this).selectAll(".buttonLabel")
				.attr("fill", function(d) {
					return (selectedSortCriterium == d.id) ? "#000000" : "#ffffff"
				});
		});
}
