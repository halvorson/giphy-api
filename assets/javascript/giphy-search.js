var searchTerms = ["Aang", "SpongeBob", "Bugs Bunny", "Archer"];
var offset = 0;
var currentSearchString = "";

function drawSidebar() {
	$("#searchLinks").empty();
	var searchTermsLength = searchTerms.length;
	for (var i = 0; i < searchTermsLength; i++) {
		var li = $("<li>").addClass("nav-item searchItem").data("searchTerm", searchTerms[i]).append($("<span>").addClass("nav-link").text(searchTerms[i]));
		$("#searchLinks").append(li);
	}
	properHighlight();
}

$("#addButton").on("click", function(event) {
	event.preventDefault();
	var searchTerm = $("#addBox").val().trim();
	//Attempt at a logic shortcut to not add empty terms to the list
	searchTerm && searchTerms.push(searchTerm);
	$("#addBox").val("");
	drawSidebar();
});

//Previous versions had broken highlighting (e.g., multiple things would be highlighted). Consolidated into one method to fix.
function properHighlight() {
	$("#searchLinks").children("li").each(function(i) {
		if(currentSearchString === $(this).data("searchTerm")) {
			$(this).children().addClass("active");
		} else {
			$(this).children().removeClass("active");
		}
	});
}

function searchFromClick() {
	$("#giphyDisplay").empty();
	$("#giphyDisplay").addClass("card-columns");
	offset = 0;
	currentSearchString = $(this).data("searchTerm");
	properHighlight();
	giphySearch();
}

function giphySearch() {
	//console.log(this);
	var limit = 20;
	var queryURL = "https://api.giphy.com/v1/gifs/search?q="+currentSearchString+"&api_key=dc6zaTOxFJmzC&limit="+limit+"&offset="+offset;
	offset += limit;
	//console.log(queryURL);
	$.ajax({
		url: queryURL,
		method: "GET"
	}).done(function(res) {
		//console.log(res);
		giphyFillIn(res);
	});
}

function giphyFillIn(res) {
	var giphyArray = res.data;
	//First time, it just distributes them randomly; subsequent times, it should try to maintain column order by adding to the shortest
	if($("#giphyDisplay").children().length === 0) {
		for (var i = 0; i < giphyArray.length; i++) {
			//console.log(giphyArray[i]);
			$("#giphyDisplay").append($("<div>").addClass("card").append($("<img>", {
				src: giphyArray[i].images.fixed_width_still.url
			}).data("giphyResult",giphyArray[i]).addClass("giphyStill")).append($("<p>").addClass("card-text text-center").append($("<small>").addClass("text-muted").text("Rating: "+giphyArray[i].rating))));
		}
	} else {
		//This was a dumb idea. Really doesn't work, and is now much harder to explain than just shifting everything. 
		for (var i = 0; i < giphyArray.length; i++) {
			getColumnInfo();
			lastElementInColumn[shortestColumnIndex].after($("<div>").addClass("card").append($("<img>", {
				src: giphyArray[i].images.fixed_width_still.url
			}).data("giphyResult",giphyArray[i]).addClass("giphyStill")).append($("<p>").addClass("card-text text-center").append($("<small>").addClass("text-muted").text("Rating: "+giphyArray[i].rating))));
		}
		
	}
}

var lastElementInColumn = [];
var bottomOfColumns = [];
var shortestColumnIndex;

//Should return last element in column, and which column is shortest
function getColumnInfo() {
	lastElementInColumn = [];
	bottomOfColumns = [];
	bottomOfColumns.push(0);
	var columnIndex = 0;
	$("#giphyDisplay").children(".card").each(function(i) {
		console.log("Position of previous element: " + bottomOfColumns[columnIndex]);
		console.log("Position of element: " + $(this).position().top);
		if($(this).position().top + $(this).height() > bottomOfColumns[columnIndex]) {
			bottomOfColumns[columnIndex] = $(this).position().top + $(this).height();
			lastElementInColumn[columnIndex] = $(this);
		} else {
			bottomOfColumns.push(0);
			lastElementInColumn.push($(this));
			columnIndex++;
		}
	});
	console.log(lastElementInColumn);
	console.log(bottomOfColumns);
	shortestColumnIndex = 0;
	for (var i = 0; i <= columnIndex; i++) {
		if(bottomOfColumns[i] < bottomOfColumns[shortestColumnIndex]) {
			shortestColumnIndex = i;
		}
	}
	console.log(shortestColumnIndex);
}

function giphyPlay() {
	var giphyResult = $(this).data("giphyResult");
	$(this).attr('src',giphyResult.images.fixed_width.url).removeClass("giphyStill").addClass("giphyActive");
}

function giphyPause() {
	var giphyResult = $(this).data("giphyResult");
	$(this).attr('src',giphyResult.images.fixed_width_still.url).removeClass("giphyActive").addClass("giphyStill");
}

//These are different because I don't change the class in the hover paradigm (otherwise the mouseleave won't trigger)
function giphyPlayHover() {
	if($("#hoverToggle").is(':checked')) {
		var giphyResult = $(this).data("giphyResult");
		$(this).attr('src',giphyResult.images.fixed_width.url);
	}
}

function giphyPauseHover() {
	if($("#hoverToggle").is(':checked')) {
		var giphyResult = $(this).data("giphyResult");
		$(this).attr('src',giphyResult.images.fixed_width_still.url);
	}
}

drawSidebar();

//Necessary to clear the main area and reset the offset counter 
$(document).on("click", ".searchItem", searchFromClick);

//When clicking on a giphy, play/pause it
$(document).on("click", ".giphyStill", giphyPlay);
$(document).on("click", ".giphyActive", giphyPause);


// Switch to play/pause on hover rather than click
$(document).on({
	mouseenter: giphyPlayHover,
	mouseleave: giphyPauseHover
}, ".giphyStill");


//This does not function as intended, since it will reorder the existing ones rather than append to the bottom
//Bootstrap suggests using masonry instead of card-columns, but I didn't want to re-do my entire layout
$(document).ready(function() {
	$(window).endlessScroll({
		inflowPixels: 200,
		callback: function() {
			giphySearch();
		}
	});
});
