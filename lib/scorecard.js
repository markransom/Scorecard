var db;
            
var jQT = new $.jQTouch({
                icon: 'lib/apple-touch-icon.png',
                addGlossToIcon: true,
                statusBar: 'black',
                preloadImages: [
	            'lib/apple-touch-icon.png',
                    'lib/startup-icon.png',
                    'lib/shuttle.png',
                    'lib/loader.gif',
		    'lib/themes/jqt/img/back_button.png',
                    'lib/themes/jqt/img/back_button_clicked.png',
                    'lib/themes/jqt/img/button.png',
                    'lib/themes/jqt/img/button_clicked.png',
                    'lib/themes/jqt/img/chevron_circle.png',
                    'lib/themes/jqt/img/grayButton.png',
                    'lib/themes/jqt/img/whiteButton.png',
                    'lib/themes/jqt/img/toolbar.png',
                    'lib/themes/jqt/img/loading.gif'
                    ]
            });

$(document).ready(function(){
    loadPage();
});



function loadPage(url) {

$('body').append('<div id="progress">Loading...</div>');
         
// Page animation callback events
     $('#pageevents').
     bind('pageAnimationStart', function(e, info){ 
          $(this).find('.info').append('Started animating ' + info.direction + '&hellip; ');
          }).
     bind('pageAnimationEnd', function(e, info){
          $(this).find('.info').append(' finished animating ' + info.direction + '.<br /><br />');
     });
                    
// Orientation callback event
     $('body').bind('turn', function(e, data){
     $('#orient').html('Orientation: ' + data.orientation);
     });
                

// var userAgent = navigator.userAgent.toLowerCase();
// var isiPhone = (userAgent.indexOf('iphone') != -1 || userAgent.indexOf('ipod') != -1) ? true : false;
// clickEvent = isiPhone ? 'tap' : 'click';

// page onload & click functions

    $('#home').bind('pageAnimationStart', loadClub);
    $('.fixtures').bind('pageAnimationStart', loadFixtures);
    $('#match').bind('pageAnimationStart', loadMatch);
    $('#SaveMatch').bind('click', saveMatch);
    $('#ourPlayers').bind('pageAnimationStart', loadPlayers);
    $('#SavePlayers').bind('click', savePlayers);
    $('#SavePlayers2').bind('click', savePlayers);
    $('#oppPlayers').bind('pageAnimationStart', loadPlayers);
    $('#scorecard').bind('pageAnimationStart', rubberSummary);
    $('.rubber').bind('click', gotoRubber);
    $('#rubber').bind('pageAnimationStart', loadRubber);
    $('#SaveRubber').bind('click', saveRubber);
    $('#AltView').bind('click', altView);
    $('#match2scorecard').bind('click', match2scorecard);
    $('#match2ourPlayers').bind('click', match2ourPlayers);
    $('#ourPlayers2scorecard').bind('click', players2scorecard);
    $('#ourPlayers2oppPlayers').bind('click', ourPlayers2oppPlayers);
    $('#oppPlayers2scorecard').bind('click', players2scorecard);
    $('#oppPlayers2ourPlayers').bind('click', oppPlayers2ourPlayers);
    $('#scorecard2oppPlayers').bind('click', scorecard2oppPlayers);
    $('#scorecard2ourPlayers').bind('click', scorecard2ourPlayers);

    $('.fixtures ul li a').bind('click', function(e, data) {
    	sessionStorage.oppTeam=$(this).text();
    	sessionStorage.matchID=this.parentNode.id;
	
	oppClub=sessionStorage.oppTeam.replace(/[0-9\s]/g, '');
	ourClub=sessionStorage.ourClub.replace(/\s/g, '');
	
	ourTeamNo=sessionStorage.ourTeam.replace(/[^0-9]/g, '');
	oppTeamNo=sessionStorage.oppTeam.replace(/[^0-9]/g, '');
	
	if (oppClub == ourClub) {
		sessionStorage.matchID=sessionStorage.matchID.substr(0,1)+'X'+sessionStorage.matchID.substr(2);
	}
	
    	$('#oppTeam').val(sessionStorage.oppTeam);
    	$('.oppTeam').text(sessionStorage.oppTeam);

    });


// db functions

    var shortName = 'Scorecard';
    var version = '1.0';
    var displayName = 'Scorecard';
    var maxSize = 65536;

    db = openDatabase(shortName, version, displayName, maxSize);
    db.transaction(
        function(transaction) {
            transaction.executeSql(
                'CREATE TABLE IF NOT EXISTS fixtures ' +
                ' (id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, ' +
                ' clubName TEXT, matchID TEXT, date DATE, time TIME, venue TEXT, pairs TEXT,' +
                ' hometeam TEXT NOT NULL, awayteam TEXT NOT NULL );'
            );
        }
    );    
    db.transaction(
        function(transaction) {
            transaction.executeSql(
                'CREATE TABLE IF NOT EXISTS players ' +
                ' (id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, ' +
                ' clubName TEXT, matchID TEXT, team TEXT,' +
                ' player1 TEXT, player2 TEXT, player3 TEXT, player4 TEXT, player5 TEXT, player6 TEXT);'
            );
        }
    );
    db.transaction(
        function(transaction) {
            transaction.executeSql(
                'CREATE TABLE IF NOT EXISTS rubbers ' +
                ' (id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, ' +
                ' clubName TEXT, matchID TEXT, rubberID TEXT,' +
                ' g1h TEXT, g1a TEXT, g2h TEXT, g2a TEXT, g3h TEXT, g3a TEXT);'
            );
        }
    );

$('#progress').remove();

}


function loadMatch() {
    $('#ourTeam').val(sessionStorage.ourTeam);
    $('.ourTeam').text(sessionStorage.ourTeam);
    $('#matchDate').val('');
    $('#matchTime').val('');
    $('#matchVenue').val('');
    $('#numCourts').val('');
    $('#homeaway').val('');
    
    
    var matchID=$(this).data('referrer').parent().attr('id');

    db.transaction(
        function(transaction) {
            transaction.executeSql(
                'SELECT * FROM fixtures WHERE clubName = ? and matchID = ?;', 
                [sessionStorage.ourClub, matchID], 
                function (transaction, result) {
                    if (result.rows.length >= 1) {
                        	var row = result.rows.item(0);
	                        $('#matchDate').val(row.date);
	                        $('#matchTime').val(row.time);
	                        $('#matchVenue').val(row.venue);
	                        $('#numCourts').val(row.pairs);
			        if (row.awayteam == sessionStorage.ourTeamLong) {
	             			$('#homeaway').val("Away");
					sessionStorage.homeAway="Away";
	             		}
			        if (row.hometeam == sessionStorage.ourTeamLong) {
					$('#homeaway').val("Home");
					sessionStorage.homeAway="Home";
	         		}
                    }
                }, 
                errorHandler
            );
        }
    );
    loadPlayers();
}

function match2scorecard() {
    saveMatchFirst();
    jQT.goTo($('#scorecard'), 'slide');
}

function match2ourPlayers() {
    saveMatchFirst();
    jQT.goTo($('#ourPlayers'), 'slide');
}

function saveMatch() {
    saveMatchFirst();
    jQT.goBack('');
}

function saveMatchFirst() {
    var date = $('#matchDate').val();
    var time = $('#matchTime').val();
    var venue = $('#matchVenue').val();
    var matchID = sessionStorage.matchID;
    var clubName = sessionStorage.ourClub;
    var pairs = $('#numCourts').val();

    var hometeam = "";
    var awayteam = "";

    if ($('#homeaway').val() == "Away") {
	    var hometeam = sessionStorage.oppTeam;
	    var awayteam = sessionStorage.ourTeamLong;
    } else {
	    var hometeam = sessionStorage.ourTeamLong;
	    var awayteam = sessionStorage.oppTeam;
    }
    
    	oppClub=sessionStorage.oppTeam.replace(/[0-9\s]/g, '');
	ourClub=sessionStorage.ourClub.replace(/\s/g, '');
	
	ourTeamNo=sessionStorage.ourTeam.replace(/[^0-9]/g, '');
	oppTeamNo=sessionStorage.oppTeam.replace(/[^0-9]/g, '');
	
	if ((oppClub == ourClub) && (ourTeamNo > oppTeamNo)) {
	    var hometeam = sessionStorage.oppTeam;
	    var awayteam = sessionStorage.ourTeamLong;
	}


    db.transaction(
        function(transaction) {
            transaction.executeSql(
                'DELETE FROM fixtures WHERE matchID = ? and clubName = ?;', 
                [matchID, clubName], function(){
                }, 
                errorHandler
            );
        }
    );
    db.transaction(
        function(transaction) {
            transaction.executeSql(
                'INSERT INTO fixtures (clubName, matchID, date, time, venue, pairs, hometeam, awayteam) VALUES (?, ?, ?, ?, ?, ?, ?, ?);', 
                [clubName, matchID, date, time, venue, pairs, hometeam, awayteam], 
                function(){
                }, 
                errorHandler
            );
        }
    );
    return false;
}


function loadPlayers() {
    $('#ourPlayer1').val('');
    $('#ourPlayer2').val('');
    $('#ourPlayer3').val('');
    $('#ourPlayer4').val('');
    $('#ourPlayer5').val('');
    $('#ourPlayer6').val('');

    $('#oppPlayer1').val('');
    $('#oppPlayer2').val('');
    $('#oppPlayer3').val('');
    $('#oppPlayer4').val('');
    $('#oppPlayer5').val('');
    $('#oppPlayer6').val('');

    db.transaction(
        function(transaction) {
            transaction.executeSql(
                'SELECT * FROM players WHERE clubName = ? and matchID = ?;', 
                [sessionStorage.ourClub, sessionStorage.matchID], 
                function (transaction, result) {
                    for (var i=0; i < result.rows.length; i++) {
                        var row = result.rows.item(i);
                        if (row.team == sessionStorage.ourTeamLong) {
	                        $('#ourPlayer1').val(row.player1);
	                        $('#ourPlayer2').val(row.player2);
	                        $('#ourPlayer3').val(row.player3);
	                        $('#ourPlayer4').val(row.player4);
	                        $('#ourPlayer5').val(row.player5);
	                        $('#ourPlayer6').val(row.player6);
	         	}
	         	else
	         	{
	                        $('#oppPlayer1').val(row.player1);
	                        $('#oppPlayer2').val(row.player2);
	                        $('#oppPlayer3').val(row.player3);
	                        $('#oppPlayer4').val(row.player4);
	                        $('#oppPlayer5').val(row.player5);
	                        $('#oppPlayer6').val(row.player6);
	         	}
                    }
                }, 
                errorHandler
            );
        }
    );
}

function players2scorecard() {
	savePlayersFirst();
	jQT.goTo($('#scorecard'), 'slide');
}

function ourPlayers2oppPlayers() {
	savePlayersFirst();
	jQT.goTo($('#oppPlayers'), 'slide');
}

function oppPlayers2ourPlayers() {
	savePlayersFirst();
	jQT.goTo($('#ourPlayers'), 'slide');
}

function scorecard2ourPlayers() {
	jQT.goTo($('#ourPlayers'), 'slide');
}

function scorecard2oppPlayers() {
	jQT.goTo($('#oppPlayers'), 'slide');
}

function savePlayers() {
    savePlayersFirst();
    jQT.goBack('#match');
}

function savePlayersFirst() {
    var ourPlayer1 = $('#ourPlayer1').val();
    var ourPlayer2 = $('#ourPlayer2').val();
    var ourPlayer3 = $('#ourPlayer3').val();
    var ourPlayer4 = $('#ourPlayer4').val();
    var ourPlayer5 = $('#ourPlayer5').val();
    var ourPlayer6 = $('#ourPlayer6').val();

    var oppPlayer1 = $('#oppPlayer1').val();
    var oppPlayer2 = $('#oppPlayer2').val();
    var oppPlayer3 = $('#oppPlayer3').val();
    var oppPlayer4 = $('#oppPlayer4').val();
    var oppPlayer5 = $('#oppPlayer5').val();
    var oppPlayer6 = $('#oppPlayer6').val();

    var matchID = sessionStorage.matchID;
    var clubName = sessionStorage.ourClub;
    var ourTeam = sessionStorage.ourTeamLong;
    var oppTeam = sessionStorage.oppTeam;

    db.transaction(
        function(transaction) {
            transaction.executeSql(
                'DELETE FROM players WHERE matchID = ? and clubName = ?;', 
                [matchID, clubName], function(){
                }, 
                errorHandler
            );
        }
    );
    db.transaction(
        function(transaction) {
            transaction.executeSql(
                'INSERT INTO players (clubName, matchID, team, player1, player2, player3, player4, player5, player6) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);', 
                [clubName, matchID, ourTeam, ourPlayer1, ourPlayer2, ourPlayer3, ourPlayer4, ourPlayer5, ourPlayer6], 
                function(){
                }, 
                errorHandler
            );
        }
    );
    db.transaction(
        function(transaction) {
            transaction.executeSql(
                'INSERT INTO players (clubName, matchID, team, player1, player2, player3, player4, player5, player6) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);', 
                [clubName, matchID, oppTeam, oppPlayer1, oppPlayer2, oppPlayer3, oppPlayer4, oppPlayer5, oppPlayer6], 
                function(){
                }, 
                errorHandler
            );
        }
    );
    return false;
}

function loadRubber() {
    $('#g1h').val('');
    $('#g1a').val('');
    $('#g2h').val('');
    $('#g2a').val('');
    $('#g3h').val('');
    $('#g3a').val('');
    db.transaction(
        function(transaction) {
            transaction.executeSql(
                'SELECT * FROM rubbers WHERE clubName = ? and matchID = ? and rubberID = ?;', 
                [sessionStorage.ourClub, sessionStorage.matchID, sessionStorage.rubberID], 
                function (transaction, result) {
                    if (result.rows.length >= 1) {
                        	var row = result.rows.item(0);
	                        $('#g1h').val(row.g1h);
	                        $('#g1a').val(row.g1a);
	                        $('#g2h').val(row.g2h);
	                        $('#g2a').val(row.g2a);
	                        $('#g3h').val(row.g3h);
	                        $('#g3a').val(row.g3a);
                    }
                }, 
                errorHandler
            );
        }
    );
}

function saveRubber() {
    var g1h = $('#g1h').val();
    var g1a = $('#g1a').val();
    var g2h = $('#g2h').val();
    var g2a = $('#g2a').val();
    var g3h = $('#g3h').val();
    var g3a = $('#g3a').val();
    var matchID = sessionStorage.matchID;
    var clubName = sessionStorage.ourClub;
    var rubberID = sessionStorage.rubberID;

    db.transaction(
        function(transaction) {
            transaction.executeSql(
                'DELETE FROM rubbers WHERE rubberID = ? and clubName = ? and matchID = ?;', 
                [rubberID, clubName, matchID], function(){
                }, 
                errorHandler
            );
        }
    );
    db.transaction(
        function(transaction) {
            transaction.executeSql(
                'INSERT INTO rubbers (clubName, matchID, rubberID, g1h, g1a, g2h, g2a, g3h, g3a) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);', 
                [clubName, matchID, rubberID, g1h, g1a, g2h, g2a, g3h, g3a], 
                function(){
//                    refreshFixtures();
                    jQT.goBack();
                }, 
                errorHandler
            );
        }
    );
    return false;
}


function loadFixtures() {
    sessionStorage.ourTeam=$('.toolbar h1', this).text();
    $('#ourTeam').val(sessionStorage.ourTeam);
    $('.ourTeam').text(sessionStorage.ourTeam);
    $('.matchDate').text('');
    $('.matchTime').text('');
    $('.matchVenue').text('');
    $('.numCourts').text('');
    $('.homeaway').text('');

	//added to swap 'X' value used when a club has 2 teams in same division
    ourTeamNo=sessionStorage.ourTeam.replace(/[^0-9]/g, '');
    sessionStorage.ourTeamLong=sessionStorage.ourClub+" "+ourTeamNo;

    db.transaction(
        function(transaction) {
            transaction.executeSql(
                'SELECT * FROM fixtures WHERE clubName = ? and (hometeam = ? or awayteam = ?)', 
                [sessionStorage.ourClub, sessionStorage.ourTeamLong, sessionStorage.ourTeamLong], 
                function (transaction, result) {
                    for (var i=0; i < result.rows.length; i++) {
                        var row = result.rows.item(i);
                        
                        var this_record='.'+row.matchID;
			this_record=this_record.substr(0,2)+ourTeamNo+this_record.substr(3);
	                $(this_record+'D').text(row.date);
                    }
                }, 
                errorHandler
            );
        }
    );
}


function rubberSummary() {
    var hr_sum=0;
    var hg_sum=0;
    var ha_sum=0;
    var ar_sum=0;
    var ag_sum=0;
    var aa_sum=0;
    
    if (sessionStorage.homeAway == "Away") {
	$('#homeClub').text(sessionStorage.oppTeam);
	$('#awayClub').text(sessionStorage.ourTeamLong);
    }
    else {
	$('#homeClub').text(sessionStorage.ourTeamLong);
	$('#awayClub').text(sessionStorage.oppTeam);
    }
    if ((oppClub == ourClub) && (sessionStorage.ourTeamLong > sessionStorage.oppTeam)) {
	$('#homeClub').text(sessionStorage.oppTeam);
	$('#awayClub').text(sessionStorage.ourTeamLong);
    }

    db.transaction(
        function(transaction) {
            transaction.executeSql(
                'SELECT * FROM rubbers WHERE clubName = ? and matchID = ?;', 
                [sessionStorage.ourClub, sessionStorage.matchID], 
                function (transaction, result) {
                    for (var i=0; i < result.rows.length; i++) {
                        var row = result.rows.item(i);
	         	ha_sum=ha_sum+parseInt("0"+row.g1h,10)+parseInt("0"+row.g2h,10)+parseInt("0"+row.g3h,10);
	         	aa_sum=aa_sum+parseInt("0"+row.g1a,10)+parseInt("0"+row.g2a,10)+parseInt("0"+row.g3a,10);
			var hg=0;
			var ag=0;
			if (parseInt(row.g1h) > parseInt(row.g1a)) {
				hg_sum=hg_sum+1;
				hg=hg+1;
			}
			if (parseInt(row.g1a) > parseInt(row.g1h)) {
				ag_sum=ag_sum+1;
				ag=ag+1;
			}
			if (parseInt(row.g2h) > parseInt(row.g2a)) {
				hg_sum=hg_sum+1;
				hg=hg+1;
			}
			if (parseInt(row.g2a) > parseInt(row.g2h)) {
				ag_sum=ag_sum+1;
				ag=ag+1;
			}
			if (parseInt(row.g3h) > parseInt(row.g3a)) {
				hg_sum=hg_sum+1;
				hg=hg+1;
			}
			if (parseInt(row.g3a) > parseInt(row.g3h)) {
				ag_sum=ag_sum+1;
				ag=ag+1;
			}
			if (hg == 2) {
				hr_sum=hr_sum+1;
			}
			if (ag == 2) {
				ar_sum=ar_sum+1;
			}
                    }
    		    $('#homeGames').text(hg_sum);
    		    $('#homeRubbers').text(hr_sum);
    		    $('#homeGames').text(hg_sum);
    		    $('#homeAces').text(ha_sum);
    		    $('#awayRubbers').text(ar_sum);
    		    $('#awayGames').text(ag_sum);
    		    $('#awayAces').text(aa_sum);   
                }, 
                errorHandler
            );
        }
    );    
sessionStorage.viewMode=0;
refreshSummary();
}

function errorHandler(transaction, error) {
    alert('Oops. Error was '+error.message+' (Code '+error.code+')');
    return true;
}

function gotoRubber() {
	sessionStorage.rubberID=$(this).attr('id');
	sessionStorage.ourPair=sessionStorage.rubberID.substr(1,1);
	sessionStorage.oppPair=sessionStorage.rubberID.substr(3,1);
	$('.ourPair').text("Pair "+sessionStorage.ourPair);
    	$('.oppPair').text("Pair "+sessionStorage.oppPair);
    	$('.oppPairFull').text("VS Pair "+sessionStorage.oppPair+" ("+sessionStorage.oppTeam+")");
    	
	switch(sessionStorage.ourPair)
	{
	case "1":
	  $('#ourPlayerA').text($('#ourPlayer1').val());
	  $('#ourPlayerB').text($('#ourPlayer2').val());
	  break;
	case "2":
	  $('#ourPlayerA').text($('#ourPlayer3').val());
	  $('#ourPlayerB').text($('#ourPlayer4').val());
	  break;
	case "3":
	  $('#ourPlayerA').text($('#ourPlayer5').val());
	  $('#ourPlayerB').text($('#ourPlayer6').val());
	  break;
	default:
	  $('#ourPlayerA').text('');
	  $('#ourPlayerB').text('');
	}    	

	var noName="Pair "+sessionStorage.ourPair;
	if ($('#ourPlayerA').text()=="") {
		$('#ourPlayerA').text(noName)
	}

	jQT.goTo($('#rubber'), 'slide');
}


function loadClub() {
    	sessionStorage.ourClub=$('.toolbar h1', this).text();
    	$('#ourClub').val(sessionStorage.ourClub);
    	$('.ourClub').text(sessionStorage.ourClub);
}


function altView() {
	sessionStorage.viewMode=parseInt(sessionStorage.viewMode) + 1;
	if (sessionStorage.viewMode >= 3) {
		sessionStorage.viewMode = 0;
	}
	refreshSummary();
}


function refreshSummary() {

	var homeVal = [0,0,0];	
	var awayVal = [0,0,0];

	
// 0 = Rubber W/L Summary
// 1 = Total Aces per Home Pair
// 2 = Total Aces per Away Pair


// Default Values
	var playSeq='';
	switch(sessionStorage.viewMode)
	{
	case '0':
	  playSeq='186429753';
	  break;
	case '1':
	  playSeq='+  +  +  ';
	  break;
	case '2':
	  playSeq='+++      ';
	  break;
	default:
	}    	

        for (var i=0; i < 9; i++) {
		var awayPair= i%3 + 1;
		var homePair= (i - i%3) / 3 + 1;
		var boxID='#h'+homePair+'v'+awayPair;
	    	$(boxID).text(playSeq.substr(i,1));
	}

	
    db.transaction(
        function(transaction) {
            transaction.executeSql(
                'SELECT * FROM rubbers WHERE clubName = ? and matchID = ?;', 
                [sessionStorage.ourClub, sessionStorage.matchID], 
                function (transaction, result) {
                    for (var i=0; i < result.rows.length; i++) {
                        var row = result.rows.item(i);

			var homePair=row.rubberID.substr(1,1);
			var awayPair=row.rubberID.substr(3,1);

			switch(sessionStorage.viewMode)
			{
			case '0':
			  homeVal[0]=(parseInt("0"+row.g1h,10) > parseInt("0"+row.g1a,10)) + 
			  	(parseInt("0"+row.g2h,10) > parseInt("0"+row.g2a,10)) + 
			  	(parseInt("0"+row.g3h,10) > parseInt("0"+row.g3a,10));
			  awayVal[0]=(parseInt("0"+row.g1a,10) > parseInt("0"+row.g1h,10)) + 
			  	(parseInt("0"+row.g2a,10) > parseInt("0"+row.g2h,10)) + 
			  	(parseInt("0"+row.g3a,10) > parseInt("0"+row.g3h,10));
   			  var boxID='#h'+homePair+'v'+awayPair;
			  if (homeVal[0]+awayVal[0]>0) {
			    	  $(boxID).text('-');
				  if (homeVal[0]==2) {$(boxID).text('H')};
				  if (awayVal[0]==2) {$(boxID).text('A')};
			  }
			case '1':
			  homeVal[homePair-1]=parseInt("0"+homeVal[homePair-1],10)+parseInt("0"+row.g1h,10)+parseInt("0"+row.g2h,10)+parseInt("0"+row.g3h,10);
			  awayVal[homePair-1]=parseInt("0"+awayVal[homePair-1],10)+parseInt("0"+row.g1a,10)+parseInt("0"+row.g2a,10)+parseInt("0"+row.g3a,10);
			  break;
			case '2':
			  homeVal[awayPair-1]=parseInt("0"+homeVal[awayPair-1],10)+parseInt("0"+row.g1h,10)+parseInt("0"+row.g2h,10)+parseInt("0"+row.g3h,10);
			  awayVal[awayPair-1]=parseInt("0"+awayVal[awayPair-1],10)+parseInt("0"+row.g1a,10)+parseInt("0"+row.g2a,10)+parseInt("0"+row.g3a,10);
			  break;
			}    	

                    }
                    for (var i=1; i < 4; i++) {
			switch(sessionStorage.viewMode)
			{
			case '1':
   			  var boxID='#h'+i+'v2';
	    		  $(boxID).text(homeVal[i-1]);
   			  var boxID='#h'+i+'v3';
	    		  $(boxID).text(awayVal[i-1]);
			  break;
			case '2':
   			  var boxID='#h2'+'v'+i;
	    		  $(boxID).text(homeVal[i-1]);
   			  var boxID='#h3v'+i;
	    		  $(boxID).text(awayVal[i-1]);
			  break;
			}    	
                    }
                }, 
                errorHandler
            );
        }
    );	


//	jQT.goTo($('#scorecard'), 'slide');
}
