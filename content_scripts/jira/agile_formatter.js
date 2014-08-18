var goalLine1    = 'Goal Line'
  , goalLine2    = '-----------------------------------------------GOAL LINE-----------------------------------------------'
  , goalSelector = 'div[title="' + goalLine1 + '"] span, div[title="' + goalLine2 + '"] span'
  , poller       = new Poller();

// get the agile board to update the cache, since the cache is used in ticket shading
var rapidBoardId = (window.location.search.match((/rapidView=(\d+)/)) || [] ) [1];

poller.addFunc(formatGoal);
poller.addFunc(updateTicketFormatting);
poller.addFunc(addNavBar)

// start the poller
poller.start()


//
//  POLLER FUNCTIONS
//

// only execucte if the mouse is up
var mouseDown;

function addNavBar () {
  if ($('#sprint-nav-bar').length) { return; }

  var navBar =  '<div id="sprint-nav-bar">' + 
                  '<div class="section"><span>s p r i n t</span>' +
                    '<div id="jump-top-sprint"></div>' +
                    '<div id="jump-bottom-sprint"></div>' +
                  '</div>' +
                  '<div class="section"><span>h o l d i n g</span>' +
                    '<div id="jump-top-holding"></div>' +
                    '<div id="jump-bottom-holding"></div>' +
                  '</div>' +
                  '<div class="section"><span>b a c k l o g</span>' + 
                    '<div id="jump-top-log"></div>' +
                    '<div id="jump-bottom-log"></div>' +
                  '</div>' +
                '</div>';

  $('#ghx-backlog-column').append(navBar);

  //add listeners
  $('#sprint-nav-bar .section div').on('click hover', function (e) {
    console.warn('event')
    // make sure we meet the conditions expected
    if (!(e.type === 'click' && !mouseDown) || (e.type === 'hover' && mouseDown)) { return; }

    var $this       = $(this)
      , id          = $this.attr('id')
      , $containers = $('.ghx-issues.js-issue-list.ghx-has-issues')
      , $scrollcont = $('ghx-backlog');
      
    if (id === 'jump-top-sprint') {
      $containers.first().scrollTop();

    } else if (id === 'jump-bottom-sprint') {
      $containers.first().scrollTop();

    } else if (id === 'jump-top-holding') {
      $containers.eq(1).scrollTop();

    } else if (id === 'jump-bottom-holding') {
      $containers.eq(1).scrollTop();

    } else if (id === 'jump-top-log') {
      $containers.last().scrollTop();

    } else if (id === 'jump-bottom-log') {
      $containers.last().scrollTop();

    }
  });
}

//format the daily goal
function formatGoal () {
  if (mouseDown) { return; }

	var dailyGoal = $(goalSelector).closest('.js-issue');
	dailyGoal.empty();
	dailyGoal.attr('id', 'daily-goal');
	dailyGoal.text('Daily Goal');
}

// adds info to each ticket, makes a request to get the sprint data if necessary
function updateTicketFormatting () {
  if (mouseDown) { return; }

  jiraAPI.getAgileBoardSummary(rapidBoardId, function (tickets) {
    _.each(tickets || [],  formatTicket);
  });
}


//
//  HELPERS
//



//
// format ticket
//
// format the html of the ticket passed in
function formatTicket (ticket) {
  if (!Object.keys(ticket).length) { return; }

  // get the useful data from the ticket
  var key         = ticket.key
    , statusName  = findValue(ticket, 'statusName')
    , statusColor = findValue(ticket, 'status.statusCategory.colorName')
    , subtasks    = _.map(findValue(ticket, 'subtasks', []), function (subtask, index) {
        return findValue(subtask, 'status.statusCategory.colorName', null)
      });


  var ticket      = $('.js-issue[data-issue-key=' + key + ']:not(.formatted):not(#daily-goal)')
    , progressBar = ticket.find('.ghx-grabber');

  // color the ticket based on progress
  setProgressColor(progressBar, statusColor);

  // set the progress bar for multiple subtasks
  setProgressBarSubtasks(progressBar, subtasks);

  // set the backgroud color
  setTicketClass(ticket, statusName);
}

//
// add a class to set the progress color of a provided ticket
function setProgressColor (node, color) {
  if (/blue-gray/i.test(color)) {
    node.css('background-color', '#4a6785');
    node.css('color', 'white');

  // in progess
  } else if (/yellow/i.test(color)) {
    node.css('background-color', '#f6c342');

  // done
  } else {
    node.css('background-color', '#14892c');
    node.css('color', 'white')
  }
}

//
// add divs for each subtask to the progress bar
function setProgressBarSubtasks (node, subtasks) {
  // if there are subtasks, include them in teh progress bar
  var height     = 30/subtasks.length
    , style      = height + 'px';

  _.each(subtasks, function (subtask, index) {
    node.append('<div class="subtask" name="' + index + '"" syle="height: ' + style + ' width: 10px;"></div>');

    var currentTask = node.find('[name=' + index + ']');
    currentTask.css('height', style);
    currentTask.css('margin-top', style * index);
    setProgressColor(node.find('[name=' + index + ']'), color);
  });
}

//
// set the status of a provided ticket
function setTicketClass (ticket, status) {
  // in code review
  if (/in\s*code\s*review/i.test(status)) {
    ticket.addClass('in-review');

  // in progess
  } else if (/complete|closed|stage|deploy|qa/i.test(status)) {
    ticket.addClass('done');

  // blocked
  } else if (ticket.find('.aui-label:contains(BLOCKED)').length) {
    ticket.addClass('blocked');
  }
}

//
//
// FUNCTIONALITY AUGMENTATION
//
//

// (SPEED) - keep track of mouse status to prevent reformatting while moving tickes
$('body').on('mousedown', function () { mouseDown = true; });
$('body').on('mouseup', function () { mouseDown = false; });
