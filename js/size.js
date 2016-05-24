//functions for calculating widths and heights of graphical elements



//min value is only applicable for values larger than zero
function getSize(n, factor, min) {
	return n == 0 ? 0 : Math.max(min, Math.round(factor * n));
}

//min value is only applicable for values larger than zero
function getSizeOfList(nList, factor, min, gap) {
	var size = 0;
	for (var i=0; i<nList.length; i++) {
		if (nList[i] > 0)
			size += getSize(nList[i], factor, min) + (i>0 ? gap : 0);
	}
	return size;
}

function getStateSize(state) {
	//create list with number of delegates per candidate
	var nList = [];
	var votesFromState = getVotes({state:state.state, scenario:state.scenario});
	for (var i=0; i<votesFromState.length; i++) {
		nList.push(votesFromState[i].delegates);
	}
	nList.push(getRemainingNrDelegates(state));
	return getSizeOfList(nList, SCALE_FACTOR_STATE, MIN_SIZE, CANDIDATE_GAP_WIDTH_STATE);
}

function getStateX(stateName) {
	var widthOfLeftStates = 0;
	for (var i=0; i<states.length; i++) {
		if (states[i].state == stateName) break;
		else widthOfLeftStates += getStateSize(states[i]) + STATE_GAP_WIDTH;
	}
	return widthOfLeftStates;
}

function getStandingBarX(candidate) {
	return CHART_BASE_X + candidates.indexOf(candidate) * CHART_BAR_SPACING;
}

function getCandidateOffset(vote, factor, gapSize) {
	//order segments according to state, starting with leftmost state on top, righmost state on bottom
	//find votes from states underneath (and including) this one, i.e. states with higher indices, and summate the segments' height
	var nList = [];
	for (var i=getIndexOfState(vote.state); i<states.length; i++) {
		var votesFromStateForThisCandidate = getVotes({state:states[i].state, candidate:vote.candidate, scenario:states[i].scenario})[0];
		nList.push(votesFromStateForThisCandidate.delegates);
	}
	var offset = getSizeOfList(nList, factor, MIN_SIZE, gapSize);
	return offset;
}

