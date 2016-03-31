/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

var account = {
    'username' : 'julien2',
    'password' : 'password'
}

var senderID = '117598524755';

var tokens;
var endpoint;
var access_token;
var weeklyMatchup;


//GLOBAL VARIABLES
var gamekey = localStorage.getItem("gamekey");
var teamkey = localStorage.getItem("teamkey");
var leaguekey = localStorage.getItem("leaguekey");
var currentweek = localStorage.getItem("currentweek");


var returnQuery = function(url) {
    return 'http://query.yahooapis.com/v1/public/yql?q=' + encodeURIComponent('select * from xml where url="' + endpoint + url + access_token + '"') + '&format=xml&callback=?'
}


var getAccessToken = function() {
    $.ajax({
        type: "POST",
        url: "http://julienlu.com/yahoofantasysports/getRequestToken.php",
        datatype: "json",
        data: JSON.stringify(account)
    }).done(function(msg){
        console.log(msg);
        tokens = JSON.parse(msg);
        //console.log(typeof msg);
        if (typeof  tokens === 'object') {
            endpoint = 'http://julienlu.com/yahoofantasysports/callAPI.php?url=';
            access_token = '&access_token_secret=' + tokens.access_token_secret + '&access_token=' + tokens.access_token;

            getUser();

            if(teamkey != null) {
                //showSportStatCategories();
                //showListTeams();
                showListLeague(leaguekey);           
            }
        }
    });
};

//GET USER--------------------------------------------
var getUser = function() {
    var user = '/fantasy/v2/users;use_login=1/games';
    var getuser = returnQuery(user);

    $.getJSON(getuser, function(data){
    })
    .done(function(data){
        console.log('success1');
        var xmldataUser = data.results[0];
        //console.log(xmldataUser);
        var sports = [];
        $(xmldataUser).find('games game season').each(function(){
            if($(this).text() == '2014') {
                var sport = {
                    "name" : $(this).parent().find('code').text(),
                    "gamekey" : $(this).parent().find('game_key').text()
                }
                //$('.leagues').append('<br />' + $(this).parent().html() + '<br />');
                if ( jQuery.inArray( sport , sports ) == -1) {
                    sports.push(sport); 
                }
            }
        });

        for (var x in sports){
            $('.sports-pick').append('<a href="javascript:void(0);" data-gamekey="' + sports[x].gamekey +'">' + sports[x].name + '</a><br />');
        }

        showListTeams();
    })
    .error(function(){
        console.log('failed1');
    });
}


//STAT CAT---------------------------------
var showSportStatCategories = function() {
    var stats = '/fantasy/v2/game/' + gamekey + '/stat_categories';
    var getStats = returnQuery(stats);

    $.getJSON(getStats, function(data){
    })
    .done(function(data){
        console.log('success4');
        var xmldataStats = data.results[0];
        //console.log(xmldataStats);
        $(xmldataStats).find('stat_categories').each(function(){
            $('.stats').append('<br />' + $(this).html() + '<br />'); 
        });
    })
    .error(function(){
        console.log('failed4');
    });                   
}


//LIST TEAMS---------------------------------
var showListTeams = function() {
    var teams = '/fantasy/v2/users;use_login=1/games;game_keys=' + gamekey + '/teams';
    var getTeams = returnQuery(teams);

    $.getJSON(getTeams, function(data){
    })
    .done(function(data){
        console.log('success2');
        var xmldataTeams = data.results[0];
        //console.log(xmldataTeams);
        //TODO - ADJUST FOR MULTIPLE TEAMS IN SAME SPORT
        $(xmldataTeams).find('team').each(function(){
            teamkey = $(this).find('team_key').html();
            localStorage.setItem("teamkey", teamkey);
            $('.league-id').append('<br /><a href="javascript:void(0);" class="teamkey">' + teamkey + '</a><br />');
            //RETURNS: 342.l.34135.t.4
            //got from click
        });
    })
    .error(function(){
        console.log('failed2');
    });

}


//LEAGUE---------------------------------
var showListLeague = function() {
    var league = '/fantasy/v2/league/' + leaguekey;
    var getLeague = returnQuery(league);
    $.getJSON(getLeague, function(data){
    })
    .done(function(data){
        console.log('success6');
        var xmldataLeague = data.results[0];
        //console.log(xmldataLeague);
        currentweek = $(xmldataLeague).find('current_week').text();
        localStorage.setItem("currentweek", currentweek);
        showRoster();
        showMatchup();
    })
    .error(function(){
        console.log('failed6');
    });
}


//MATCHUP STATS----------------------------------------
var showMatchup = function() {
    var matchup = '/fantasy/v2/league/' + leaguekey + '/scoreboard;week=' + currentweek;
    var getMatchup = returnQuery(matchup);
    $.getJSON(getMatchup, function(data){
    })
    .done(function(data){
        console.log('success7');
        var xmldataMatchup = data.results[0];
        console.log(xmldataMatchup);
        //GalaxyGear.sendData(e.handle, xmldataMatchup);
        var week, week_start, week_end, ownerIndex;
        var matches = [];
        var countMatchups = 0;

        $(xmldataMatchup).find('matchup').each(function(){
            var oppenents = $(this).find('team');

            oppenents.each(function(){
                $('.matchup').append('<br />' + $(this).find('name').text() + ' - ' + $(this).find('team_points total').text());
            });
            $('.matchup').append('<br />');

            var owner = ($(oppenents).find('is_current_login').text() == '1') ? true : false;

            week = $(this).find('week').html();
            week_start = $(this).find('week_start').html();
            week_end = $(this).find('week_end').html();

            matches[countMatchups++] = {
                "away_name"         : $(oppenents[0]).find('name').text(),
                "away_points"       : $(oppenents[0]).find('team_points total').text(),
                "away_projection"   : $(oppenents[0]).find('team_projected_points total').text(),
                "away_manager"      : $(oppenents[0]).find('nickname').text(),
                "away_image"        : $(oppenents[0]).find('team_logos url').text(),
                "home_name"         : $(oppenents[1]).find('name').text(),
                "home_points"       : $(oppenents[1]).find('team_points total').text(),
                "home_projection"   : $(oppenents[1]).find('team_projected_points total').text(),
                "home_manager"      : $(oppenents[1]).find('nickname').text(),
                "home_image"        : $(oppenents[1]).find('team_logos url').text(),
                "current_owner"     : owner
            }

        });

        for (var match in matches) {
            if (matches[match].current_owner == true) {
                ownerIndex = match;
            }
        }

        matches.move(ownerIndex, 0);

        var dataMatchup = {
            "week"  : week,
            "week_start"  : week_start,
            "week_end"  : week_end,
            "matchups"  : matches
        }

        weeklyMatchup = dataMatchup;

        console.log(JSON.stringify(weeklyMatchup));

    })
    .error(function(){
        console.log('failed7');
    });
}


//ROSTER STATS-----------------------------------------
var showRoster = function(){
    var roster = '/fantasy/v2/team/' + teamkey + '/roster;week=' + currentweek + '/players/stats;type=week;week=' + currentweek;
    var getroster = returnQuery(roster);

    $.getJSON(getroster, function(data){
    })
    .done(function(data){
        console.log('success5');
        var xmldataRoster = data.results[0];
        //console.log(xmldataRoster);
        $(xmldataRoster).find('player').each(function(){
            $('.roster').append('<br /><br />' + $(this).find('name full').html() + '<br /><strong>' + $(this).find('status').text() + '</strong><br />' + $(this).find('player_stats').html() + '<br />'); 
        });
        
    })
    .error(function(){
        console.log('failed5');
    });
}

/*
//PLAYERS-----------------------------------------
var roster = '/fantasy/v2/player/342.p.4836/stats';
var getroster = returnQuery(roster);

$.getJSON(getroster, function(data){
    //console.log(data.results[0]);
})
.done(function(data){
    console.log('success5');
    var xmldataPlayer = data.results[0];
    //console.log(xmldataPlayer);
    $('.player').append($(xmldataPlayer).find('name full').html() + ' - ');
    $(xmldataPlayer).find('player_stats').each(function(){
        $('.player').append($(this).html()); 
    });
})
.error(function(){
    console.log('failed5');
});
/////////////////CLOSE ME///////////////
*/


var app = {
    // Application Constructor
    initialize: function() {
        this.bindEvents();
    },
    // Bind Event Listeners
    //
    // Bind any events that are required on startup. Common events are:
    // 'load', 'deviceready', 'offline', and 'online'.
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
    },
    // deviceready Event Handler
    //
    // The scope of 'this' is the event. In order to call the 'receivedEvent'
    // function, we must explicitly call 'app.receivedEvent(...);'
    onDeviceReady: function() {
        app.receivedEvent('deviceready');
    },
    // Update DOM on a Received Event
    receivedEvent: function(id) {
        var parentElement = document.getElementById(id);
        var listeningElement = parentElement.querySelector('.listening');
        var receivedElement = parentElement.querySelector('.received');

        listeningElement.setAttribute('style', 'display:none;');
        receivedElement.setAttribute('style', 'display:block;');

        console.log('Received Event: ' + id);

        GalaxyGear.onConnect(function(e) {
            alert("Connection Successfully Established - handle: " + e.handle);
            var checkMatchup = window.setInterval(function(){
                if (weeklyMatchup != null) {
                    //$('#send-message-2').click();
                    checkMatchup.clearInterval();
                }
            },1000);

            GalaxyGear.onDataReceived(e.handle, function(e) {
                alert("Data received - handle: " + e.handle + " data: "+ e.data);
                GalaxyGear.sendData(e.handle, "Hello From DANNY!");
            });

            GalaxyGear.sendData(e.handle, "Hello From Cordova!");

            $('#send-message-1').on('click',function(){
                GalaxyGear.sendData(e.handle, "Hello From Bob!");
            });

            $('#send-message-2').on('click',function(){
                //console.warn("DANNY:::"+weeklyMatchup);
                GalaxyGear.sendData(e.handle, weeklyMatchup);
            });
        });

        $("#app-status-ul").append('<li>UUID:'+ device.uuid +'</li>');

        try {
            pushNotification = window.plugins.pushNotification;
            $("#app-status-ul").append('<li>registering ' + device.platform + '</li>');
            if (device.platform == 'android' || device.platform == 'Android') {
                pushNotification.register(successHandler, errorHandler, {"senderID":senderID,"ecb":"onNotification"});        // required!
            }
        }
        catch(err) 
        {
            txt="There was an error on this page.\n\n"; 
            txt+="Error description: " + err.message + "\n\n"; 
            alert(txt); 
        } 

    }
};


// handle GCM notifications for Android
function onNotification(e) {
    $("#app-status-ul").append('<li>EVENT -> RECEIVED:' + e.event + '</li>');
    
    switch( e.event )
    {
        case 'registered':
        if ( e.regid.length > 0 )
        {
            $("#app-status-ul").append('<li>REGISTERED -> REGID:' + e.regid + "</li>");
            // Your GCM push server needs to know the regID before it can push to this device
            // here is where you might want to send it the regID for later use.
            console.log("regID = " + e.regid);

            var data = {
                'username'          : account.username,
                'registration_id'   : e.regid
            }

            $.ajax({
                type: "POST",
                url: "http://julienlu.com/yahoofantasysports/registrationID.php",
                datatype: "json",
                data: JSON.stringify(data)
            }).done(function( msg ) {
                //alert(msg);
            });

        }
        break;
        
        case 'message':
            // if this flag is set, this notification happened while we were in the foreground.
            // you might want to play a sound to get the user's attention, throw up a dialog, etc.
            if (e.foreground)
            {
                $("#app-status-ul").append('<li>--INLINE NOTIFICATION--' + '</li>');
            }
            else
            {   // otherwise we were launched because the user touched a notification in the notification tray.
                if (e.coldstart)
                    $("#app-status-ul").append('<li>--COLDSTART NOTIFICATION--' + '</li>');
                else
                $("#app-status-ul").append('<li>--BACKGROUND NOTIFICATION--' + '</li>');
            }
                
            $("#app-status-ul").append('<li>MESSAGE -> MSG: ' + e.payload.message + '</li>');
            //android only
            $("#app-status-ul").append('<li>MESSAGE -> MSGCNT: ' + e.payload.msgcnt + '</li>');
            //amazon-fireos only
            $("#app-status-ul").append('<li>MESSAGE -> TIMESTAMP: ' + e.payload.timeStamp + '</li>');
        break;
        
        case 'error':
            $("#app-status-ul").append('<li>ERROR -> MSG:' + e.msg + '</li>');
        break;
        
        default:
            $("#app-status-ul").append('<li>EVENT -> Unknown, an event was received and we do not know what it is</li>');
        break;
    }
}

function successHandler (result) {
    $("#app-status-ul").append('<li>success:'+ result +'</li>');
}

function errorHandler (error) {
    $("#app-status-ul").append('<li>error:'+ error +'</li>');
}

Array.prototype.move = function (from, to) {
    this.splice(to, 0, this.splice(from, 1)[0]);
};


$(function(){
    app.initialize();
    getAccessToken();

    var resetHTML = function() {
        //resets
        $('.roster').html('');
        $('.stats').html('');
        $('.matchup').html('');
    }

    //CLICK EVENTS----------------------------------------
    $('.sports-pick').on('click', 'a', function(){
        resetHTML();
        $('.league-id').html('');

        gamekey = $(this).data('gamekey');
        localStorage.setItem("gamekey", gamekey);
        //showSportStatCategories();
        showListTeams();
    });

    $('#yahoologin').on('click', function(){
        var data = {
            'username'  : account.username,
            'url'       : '/fantasy/v2/users;use_login=1/games'
        }

        $.ajax({
            type: "POST",
            url: "http://julienlu.com/yahoofantasysports/callYahooAPI.php",
            datatype: "json",
            data: JSON.stringify(data)
        }).done(function( msg ) {
            alert(msg);
        });
    });


    $('.league-id').on('click', '.teamkey', function(){
        teamkey = $(this).html();
        localStorage.setItem("teamkey", teamkey);
        leaguekey = teamkey.split('.t')[0];
        localStorage.setItem("leaguekey", leaguekey);
        resetHTML();
        showListLeague(leaguekey);
    });


});