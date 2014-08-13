$( document ).ready(function () {

  //
  // set the rapid id
  //
  $('#save_rapid_id').on('click', function () {
    var newId = $('#rapid_id_field').val();
      console.log(newId)      

    chrome.storage.sync.set({ 
      rapidViewId : newId 
    }, function (result) {
      console.log('wat')
      $('#active_board').text(newId);
    });
  })

  //
  // get the display id on page load
  //
  chrome.storage.sync.get('rapidViewId', function (items) {
    $('#active_board').text(items.rapidViewId);
  });

  //
  // load the jira cache widget
  //
  jiraCacheWidget.load('#content');
});