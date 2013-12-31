/*
    (c) 2011 Mark Ransom
    See LICENSE.txt for license.
*/

var db;
            
var jQT = new $.jQTouch({
                icon: 'lib/apple-touch-icon.png',
                addGlossToIcon: true,
                useFastTouch: true,
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

sessionStorage.season="2012-2013";
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
      
      
// If online, show all online-only resources
  jQuery('.online-required').hide();
  jQuery('.offline-only').show();
  if (window.navigator.onLine) {
    jQuery('.online-required').show();
    jQuery('.offline-only').hide();
  }

// var userAgent = navigator.userAgent.toLowerCase();
// var isiPhone = (userAgent.indexOf('iphone') != -1 || userAgent.indexOf('ipod') != -1) ? true : false;
// clickEvent = isiPhone ? 'tap' : 'click';

// page onload & click functions

    $('#home').bind('pageAnimationStart', loadClub);
    $('#match').bind('pageAnimationStart', loadMatch);
    $('#ourPlayers').bind('pageAnimationStart', loadPlayers);
    $('#oppPlayers').bind('pageAnimationStart', loadPlayers);
    $('#scorecard').bind('pageAnimationStart', rubberSummary);
    $('#rubber').bind('pageAnimationStart', loadRubber);
    $('.fixtures').bind('pageAnimationStart', loadFixtures);

    $('#venues').bind('pageAnimationStart', loadVenues); 
    $('#clubs').bind('pageAnimationStart', loadClubs); 
    $('#venue_details').bind('pageAnimationStart', loadVenueDetails); 
    $('#club_details').bind('pageAnimationStart', loadClubDetails);  
    $('#teams').bind('pageAnimationStart', initClub);  

    $('#SaveMatch').bind('click', saveMatch);
    $('#SavePlayers').bind('click', savePlayers);
    $('#SavePlayers2').bind('click', savePlayers);
    $('#SaveRubber').bind('click', saveRubber);
    $('#SendMail').bind('click', FillReport);
    $('#match2scorecard').bind('click', match2scorecard);
    $('#match2ourPlayers').bind('click', match2ourPlayers);
    $('#ourPlayers2scorecard').bind('click', players2scorecard);
    $('#ourPlayers2oppPlayers').bind('click', ourPlayers2oppPlayers);
    $('#oppPlayers2scorecard').bind('click', players2scorecard);
    $('#oppPlayers2ourPlayers').bind('click', oppPlayers2ourPlayers);
    $('#scorecard2oppPlayers').bind('click', scorecard2oppPlayers);
    $('#scorecard2ourPlayers').bind('click', scorecard2ourPlayers);
    $('.rubber').bind('click', gotoRubber);
    $('.ovcolumn').bind('click', toggleType);
    $('.ovrow').bind('click', toggleType);


    $('#teams ul li a').bind('click', function(e, data) {
    	var wkdiv=$(this).html(); 
	wkdiv=wkdiv.replace(/.*<small>/g,"");
	wkdiv=wkdiv.replace(/<\/small>.*/g,""); 
    	sessionStorage.division=wkdiv;
    });
	
    $('.fixtures ul li a').bind('click', function(e, data) {
    	sessionStorage.oppTeam=$(this).html().replace(/\s\s.*/, '');
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
                'CREATE TABLE IF NOT EXISTS fixtures2 ' +
                ' (id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, season TEXT,' +
                ' clubName TEXT, matchID TEXT, date DATE, time TIME, venue TEXT, pairs TEXT,' +
                ' hometeam TEXT NOT NULL, awayteam TEXT NOT NULL );'
            );
        }
    );    
    db.transaction(
        function(transaction) {
            transaction.executeSql(
                'CREATE TABLE IF NOT EXISTS players2 ' +
                ' (id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, season TEXT,' +
                ' clubName TEXT, matchID TEXT, team TEXT,' +
                ' player1 TEXT, player2 TEXT, player3 TEXT, player4 TEXT, player5 TEXT, player6 TEXT);'
            );
        }
    );
    db.transaction(
        function(transaction) {
            transaction.executeSql(
                'CREATE TABLE IF NOT EXISTS rubbers2 ' +
                ' (id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, season TEXT,' +
                ' clubName TEXT, matchID TEXT, rubberID TEXT,' +
                ' g1h TEXT, g1a TEXT, g2h TEXT, g2a TEXT, g3h TEXT, g3a TEXT);'
            );
        }
    );

$('#progress').remove();

}

function initClub() {
    	sessionStorage.ourClub=$('#ourClubName').html();
}

function loadClubs() {
  $.getJSON("jsonclubs.php",
        function(data) {
        	if (data.length > 0) {
        		$('.listofclubs').html('');
			for ( i=0; i<data.length; i++ ) {     
				var this_data = data[i]; 
				var this_element='<li class="arrow" id="club:'+i+'"><a href="#club_details">' + this_data.club_name + '</a></li>';
	        		$('.listofclubs').append(this_element);	
		        }
		}
	}
    );
}

function loadClubDetails() {

  var jsonID=$(this).data('referrer').parent().attr('id');

  $.getJSON("http://www.nottsba.co.uk/scorecard/jsonclubs.php"+"&callback=?", 
        function(data) {
        alert(data.length);
        	if (data.length >= jsonID.substr(5)) {
			var this_data = data[jsonID.substr(5)];  		
		
        		$('.club_info').html('');
	        	$('.club_info').append('<ul class="rounded">');

			var this_club='<li>' + this_data.club_name + '</li>';
		        if (this_data.club_name !== null) {$('.club_info').append(this_club);}	
			var this_league='<li>' + this_data.club_league + '</li>';
		        if (this_data.club_league !== null) {$('.club_info').append(this_league);}	

		        $('.club_info').append('</ul><h2>Club Secretary</h2><ul class="rounded">');
	
			var this_secname='<li>' + this_data.club_secretary + '</li>';
		        if (this_data.club_secretary !== null) {$('.club_info').append(this_secname);}
			var this_secema='<li><a target="_blank" href="mailto:'+this_data.club_secretary_email+'">' + this_data.club_secretary_email + '</a></li>';
		        if (this_data.club_secretary_email !== null) {$('.club_info').append(this_secema);}	
			var this_sectel='<li><a href="tel:'+this_data.club_secretary_phone+'">' + this_data.club_secretary_phone + '</a></li>';
		        if (this_data.club_secretary_phone !== null) {$('.club_info').append(this_sectel);}
			var this_secmob='<li><a href="tel:'+this_data.club_secretary_mobile+'">' + this_data.club_secretary_mobile + '</li>';
		        if (this_data.club_secretary_mobile !== null) {$('.club_info').append(this_secmob);}	
	        	$('.club_info').append("</ul>");
	        }
	}
    );
}


function loadVenues() {
	$.getJSON("jsonvenues.php",
	        function(data) {
	        	if (data.length > 0) {
				localStorage.offlineVenues=JSON.stringify(data);
			}
		}
	);
	if (localStorage.offlineVenues != undefined && localStorage.offlineVenues.length > 0) {
		data=localStorage.offlineVenues;
	        $('.listofvenues').html('');
		for ( i=0; i<data.length; i++ ) {     
			var this_data = data[i]; 
			var this_element='<li class="arrow" id="venue:'+i+'"><a href="#venue_details">' + this_data.venue + '</a></li>';
		        $('.listofvenues').append(this_element);	
		}
	}
}

function loadVenueDetails() {
 
  var jsonID=$(this).data('referrer').parent().attr('id');

  $.getJSON("jsonvenues.php",
        function(data) {
        	if (data.length >= jsonID.substr(6)) {
			var this_data = data[jsonID.substr(6)];  		

        		$('.venue_info').html('');
		        $('.venue_info').append("<h2>Address</h2>");
	        	$('.venue_info').append('<ul class="rounded">');

			var this_venue='<li>' + this_data.venue + '</li>';
		        $('.venue_info').append(this_venue);	
			var this_add1='<li class="forward"><a target="_blank" href="http://maps.google.com/maps?q='+this_data.venue_address_1+'">' + this_data.venue_address_1 + '</a></li>';
		        $('.venue_info').append(this_add1);	
			var this_area='<li>' + this_data.venue_area + '</li>';
		        $('.venue_info').append(this_area);	

		        $('.venue_info').append("</ul><h2>Contact Info</h2><ul>");

			var this_venue_tel='<li><a href="tel:'+this_data.venue_telephone+'">' + this_data.venue_telephone + '</a></li>';
		        $('.venue_info').append(this_venue_tel);	
			var this_venue_web='<li class="forward"><a target="_blank" href="http://'+this_data.venue_website+'">Venue Website</a></li>';
		        $('.venue_info').append(this_venue_web);		
	        	$('.venue_info').append("</ul>");
	        }
	}
    );
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
                'SELECT * FROM fixtures2 WHERE season = ? and clubName = ? and matchID = ?;', 
                [sessionStorage.season, sessionStorage.ourClub, matchID], 
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
                'DELETE FROM fixtures2 WHERE season = ? and matchID = ? and clubName = ?;', 
                [sessionStorage.season, matchID, clubName], function(){
                }, 
                errorHandler
            );
        }
    );
    db.transaction(
        function(transaction) {
            transaction.executeSql(
                'INSERT INTO fixtures2 (season, clubName, matchID, date, time, venue, pairs, hometeam, awayteam) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);', 
                [sessionStorage.season, clubName, matchID, date, time, venue, pairs, hometeam, awayteam], 
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
                'SELECT * FROM players2 WHERE season = ? and clubName = ? and matchID = ?;', 
                [sessionStorage.season, sessionStorage.ourClub, sessionStorage.matchID], 
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
                'DELETE FROM players2 WHERE season = ? and matchID = ? and clubName = ?;', 
                [sessionStorage.season, matchID, clubName], function(){
                }, 
                errorHandler
            );
        }
    );
    db.transaction(
        function(transaction) {
            transaction.executeSql(
                'INSERT INTO players2 (season, clubName, matchID, team, player1, player2, player3, player4, player5, player6) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);', 
                [sessionStorage.season, clubName, matchID, ourTeam, ourPlayer1, ourPlayer2, ourPlayer3, ourPlayer4, ourPlayer5, ourPlayer6], 
                function(){
                }, 
                errorHandler
            );
        }
    );
    db.transaction(
        function(transaction) {
            transaction.executeSql(
                'INSERT INTO players2 (season, clubName, matchID, team, player1, player2, player3, player4, player5, player6) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);', 
                [sessionStorage.season, clubName, matchID, oppTeam, oppPlayer1, oppPlayer2, oppPlayer3, oppPlayer4, oppPlayer5, oppPlayer6], 
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
                'SELECT * FROM rubbers2 WHERE season = ? and clubName = ? and matchID = ? and rubberID = ?;', 
                [sessionStorage.season, sessionStorage.ourClub, sessionStorage.matchID, sessionStorage.rubberID], 
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
                'DELETE FROM rubbers2 WHERE season = ? and rubberID = ? and clubName = ? and matchID = ?;', 
                [sessionStorage.season, rubberID, clubName, matchID], function(){
                }, 
                errorHandler
            );
        }
    );
    db.transaction(
        function(transaction) {
            transaction.executeSql(
                'INSERT INTO rubbers2 (season, clubName, matchID, rubberID, g1h, g1a, g2h, g2a, g3h, g3a) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);', 
                [sessionStorage.season, clubName, matchID, rubberID, g1h, g1a, g2h, g2a, g3h, g3a], 
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
                'SELECT * FROM fixtures2 WHERE season= ? and clubName = ? and (hometeam = ? or awayteam = ?)', 
                [sessionStorage.season, sessionStorage.ourClub, sessionStorage.ourTeamLong, sessionStorage.ourTeamLong], 
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
                'SELECT * FROM rubbers2 WHERE season = ? and clubName = ? and matchID = ?;', 
                [sessionStorage.season, sessionStorage.ourClub, sessionStorage.matchID], 
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

refreshSummary();
}

function errorHandler(transaction, error) {
    alert('Oops. Error was '+error.message+' (Code '+error.code+')');
    return true;
}

function gotoRubber() {
	sessionStorage.rubberID=$(this).attr('id');
	
	if (sessionStorage.homeAway=="Home") {
		sessionStorage.ourPair=sessionStorage.rubberID.substr(1,1);
		sessionStorage.oppPair=sessionStorage.rubberID.substr(3,1);
	}
	else
	{
		sessionStorage.ourPair=sessionStorage.rubberID.substr(3,1);
		sessionStorage.oppPair=sessionStorage.rubberID.substr(1,1);
	}
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
    	$('#ourClub').val(sessionStorage.ourClub);
    	$('.ourClub').text(sessionStorage.ourClub);
}

function FillReport() {
	var playerNotes="";
	var fixtureNotes="";
	var allplayers="";
	
	$("#NoteTitle").text(sessionStorage.ourClub+" "+sessionStorage.ourTeam+" vs "+sessionStorage.oppTeam+" match report");

	homeoraway=$("#homeaway").val();
	matchvenue=$('#matchVenue').val();
	matchdate=$('#matchDate').val();
	
	fixtureNotes="Our "+sessionStorage.ourTeam+" team played "+sessionStorage.oppTeam;
	if (homeoraway) {
		fixtureNotes=homeoraway+" Match: "+fixtureNotes;
	}
	if (matchvenue) {
		fixtureNotes=fixtureNotes+" at "+matchvenue;
	}
	if (matchdate) {
		fixtureNotes=fixtureNotes+" on "+matchdate;
	}

	allplayers=$('#ourPlayer1').val()+$('#ourPlayer2').val()+$('#ourPlayer3').val()+$('#ourPlayer4').val()+$('#ourPlayer5').val()+$('#ourPlayer6').val();
	if (allplayers) {
		playerNotes=sessionStorage.ourClub+" players:\n\nPair1: "+$('#ourPlayer1').val()+" - "+$('#ourPlayer2').val();
		playerNotes=playerNotes+"\nPair2: "+$('#ourPlayer3').val()+" - "+$('#ourPlayer4').val();
		playerNotes=playerNotes+"\nPair3: "+$('#ourPlayer5').val()+" - "+$('#ourPlayer6').val();
		//	$("#PlayerNotes").val(playerNotes);
	}

	allplayers=$('#oppPlayer1').val()+$('#oppPlayer2').val()+$('#oppPlayer3').val()+$('#oppPlayer4').val()+$('#oppPlayer5').val()+$('#oppPlayer6').val();
	if (allplayers) {
		playerNotes=playerNotes+"\n\n"+sessionStorage.oppTeam+" players:\n\nv1: "+$('#oppPlayer1').val()+" - "+$('#oppPlayer2').val();
		playerNotes=playerNotes+"\nv2: "+$('#oppPlayer3').val()+" - "+$('#oppPlayer4').val();
		playerNotes=playerNotes+"\nv3: "+$('#oppPlayer5').val()+" - "+$('#oppPlayer6').val();
	}

	$("#NoteDetails").val("Comments:\n\n");

	homescore=parseInt("0"+$('#homeRubbers').text(),10);
	awayscore=parseInt("0"+$('#awayRubbers').text(),10);
	if (homescore+awayscore==9) {
		if ((homescore>awayscore) && (homeoraway=="Home")||(homescore<awayscore) && (homeoraway=="Away")) {
			overall="\n\nFinal score "+sessionStorage.ourClub+" won ";
		} else {
			overall="\n\nFinal score "+sessionStorage.ourClub+" lost ";
		}
	} else {
		overall="\n\nIncomplete result ";
	}
	
	fixtureNotes=fixtureNotes+overall+$('#homeRubbers').text()+" - "+$('#awayRubbers').text();
	$("#FixtureNotes").text(fixtureNotes);
	$("#PlayerNotes").val(playerNotes);

	reportResults();
	window.setTimeout('SendMail()',10);
}

function SendMail() {
	var subject=encodeURIComponent($("#NoteTitle").text());
	var body=encodeURIComponent($("#FixtureNotes").text());
	body=body+"%0A%0A"+encodeURIComponent($("#PlayerNotes").val());
	body=body+"%0A%0A"+encodeURIComponent($("#ResultNotes").val());
	body=body+"%0A%0A"+encodeURIComponent($("#NoteDetails").val());
	email_address="nottsba-senior-league-results@googlegroups.com";
	var mailtext="mailto:"+email_address+"?subject="+subject+"&body="+body;
	window.open(mailtext,'_self');
    	jQT.goBack('#match');
}

function toggleType() {
	if (sessionStorage.viewType <= 1) {
		sessionStorage.viewType=3;
	} else {
		sessionStorage.viewType=sessionStorage.viewType-1;
	}
	switch(sessionStorage.viewType)
	{
		case '1': // rubbers
		$('#rubbertit').html('<b>RUBBERS</b>');
		$('#gametit').html('Games');
		$('#acetit').html('Aces');
		break;
		case '2': // games
		$('#rubbertit').html('Rubbers');
		$('#gametit').html('<b>GAMES</b>');
		$('#acetit').html('Aces');
		break;
		case '3': // aces
		$('#rubbertit').html('Rubbers');
		$('#gametit').html('Games');
		$('#acetit').html('<b>ACES</b>');
		break;
	}	
	refreshSummary();	
}

function refreshSummary() {

	var homeVal = 0;
	var awayVal = 0;
	var homeTot = [0,0,0];	
	var awayTot = [0,0,0];
	var altrowTot = [0,0,0];	
	var altcolTot = [0,0,0];
	var playSeq='         ';
	
	if (!sessionStorage.viewType) {sessionStorage.viewType=3};

	sessionStorage.viewTeam=2;
	
// viewType options
// 0 = Sequence of play
// 1 = Rubbers Summary
// 2 = Games Summary
// 3 = Aces Details

// viewTeam options
// 0 = Home
// 1 = Away
// 2 = Both

	playSeq='186429753';
	for (var i=0; i < 9; i++) {
		var awayPair= i%3 + 1;
		var homePair= (i - i%3) / 3 + 1;
		var boxID='#h'+homePair+'v'+awayPair;
		$(boxID).text(playSeq.substr(i,1));
	}

	$('#h1v4').html('Tap<br/>white');
	$('#h2v4').html('cells<br/>to');
	$('#h3v4').html('edit<br/>scores');
	$('#h4v1').html('Tap<br/><br/>to');
	$('#h4v2').html('other<br/><br/>toggle');
	$('#h4v3').html('cells<br/><br/>view');
	$('#h4v4').text('-');

  jQuery('#ovtotals').hide();
  if (sessionStorage.viewType!='0') {
    jQuery('#ovtotals').show();
    db.transaction(
        function(transaction) {
            transaction.executeSql(
                'SELECT * FROM rubbers2 WHERE season = ? and clubName = ? and matchID = ?;', 
                [sessionStorage.season, sessionStorage.ourClub, sessionStorage.matchID], 
                function (transaction, result) {
                    for (var i=0; i < result.rows.length; i++) {
                        var row = result.rows.item(i);

			var homePair=row.rubberID.substr(1,1);
			var awayPair=row.rubberID.substr(3,1);
   			var boxID='#h'+homePair+'v'+awayPair;
			var innerString="";

			switch(sessionStorage.viewType)
			{
			case '1': // rubbers
			  homeVal=(parseInt("0"+row.g1h,10) > parseInt("0"+row.g1a,10)) + 
			  	(parseInt("0"+row.g2h,10) > parseInt("0"+row.g2a,10)) + 
			  	(parseInt("0"+row.g3h,10) > parseInt("0"+row.g3a,10));
			  awayVal=(parseInt("0"+row.g1a,10) > parseInt("0"+row.g1h,10)) + 
			  	(parseInt("0"+row.g2a,10) > parseInt("0"+row.g2h,10)) + 
			  	(parseInt("0"+row.g3a,10) > parseInt("0"+row.g3h,10));

			  if (homeVal+awayVal>0) {
			    	$(boxID).text('-');
				  	if (homeVal==2) {
				   		$(boxID).text('1 ~ 0');
	   			  		homeTot[homePair-1]=parseInt("0"+homeTot[homePair-1],10)+1;
	   			  		awayTot[awayPair-1]=parseInt("0"+awayTot[awayPair-1],10)+1;
					}
				  	if (awayVal==2) {
				   		$(boxID).text('0 ~ 1');
	   			  		altrowTot[homePair-1]=parseInt("0"+altrowTot[homePair-1],10)+1;
	   			  		altcolTot[awayPair-1]=parseInt("0"+altcolTot[awayPair-1],10)+1;
					}
			  }
			  break;
			case '2': // games
			  homeVal=(parseInt("0"+row.g1h,10) > parseInt("0"+row.g1a,10)) + 
			  	(parseInt("0"+row.g2h,10) > parseInt("0"+row.g2a,10)) + 
			  	(parseInt("0"+row.g3h,10) > parseInt("0"+row.g3a,10));
			  awayVal=(parseInt("0"+row.g1a,10) > parseInt("0"+row.g1h,10)) + 
			  	(parseInt("0"+row.g2a,10) > parseInt("0"+row.g2h,10)) + 
			  	(parseInt("0"+row.g3a,10) > parseInt("0"+row.g3h,10));

	 	   	  $(boxID).text(homeVal+" ~ "+awayVal);			  	
			  homeTot[homePair-1]=parseInt("0"+homeTot[homePair-1],10)+homeVal;
			  awayTot[awayPair-1]=parseInt("0"+awayTot[awayPair-1],10)+homeVal;
			  altrowTot[homePair-1]=parseInt("0"+altrowTot[homePair-1],10)+awayVal;
			  altcolTot[awayPair-1]=parseInt("0"+altcolTot[awayPair-1],10)+awayVal;
			  break;
			case '3': // aces			  
			  if (row.g1h + row.g1a + row.g2h + row.g2a + row.g3h + row.g3a > 0) {
				  homeVal=parseInt("0"+row.g1h,10)+parseInt("0"+row.g2h,10)+parseInt("0"+row.g3h,10);
				  awayVal=parseInt("0"+row.g1a,10)+parseInt("0"+row.g2a,10)+parseInt("0"+row.g3a,10);
		 	   	  $(boxID).text(homeVal+" ~ "+awayVal);			  	
				  homeTot[homePair-1]=parseInt("0"+homeTot[homePair-1],10)+homeVal;
				  awayTot[awayPair-1]=parseInt("0"+awayTot[awayPair-1],10)+homeVal;
				  altrowTot[homePair-1]=parseInt("0"+altrowTot[homePair-1],10)+awayVal;
				  altcolTot[awayPair-1]=parseInt("0"+altcolTot[awayPair-1],10)+awayVal;

				  innerString="<table class='innerblock'>";
			  }
			  if (row.g1h + row.g1a > 0) {
				  innerString=innerString+"<tr><td>"+parseInt("0"+row.g1h,10)+"-"+parseInt("0"+row.g1a,10)+"</td></tr>";
			  }
			  if (row.g2h + row.g2a > 0) {
				  innerString=innerString+"<tr><td>"+parseInt("0"+row.g2h,10)+"-"+parseInt("0"+row.g2a,10)+"</td></tr>";
			  }
			  if (row.g3h + row.g3a > 0) {
				  innerString=innerString+"<tr><td>"+parseInt("0"+row.g3h,10)+"-"+parseInt("0"+row.g3a,10)+"</td></tr>";
			  }
			  if (row.g1h + row.g1a + row.g2h + row.g2a + row.g3h + row.g3a > 0) {
			    	  innerString=innerString+"</table>";
		 	   	  $(boxID).html(innerString);			  			    	
			  }
			  break;
			}    	

                    }
		    if (sessionStorage.viewType!='0') {
			    if (homeVal+awayVal>0) {
	                    	for (var i=1; i < 4; i++) {
		   			var boxID='#h'+i+'v4';
		 		   	$(boxID).text(homeTot[i-1]+"~"+altrowTot[i-1]);
					var boxID='#h4'+'v'+i;
				    	$(boxID).text(awayTot[i-1]+"~"+altcolTot[i-1]);
	                    	}
	                    	homeVal=homeTot[0]+homeTot[1]+homeTot[2];
	                    	awayVal=altrowTot[0]+altrowTot[1]+altrowTot[2];
				$('#h4v4').text(homeVal+"~"+awayVal);
			    }
		    }

                }, 
                errorHandler
            );
        }
    );	
  }
}

function reportResults() {

	var homePair = "";
	var awayPair = "";
	var homeVal = 0;
	var awayVal = 0;
	var homeTot = [0,0,0];	
	var awayTot = [0,0,0];
	var altrowTot = [0,0,0];	
	var altcolTot = [0,0,0];
	var playSeq='         ';
	
    if (sessionStorage.homeAway == "Away") {
		reportseq="147582936";
		homePair="123231312";
		awayPair="111222333";
    }
    else {
		reportseq="132546987";
		homePair="111222333";
		awayPair="132213321";
    }

	$('#ResultNotes').text('The Scores:');

    db.transaction(
        function(transaction) {
            transaction.executeSql(
                'SELECT * FROM rubbers2 WHERE season = ? and clubName = ? and matchID = ? order by rubberID', 
                [sessionStorage.season, sessionStorage.ourClub, sessionStorage.matchID], 
                function (transaction, result) {
                    if (result.rows.length==9) {

			for (var i=0; i < 9; i++) {
				var addText="\n";
				if (Math.floor(i/3)==i/3) {
					addText=addText+"\nPair"+Math.floor(i/3+1)+"\n";
				}
	                        var row = result.rows.item(reportseq.substr(i,1)-1);
	                        if (sessionStorage.homeAway == "Home") {
					addText=addText+"v"+awayPair.substr(i,1)+": ";
				} else {
					addText=addText+"h"+homePair.substr(i,1)+": ";
				}
				addText=addText+row.g1h+":"+row.g1a+", "+row.g2h+":"+row.g2a;
				if (row.g3h+row.g3a>0) {
					addText=addText+", "+row.g3h+":"+row.g3a;
				}
	 	   		$('#ResultNotes').append(addText);			  	
			}
                    }

                }, 
                errorHandler
            );
        }
    );	
   
}
