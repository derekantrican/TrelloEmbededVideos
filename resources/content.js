var panelStateSetByUser = true; //Open by default
var editingCard = false;

function checkForCardView() {
  if ($('div.js-fill-card-detail-desc').length){
    var youTubeIds = extractYouTubeIds($('div.js-fill-card-detail-desc > div:not(.wrap-collapsible)').html());

    if (youTubeIds.length > 0){
      var panelExits = $('div.collapsible-video-panel-content-inner').length;
      if (!panelExits){
        console.log("adding a panel");
        $.get(chrome.extension.getURL('/resources/videopanel.html'), function (data) {
          $(data).appendTo($('div.js-fill-card-detail-desc'));
        });
      }

      syncVideosWithIds(youTubeIds);

      if ($('div.editing').length){ //Card is being edited - collapse video section
        if (!editingCard){
          editingCard = true;
          panelStateSetByUser = $('input.toggle').is(':checked'); //Save video panel state set by user (collapsed/uncollapsed)
          $('input.toggle').prop('checked', false); //Collapse video section
        }
      }
      else{ //Card is being not being edited
        if (editingCard){
          $('input.toggle').prop('checked', panelStateSetByUser); //Reset video panel back to previous state (collapsed/uncollapsed)
          editingCard = false;
        }
      }
    }
    else
      $('div.wrap-collapsible').remove();
  }

  setTimeout(checkForCardView, 500);
}

function syncVideosWithIds(youTubeIds){
  //Add new videos to panel
  youTubeIds.forEach(id =>{
    if($('div.collapsible-video-panel-content-inner').has(`iframe[src="https://www.youtube.com/embed/${id}"]`).length == 0)
      $('div.collapsible-video-panel-content-inner').append(getEmbedCode(`https://www.youtube.com/embed/${id}`));
  });

  //Remove videos from panel where url was removed
  $('div.collapsible-video-panel-content-inner').children().each(function (){
    if (!youTubeIds.includes($(this).attr("src").replace("https://www.youtube.com/embed/", "")))
      $(this).remove();
  });
}

function extractYouTubeIds(cardDescription){
  var matches = [];
  var youtubeRegex = /(?:youtube(?:-nocookie)?\.com\/(?:[^"/<]+?\/.+?\/|(?:v|e(?:mbed)?)\/|.*?[?&]v=)([^"&?/\s]{11}))/gi;
  var match = youtubeRegex.exec(cardDescription);
  while (match != null){
    matches.push(match[1]);
    match = youtubeRegex.exec(cardDescription);
  }

  matches = matches.filter((a, b) => matches.indexOf(a) === b); //Remove duplicates

  return matches;
}

function getEmbedCode(youtubeUrl){ //Could possibly do this in html file instead? Look into jquery.clone
  return `<iframe width=\"560\" height=\"315\" src=\"${youtubeUrl}\" frameborder=\"0\" allow=\"accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture\" allowfullscreen></iframe>`;
}

$(document).ready(function() {
  checkForCardView();
});
