var searchTerms = ["Aang", "SpongeBob", "Bugs Bunny", "Archer"];
var offset = 0;
var currentSearchString = "";

function drawSidebar() {
	$("#searchLinks").empty();
	var searchTermsLength = searchTerms.length;
	for (var i = 0; i < searchTermsLength; i++) {
		var li = $("<li>").addClass("nav-item searchItem").data("searchTerm", searchTerms[i]).append($("<span>").addClass("nav-link").text(searchTerms[i]));
		//Keeps "active" class on redraw
		if(currentSearchString === searchTerms[i]) {
			li.children().addClass("active");
		}
		$("#searchLinks").append(li);
	}
}

$("#addButton").on("click", function(event) {
	event.preventDefault();
	var searchTerm = $("#addBox").val().trim();
	//Attempt at a logic shortcut to not add empty terms to the list
	searchTerm && searchTerms.push(searchTerm);
	$("#addBox").val("");
	drawSidebar();
});

function searchFromClick() {
	$("#giphyDisplay").empty();
	$("#giphyDisplay").addClass("card-columns");
	offset = 0;
	currentSearchString = $(this).data("searchTerm");
	$(this).children().addClass("active");
	giphySearch();
}

function giphySearch() {
	//console.log(this);
	var limit = 20;
	var queryURL = "http://api.giphy.com/v1/gifs/search?q="+currentSearchString+"&api_key=dc6zaTOxFJmzC&limit="+limit+"&offset="+offset;
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
	for (var i = 0; i < giphyArray.length; i++) {
		//console.log(giphyArray[i]);
		$("#giphyDisplay").append($("<div>").addClass("card").append($("<img>", {
			src: giphyArray[i].images.fixed_width_still.url
		}).data("giphyResult",giphyArray[i]).addClass("giphyStill")).append($("<p>").addClass("card-text text-center").append($("<small>").addClass("text-muted").text("Rating: "+giphyArray[i].rating))));
	}
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
