function drawStates() {
	// draw states
	svg.selectAll(".stateGroup")
		.data(states, function(d) { return d.state})
		.enter()
		.append("g")
		.attr("class", "stateGroup")
		.each(function(d) {
			d3.select(this)
				.append("rect")
				.attr("class","stateRect")
				.attr("height", STATE_HEIGHT);

			d3.select(this)
				.append("text")
				.attr("class","stateAbbreviation")
				.attr("x", 1)
				.attr("y", STATE_HEIGHT/2)
				.text(function(d) { return d.abbreviation });

			d3.select(this)
				.append("text")
				.attr("class","stateVotingSystemAbbreviation")
				.attr("x", 1)
				.attr("y", STATE_HEIGHT + 9);
		})
		.attr("transform", function(d) { //initial position, to prevent animation from position 0,0
			var y = STATE_Y;
			var x = getStateX(d.state);
			return "translate(" + x + "," + y + ")";
		})
		.on("mouseover", function(d) {
			selectedState = d;
			visualize();
			showStateInfo(d);
		})
		.on("mouseout", function(d) {
			selectedState = null;
			visualize();
			hideStateInfo(d);
		});


	//position states along x axis
	svg.selectAll(".stateGroup")
		.transition() //animate
		.attr("transform", function(d) {
			var y = STATE_Y;
			var x = getStateX(d.state);
			return "translate(" + x + "," + y + ")";
		});

	// adapt with of state rectangles
	svg.selectAll(".stateRect")
		.attr("width", function(d) {
			return getStateSize(d);
		});

	//adapt color of rectangle and text and voting system abbreviation
	svg.selectAll(".stateGroup")
		.each(function(d) {
			d3.select(this).selectAll(".stateRect")
				.attr("fill",function(d) {
					return d == selectedState ? HIGHLIGHT_COLOR : STATE_COLOR;
				});
			d3.select(this).selectAll(".stateAbbreviation")
				.attr("fill",function(d) {
					return d == selectedState ? "#000000" : "#ffffff";
				});
			d3.select(this).selectAll(".stateVotingSystemAbbreviation")
				.text(function(d) {
					if (candidates.indexOf(selectedStory.id) != -1) {
						return d.scenario == "proportional" ? "p" : "w";
					} else return "";
				})
		});
}

function drawStandingBars(barValues, highlightedSegmentsValues) {
	svg.selectAll(".standingBar")
		.data(candidates)
		.enter()
		.append("rect")
		.attr("class","standingBar")
		.attr("width", CHART_BAR_WIDTH)
		.attr("x", function(d) {
			return getStandingBarX(d);
		})
		.on("mouseover", function(d) {
			selectedCandidate = d;
			//delete all connections so they are forced to be redrawn
			//(in the right order)
			svg.selectAll(".connectionLower").remove();
			visualize();
			showCandidateInfo(d);
		})
		.on("mouseout", function(d) {
			selectedCandidate = null;
			visualize();
			hideCandidateInfo();
		});

	//position bars in y-direction
	svg.selectAll(".standingBar")
		//.transition()
		.attr("y", function(d,i) {
			return CHART_BASE_Y - barValues[i] * SCALE_FACTOR_STANDING_BAR;
		})
		.attr("height", function(d,i) {
			return barValues[i] * SCALE_FACTOR_STANDING_BAR;
		})
		.attr("fill", function(d) {
			return (d == selectedCandidate)
					? HIGHLIGHT_COLOR : getCandidateColor(d);
		});

	//draw highlighted part of bars, in case a state is selected
	svg.selectAll(".highlightedSegment")
		.data(candidates)
		.enter()
		.append("rect")
		.attr("class","highlightedSegment")
		.attr("width", CHART_BAR_WIDTH)
		.attr("x", function(d) {
			return getStandingBarX(d);
		});


	//adapt height and color according to selected state (if any)
	svg.selectAll(".highlightedSegment")
		.attr("y", function(d,i) {
			return CHART_BASE_Y - highlightedSegmentsValues[i] * SCALE_FACTOR_STANDING_BAR;
		})
		.attr("height", function(d,i) {
			return highlightedSegmentsValues[i] * SCALE_FACTOR_STANDING_BAR;
		})
		.attr("fill", HIGHLIGHT_COLOR);
}

//draw tickmarks and numbers for selected state, and for previous selected scenario


function drawTickMarks(tickMarks) {

	svg.selectAll(".tickMark")
		.data(tickMarks, function(d) { return d.candidate + "_" + d.value + "_" + d.type})
		.enter()
		.append("g")
		.attr("class","tickMark")
		.attr("transform", function(d) {
			var x = getStandingBarX(d.candidate) + CHART_BAR_WIDTH + 1;
			var y = CHART_BASE_Y - d.value * SCALE_FACTOR_STANDING_BAR
			return "translate(" + x + "," + y + ")";
		})
		.each(function(d) {
			d3.select(this)
				.append("line")
				.attr("class", "tickMarkLine")
				.attr("x1", 0)
				.attr("y1", 0)
				.attr("x2", 20)
				.attr("y2", 0);

			d3.select(this)
				.append("text")
				.attr("class", "tickMarkText")
				.text(function(d) {
					return d.type == "highlight" ? d.value : "actual: " + d.value
				})
				.attr("x", 4)
				.attr("y", 10);
		})

	svg.selectAll(".tickMark")
		.data(tickMarks)
		.exit()
		.remove();
}


function drawLayingBars(voteList) {
	//draw laying bar segments
	svg.selectAll(".candidateSegmentLaying")
		.data(voteList, function(d) { return d.state + "_" + d.candidate})
		.enter()
		.append("rect")
		.attr("class","candidateSegmentLaying")
		.attr("height", LAYING_BAR_HEIGHT)
		.attr("y", function(d) {
			return CHART_BASE_Y + GAP_BARS_VERT;
		})
		.attr("x", function(d) { //initial position, to prevent animation from 0,0
			var baseX = getStandingBarX(d.candidate) - GAP_BARS_HOR;
			var sizeToRight = getCandidateOffset(d, SCALE_FACTOR_LAYING_BAR, CANDIDATE_GAP_WIDTH_LAYING);
			return baseX - sizeToRight;
		})

	//position laying bar segments
	svg.selectAll(".candidateSegmentLaying")
		.transition()
		.attr("x", function(d) {
			var baseX = getStandingBarX(d.candidate) - GAP_BARS_HOR;
			var sizeToRight = getCandidateOffset(d, SCALE_FACTOR_LAYING_BAR, CANDIDATE_GAP_WIDTH_LAYING);
			return baseX - sizeToRight;
		})
		.attr("width", function(d) {
			return getSize(d.delegates, SCALE_FACTOR_LAYING_BAR, MIN_SIZE);
		})

	//color segments
	svg.selectAll(".candidateSegmentLaying")
		.attr("fill", function(d) {
			return ((selectedState && d.state == selectedState.state)
				|| (selectedCandidate && d.candidate == selectedCandidate)) ?
						HIGHLIGHT_COLOR : getCandidateColor(d.candidate);
		});

	svg.selectAll(".candidateSegmentLaying")
		.data(voteList, function(d) { return d.state + "_" + d.candidate})
		.exit()
		.remove();
}

function drawStrip(voteList) {
	svg.selectAll(".stripSegment")
		.data(voteList, function(d) { return d.state + "_" + d.candidate })
		.enter()
		.append("rect")
		.attr("class","stripSegment")
		.attr("height", STRIP_HEIGHT)
		.attr("x", function(d) { //initial position, to prevent animation from 0,0
			//get offset from left corner of state: calculate sum of width of all candidates
			//left of this one
			var votesFromThisState = getVotes({state:d.state, scenario:d.scenario});
			var nList = [];
			for (var i=0; i<votesFromThisState.length; i++) {
				if (votesFromThisState[i].candidate == d.candidate) break;
				else nList.push(votesFromThisState[i].delegates);
			}
			var sizeOfCandidatesToTheLeft = getSizeOfList(nList, SCALE_FACTOR_STATE, MIN_SIZE, CANDIDATE_GAP_WIDTH_STATE);
			//add gap if this connection is not the leftmost one
			var offset = sizeOfCandidatesToTheLeft
					   + ((votesFromThisState[0].candidate == d.candidate) ? 0 : CANDIDATE_GAP_WIDTH_STATE);
			var p1x = getStateX(d.state) + offset;
			return p1x;
		})
		.attr("y", function(d) {
			var p1y = STATE_Y - GAP_CONNECTION_AND_STATE;
			return p1y - STRIP_HEIGHT;
		});

	//position and color segments
	svg.selectAll(".stripSegment")
		.transition()
		.attr("x", function(d) {
			//get offset from left corner of state: calculate sum of width of all candidates
			//left of this one
			var votesFromThisState = getVotes({state:d.state, scenario:d.scenario});
			var nList = [];
			for (var i=0; i<votesFromThisState.length; i++) {
				if (votesFromThisState[i].candidate == d.candidate) break;
				else nList.push(votesFromThisState[i].delegates);
			}
			var sizeOfCandidatesToTheLeft = getSizeOfList(nList, SCALE_FACTOR_STATE, MIN_SIZE, CANDIDATE_GAP_WIDTH_STATE);
			//add gap if this connection is not the leftmost one
			var offset = sizeOfCandidatesToTheLeft
					   + ((votesFromThisState[0].candidate == d.candidate) ? 0 : CANDIDATE_GAP_WIDTH_STATE);
			var p1x = getStateX(d.state) + offset;
			return p1x;
		})
		.attr("width", function(d) {
			return getSize(d.delegates, SCALE_FACTOR_STATE, MIN_SIZE);
		});

	svg.selectAll(".stripSegment")
		.attr("fill", function(d) {
			return ((selectedState && d.state == selectedState.state) ||
				(selectedCandidate && d.candidate == selectedCandidate))
				? HIGHLIGHT_COLOR : getCandidateColor(d.candidate);
		});
}

function drawLowerConnections(voteList) {
	svg.selectAll(".connectionLower")
		.data(voteList, function(d) { return d.state + "_" + d.candidate })
		.enter()
		.append("path")
		.attr("class","connectionLower");

	//position lower connections
	svg.selectAll(".connectionLower")
		.transition()
		.attr("d", function(d) { //calculate path
			//get offset from left corner of state: calculate sum of width of all candidates
			//left of this one
			var votesFromThisState = getVotes({state:d.state, scenario:d.scenario});
			var nList = [];
			for (var i=0; i<votesFromThisState.length; i++) {
				if (votesFromThisState[i].candidate == d.candidate) break;
				else nList.push(votesFromThisState[i].delegates);
			}
			var sizeOfCandidatesToTheLeft = getSizeOfList(nList, SCALE_FACTOR_STATE, MIN_SIZE, CANDIDATE_GAP_WIDTH_STATE);
			//add gap if this connection is not the leftmost one
			var offset = sizeOfCandidatesToTheLeft
					   + ((votesFromThisState[0].candidate == d.candidate) ? 0 : CANDIDATE_GAP_WIDTH_STATE);
			var p1x = getStateX(d.state) + offset;
			var p1y = STATE_Y - GAP_CONNECTION_AND_STATE;
			var p2x = p1x + getSize(d.delegates, SCALE_FACTOR_STATE, MIN_SIZE);
			var p2y = p1y;
			var p3x = p2x;
			var p3y = p2y - STRIP_HEIGHT;

			var baseX = getStandingBarX(d.candidate) - GAP_BARS_HOR;
			var sizeToRight = getCandidateOffset(d, SCALE_FACTOR_LAYING_BAR, CANDIDATE_GAP_WIDTH_LAYING);
			var p5x = baseX - sizeToRight;
			var p5y = CHART_BASE_Y + GAP_BARS_VERT + LAYING_BAR_HEIGHT + GAP_CONNECTION_AND_LAYING_BAR;
			var p4x = p5x + getSize(d.delegates, SCALE_FACTOR_LAYING_BAR, MIN_SIZE);
			var p4y = p5y;
			var p6x = p1x;
			var p6y = p3y;
			var path = "M" + p3x + "," + p3y
					+ " L" + p4x + "," + p4y
					+ " L" + p5x + "," + p5y
					+ " L" + p6x + "," + p6y
					+ " Z";
			return path;
		});

	//color connections
	svg.selectAll(".connectionLower")
		.attr("fill", function(d) {
			return ((selectedState && d.state == selectedState.state) ||
				(selectedCandidate && d.candidate == selectedCandidate))
				? HIGHLIGHT_COLOR : getCandidateColor(d.candidate);
		});

	svg.selectAll(".connectionLower")
		.data(voteList, function(d) { return d.state + "_" + d.candidate })
		.exit()
		.remove();
}

function drawUpperConnections(voteList, barValues, highlightedSegmentsValues) {
	svg.selectAll(".connectionUpper")
		.data(candidates)
		.enter()
		.append("path")
		.attr("class","connectionUpper")
		.style("fill","#eeeeee");

	//position upper connections
	svg.selectAll(".connectionUpper")
		//.transition()
		.attr("d", function(d,i) {
			var p1x = getStandingBarX(d) - GAP_BARS_HOR;
			var p1y = CHART_BASE_Y + GAP_BARS_VERT;
			var p2x = getStandingBarX(d);
			var p2y = CHART_BASE_Y;
			var p3x = p2x;
			var p3y = CHART_BASE_Y - barValues[i] * SCALE_FACTOR_STANDING_BAR;
			//get number of delegates for this candidate, per state
			var nList = [];
			for (var j=0; j<states.length; j++) {
				nList.push(getVotes({candidate:d, state:states[j].state, scenario:states[j].scenario})[0].delegates);
			}
			var p4x = p1x - getSizeOfList(nList, SCALE_FACTOR_LAYING_BAR, MIN_SIZE, CANDIDATE_GAP_WIDTH_LAYING);
			var p4y = p1y;

			var path = "M" + p1x + "," + p1y
					+ " L" + p2x + "," + p2y
					+ " L" + p3x + "," + p3y
					+ " L" + p4x + "," + p4y;
			return path;
		});

	svg.selectAll(".highlightedUpperConnection")
		.data(candidates)
		.enter()
		.append("path")
		.attr("class","highlightedUpperConnection")
		.attr("fill", HIGHLIGHT_COLOR);

	var selectedVotePerCandidate = [];
	for (var i=0; i<candidates.length; i++) {
		selectedVotePerCandidate[i] = selectedState ?
			getVotes({candidate:candidates[i], state:selectedState.state, scenario:selectedState.scenario})[0]
		: null;
	}

	//adapt visibility
	svg.selectAll(".highlightedUpperConnection")
		.attr("visibility", function(d,i) {
			return (selectedVotePerCandidate[i] && selectedVotePerCandidate[i].delegates > 0) ? "visible" : "hidden";
		})
		.attr("d", function(d,i) {
			var path = "";
			if (selectedVotePerCandidate[i] && selectedVotePerCandidate[i].delegates > 0) {
				var barX = getStandingBarX(d);
				var sizeToRight = getCandidateOffset(selectedVotePerCandidate[i], SCALE_FACTOR_LAYING_BAR, CANDIDATE_GAP_WIDTH_LAYING);
				var p4x = barX - GAP_BARS_HOR - sizeToRight;
				var p4y = CHART_BASE_Y + GAP_BARS_VERT;
				var p1x = p4x + getSize(selectedVotePerCandidate[i].delegates, SCALE_FACTOR_LAYING_BAR, MIN_SIZE);
				var p1y = p4y;
				var p2x = barX;
				var p2y = CHART_BASE_Y;
				var p3x = barX;
				var p3y = CHART_BASE_Y - highlightedSegmentsValues[i] * SCALE_FACTOR_STANDING_BAR;

				path = "M" + p1x + "," + p1y
					+ " L" + p2x + "," + p2y
					+ " L" + p3x + "," + p3y
					+ " L" + p4x + "," + p4y;
			}
			return path;
		});
}

/*
function drawImages() {
	svg.selectAll(".portrait")
		.data(candidates)
		.enter()
		.append("g")
		.attr("class","portrait")
		.each(function(d) {
			d3.select(this)
				.append("image")
				.attr('width', IMAGE_SIZE)
				.attr('height', IMAGE_SIZE)
				.attr("xlink:href",function(d) {
					return "resources/" + d + "_bw.png"
				});
			d3.select(this)
				.append("text")
				.attr("class","delegatesCount")
				.attr("x", 2 + IMAGE_SIZE)
				.attr("y", 14 + IMAGE_SIZE/2)
			d3.select(this)
				.append("text")
				.attr("class","candidateName")
				.attr("x", 2 + IMAGE_SIZE)
				.attr("y", IMAGE_SIZE/2 - 5)
				.text(capitalizeFirstLetter(d));
		})

	//position images
	svg.selectAll(".portrait")
		//.transition()
		.attr("transform",function(d) {
			var x = getStandingBarX(d);
			var y = CHART_BASE_Y - Math.round(getNrOfDelegates(d) * SCALE_FACTOR_STANDING_BAR) - IMAGE_SIZE - 4;
			return "translate(" + x + "," + y + ")";
		});

	//update number
	svg.selectAll(".delegatesCount")
		.text(function(d) { return getNrOfDelegates(d)});
}

*/

function drawImages() {
	svg.selectAll(".portrait")
		.data(candidates)
		.enter()
		.append("g")
		.attr("class","portrait")
		.each(function(d) {
			d3.select(this)
				.append("image")
				.attr('width', IMAGE_SIZE)
				.attr('height', IMAGE_SIZE)
				.attr("xlink:href",function(d) {
					return "resources/" + d + "_bw.png"
				});
			d3.select(this)
				.append("text")
				.attr("class","delegatesCount")
				.attr("x", -2)
				.attr("y", 14 + IMAGE_SIZE/2)
				.attr("text-anchor", "end")
			d3.select(this)
				.append("text")
				.attr("class","candidateName")
				.attr("x", -2)
				.attr("y", IMAGE_SIZE/2 - 5)
				.attr("text-anchor", "end")
				.text(capitalizeFirstLetter(d));
		})

	//position images
	svg.selectAll(".portrait")
		//.transition()
		.attr("transform",function(d) {
			var x = getStandingBarX(d);
			var y = CHART_BASE_Y - Math.round(getNrOfDelegates(d) * SCALE_FACTOR_STANDING_BAR) - IMAGE_SIZE - 4;
			return "translate(" + x + "," + y + ")";
		});

	//update number
	svg.selectAll(".delegatesCount")
		.text(function(d) { return getNrOfDelegates(d)});
}

function drawNumberOfStates() {
	svg.selectAll(".nrOfStatesInfo")
		.data(candidates)
		.enter()
		.append("text")
		.attr("class","nrOfStatesInfo")
		.attr("text-anchor","end")
		.attr("x", function(d) { return getStandingBarX(d) - GAP_BARS_HOR })
		.attr("y", CHART_BASE_Y + GAP_BARS_VERT - 5);

	//update text
	svg.selectAll(".nrOfStatesInfo")
		.text(function(d) {
			var nrStates = 0;
			for (var i=0; i<states.length; i++) {
				var nrDelegates = getVotes({candidate:d, state:states[i].state, scenario:states[i].scenario})[0].delegates;
				nrStates += nrDelegates > 0 ? 1 : 0;
			}
			return capitalizeFirstLetter(d) + " receives delegates from " + nrStates + " states";
		});
}

//(re)draws the interface
function visualize() {
	var voteList = [];
	var tickMarks = [];

	for (var i=0; i<states.length; i++) {
		voteList = voteList.concat(getVotes({state:states[i].state, scenario:states[i].scenario}));
	}
	//order votes so that selected votes are 'on top', i.e. last in the array
	voteList.sort(function(a,b) {
		return ((selectedState && a.state == selectedState.state) ||
				(selectedCandidate && a.candidate == selectedCandidate))
				? 1 : -1;
	})

	//calculate bar heights once, to be used for y and height. Same for highlighted segments.
	var barValues = [];
	var highlightedSegmentsValues = [];

	for (var i=0; i<candidates.length; i++) {
		barValues[i] = getNrOfDelegates(candidates[i]);
		highlightedSegmentsValues[i] = selectedState ?
			Math.ceil(getVotes({candidate:candidates[i],
					  state:selectedState.state,
					  scenario:selectedState.scenario})[0].delegates)
			: 0;
		//add highlight-tickmarks
		if (selectedState) tickMarks.push({candidate: candidates[i],
										   story: selectedStory.id,
										   value: highlightedSegmentsValues[i],
										   type: "highlight"});
	}

	if (selectedStory.id != "actual") {
		//add tickmarks for actual scenario
		for (var i=0; i<candidates.length; i++) {
			tickMarks.push({candidate: candidates[i],
						    story: "actual",
						    value: getNrOfDelegates(candidates[i],"actual"),
						    type: "normal"});
		}
	}


	drawStates();
	drawStandingBars(barValues, highlightedSegmentsValues);
	drawLayingBars(voteList);
	drawStrip(voteList);
	drawLowerConnections(voteList);
	drawUpperConnections(voteList, barValues, highlightedSegmentsValues);
	updateButtons();
	drawImages();
	drawNumberOfStates(); //i.e. 'Trump received delegates from .. states'
	drawTickMarks(tickMarks);
}

function getCandidateColor(candidateName) {
	switch(candidateName) {
	case "trump":  return "#a6cee3";
	case "cruz":   return "#7a67ce"; //"#1f78b4";
	case "kasich": return "#33a02c";
	}
}
