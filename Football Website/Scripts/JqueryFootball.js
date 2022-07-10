// jQuery functions to manipulate the main page and handle communication with
// the books web service via Ajax.
//
// Note that there is very little error handling in this file.  In particular, there
// is no validation in the handling of form data.  This is to avoid obscuring the 
// core concepts that the demo is supposed to show.

function getAllTeams()
{
	$.ajax({
		url: '/teams',
		type: 'GET',
		cache: false,
		dataType: 'json',
		success: function (data) {
			if(!data)
			{
				$("#allTeams").html("");
				console.log('noData');
			}
			else
			{
				createTeamsTable(data);
			}
		},
		error: function (jqXHR, textStatus, errorThrown) {
            alert(jqXHR + '\n' + textStatus + '\n' + errorThrown);
        }
    });
}

function createTeamsTable(teams)
{
	var strResult = '<table class="matchTable">' +
					'<tr>' +
					'<th class="th-data">League</th>' +
					'<th class="th-data">Date</th>' + 
					'<th class="th-data">Home Team</th>' +
					'<th class="th-data">Away Team</th>' +
					'<th class="th-data">HTS</th>' +
					'<th class="th-data">FTS</th>' +
					'<th class="th-data">Winner</th>' +
					'<th class="FilterRow edit-delete">&nbsp;</th>' +
					'</tr>';
	$.each(teams, function (index, team)
	{
		strResult += '<tr><td class="td-data">' + team.Division + '</td><td class="td-data">' + team.GameDate + '</td><td class="td-data">' + team.HomeTeam + '</td><td class="td-data">';
		strResult += team.AwayTeam + '</td><td class="td-data">' + team.HTS + '</td><td class="td-data">' + team.FTR + '</td><td class="td-data">' + team.Winner + '</td>';
		//the onlcick function below this line
		strResult += '<td class="edit-delete td-data"><input type="button" value="Edit" onclick="getTeamForEditMatch(\'' + team.HomeTeam + '\', \'' + team.GameDate + '\');" />';
		strResult += '<input type="button" value="Delete" onclick="DeleteMatch(\'' + team.HomeTeam + '\', \'' + team.GameDate + '\');" />';
		strResult += "</td></tr>";
	});
	strResult += "</table>";
	$("#allTeams").html(strResult);
}


function fillTeamCombos(league)
{
	$.ajax({
		url: '/teams/' + league,
		type: 'GET',
		cache: false,
		dataType: 'json',
		success: function (data) {
			populateComboBoxes(data);
		},
		error: function (jqXHR, textStatus, errorThrown) {
            alert(jqXHR + '\n' + textStatus + '\n' + errorThrown);
        }
    });
}

function getFilteredTeams()
{
	var h = document.getElementById("homeTeamSelect");
	var strHome = h.options[h.selectedIndex].value;
	var a = document.getElementById("awayTeamSelect");
	var strAway = a.options[a.selectedIndex].value;
	
	var league;
	if (!$("input[name='league']:checked").val()) 
	{
         league = 'empty';
    }
    else 
	{
         league = $("input[type='radio'][name='league']:checked").val();
    }
	
	var minDate = document.getElementById("minDate").value;
	var minDay;
	var minMonth;
	var minYear;
	if(!minDate)
	{
		minDay = 'empty';
		minMonth = 'empty';
		minYear = 'empty';
	}
	else
	{
		var d = new Date($("#minDate").val());
		minDay = d.getDate();
		minMonth = d.getMonth() + 1;
		minYear = d.getFullYear();
	}
	
	var maxDate = document.getElementById("maxDate").value;
	var maxDay;
	var maxMonth;
	var maxYear;
	if(!maxDate)
	{
		maxDay = 'empty';
		maxMonth = 'empty';
		maxYear = 'empty';
	}
	else
	{
		var m = new Date($("#maxDate").val());
		maxDay = m.getDate();
		maxMonth = m.getMonth() + 1;
		maxYear = m.getFullYear();
	}
	$.ajax({
		url: '/teams/' + strHome + '/' + strAway + '/' + minDay + '/' + minMonth + '/' + minYear + '/' + maxDay + '/' + maxMonth + '/' + maxYear + '/' + league,
		cache: false,
		dataType: 'json',
		success: function(data) {
			if(!data)
			{
				$("#allTeams").html("");
				console.log('noData');
			}
			else
			{
				createTeamsTable(data);
			}
		},
		error: function (jqXHR, textStatus, errorThrown) {
            alert(jqXHR + '\n' + textStatus + '\n' + errorThrown);
        }
	});
	
}

function populateComboBoxes(teams)
{
	$("#homeTeamSelect").empty();
	$("#awayTeamSelect").empty();
	$("#homeTeamSelect").append($('<option></option>').val('Any').html('Any'));
	$("#awayTeamSelect").append($('<option></option>').val('Any').html('Any'));
	$.each(teams, function (index, team)
	{
		$("#homeTeamSelect").append($('<option></option>').val(team).html(team));
		$("#awayTeamSelect").append($('<option></option>').val(team).html(team));
	});	
	
}
	
function getTeamForEditMatch(team, date)
{
    $.ajax({
        url: '/teams/' + team + '/' + date,
        type: 'GET',
        cache: false,
        dataType: 'json',
        success: function (data) {
			createEditMatchForm(data);
        },
        error: function (jqXHR, textStatus, errorThrown) {
            alert(jqXHR + '\n' + textStatus + '\n' + errorThrown);
        }
    });
}

function createEditMatchForm(match)
{
	var matchDate = new Date(match.GameDate);
	var division;
	if(match.Division == 'E0')
	{
		division = 'Premier League';
	}
	else if(match.Division == 'I1')
	{
		division = 'Serie A';
	}
	else
	{
		division = 'Spanish La Liga';
	}
	var half = match.HTS.split("-");
	var full = match.FTR.split("-");
	strResult = '<div id="editForm"><div id="editFormTitle"><p id="editTitleText">Edit Match</p></div><div id="editFormBody">';
	strResult += '<table id="editFormTable"><tr><td class="editName">League:</td><td class="editValue">' + division + '</td>';
	strResult += '<tr><td class="editName">Date:</td><td class="editValue">' + match.GameDate + '</td></tr>';
	strResult += '<tr><td class="editName">Home Team:</td><td class="editValue">' + match.HomeTeam + '';
	strResult += '</td></tr><tr><td class="editName">Away Team:</td><td class="editValue"><select name="editAwayTeam" id="editAwayTeam">';
	strResult += '<option value="Liverpool">Liverpool</option></select></td></tr><tr><td class="editName">Half-Time Score (H/A):</td><td class="editValue">';
	strResult += '<input type="number" class="score" id="HThomeGoals" size="2" min="0" value="' + half[0] + '">-<input type="number" class="score" id="HTawayGoals" size="2" min="0" value="' + half[1] + '">';
	strResult += '</td></tr><tr><td class="editName">Full-Time Score (H/A):</td><td class="editValue"><input type="number" class="score" id="FThomeGoals" size="2" min="0" value="' + full[0] + '">-';
	strResult += '<input type="number" class="score" id="FTawayGoals" size="2" min="0" value="' + full[1] + '"></td></tr><tr><td class="editName"><input type="button" value="Submit" onclick="editMatch(\'' + match.GameDate + '\', \'' + match.HomeTeam + '\', \'' + match.Division + '\')"></td>';
	strResult += '<td class="editValue"><input type="button" value="Cancel" onclick="cancelCreateMatch()"></td></tr></table></div></div>';
	
	$("#allTeams").html("");
	$("#editFormBox").html(strResult);
	fillEditCombos(match.Division, 2, match.AwayTeam);
}



function createNewMatch()
{
	var nu = 'null';
	var spain = 'SP1';
	var italy = 'I1';
	var eng = 'E0';
	var num = 1;
	strResult = '<div id="editForm"><div id="editFormTitle"><p id="editTitleText">Create New Match</p></div><div id="editFormBody">';
	strResult += '<table id="editFormTable"><tr><td class="editName">League:</td><td class="editValue"><select name="league" id="selectLeague" onchange="findLeague()">';
	strResult += '<option value="E0">Premier League</option><option value="SP1">Spanish La Liga</option><option value="I1">Serie A</option></select></td>';
	strResult += '<tr><td class="editName">Date:</td><td class="editValue"><input type="Date" id="editDate" name="editDate"></td></tr>';
	strResult += '<tr><td class="editName">Home Team:</td><td class="editValue"><select name="editHomeTeam" id="editHomeTeam"><option value="man utd">Man United</option></select>';
	strResult += '</td></tr><tr><td class="editName">Away Team:</td><td class="editValue"><select name="editAwayTeam" id="editAwayTeam">';
	strResult += '<option value="Liverpool">Liverpool</option></select></td></tr><tr><td class="editName">Half-Time Score (H/A):</td><td class="editValue">';
	strResult += '<input type="number" class="score" id="HThomeGoals" size="2" min="0">-<input type="number" class="score" id="HTawayGoals" size="2" min="0">';
	strResult += '</td></tr><tr><td class="editName">Full-Time Score (H/A):</td><td class="editValue"><input type="number" class="score" id="FThomeGoals" size="2" min="0">-';
	strResult += '<input type="number" class="score" id="FTawayGoals" size="2" min="0"></td></tr><tr><td class="editName"><input type="button" value="Submit" onclick="addMatch()"></td>';
	strResult += '<td class="editValue"><input type="button" value="Cancel" onclick="cancelCreateMatch()"></td></tr></table></div></div>';
	
	$("#allTeams").html("");
	$("#editFormBox").html(strResult);
	fillEditCombos('E0', 1, 'null');
}

function findLeague()
{
	var val = document.getElementById('selectLeague').value;
	if(val == 'SP1')
	{
		fillEditCombos('SP1', 1, 'null');
	}
	else if(val == 'I1')
	{
		fillEditCombos('I1', 1, 'null');
	}
	else
	{
		fillEditCombos('E0', 1, 'null');
	}
}

function cancelCreateMatch()
{
	$("#editFormBox").html("");
}

function editMatch(gameDate, homeTeam, division)
{
	var date = new Date(gameDate);
	var year = JSON.stringify(date.getFullYear());
	var gameDate = year.concat("-", date.getMonth() + 1, "-", date.getDate());
	
	var win;
	var halfTS = $("#HThomeGoals").val().concat("-", $("#HTawayGoals").val());
	var fullTR = $("#FThomeGoals").val().concat("-", $("#FTawayGoals").val());
	
	if($("#FThomeGoals").val() == $("#FTawayGoals").val())
	{
		win = 'D';
	}
	else if ($("#FThomeGoals").val() > $("#FTawayGoals").val())
	{
		win = 'H';
	}
	else
	{
		win = 'A';
	}
	
	var match = {
		Division: division,
		GameDate: gameDate,
		HomeTeam: homeTeam,
		AwayTeam: $("#editAwayTeam").val(),
		HTS: halfTS,
		FTR: fullTR,
		Winner: win
	};
	console.log(JSON.stringify(match));
	$.ajax({
		url: '/teams',
		type: 'PUT',
		data: JSON.stringify(match),
		contentType: "application/json;charset=utf-8",
		success: function (data) {
			$("#editFormBox").html("");
			getAllTeams();
		},
		error: function (jqXHR, textStatus, errorThrown) {
            alert(jqXHR + '\n' + textStatus + '\n' + errorThrown);
        }
    });
	
}

function addMatch()
{
	var date = new Date($("#editDate").val());
	var year = JSON.stringify(date.getFullYear());
	var gameDate = year.concat("-", date.getMonth() + 1, "-", date.getDate());
	
	var win;
	var halfTS = $("#HThomeGoals").val().concat("-", $("#HTawayGoals").val());
	var fullTR = $("#FThomeGoals").val().concat("-", $("#FTawayGoals").val());
	
	if($("#FThomeGoals").val() == $("#FTawayGoals").val())
	{
		win = 'D';
	}
	else if ($("#FThomeGoals").val() > $("#FTawayGoals").val())
	{
		win = 'H';
	}
	else
	{
		win = 'A';
	}
	
	var match = {
		Division: $("#selectLeague").val(),
		GameDate: gameDate,
		HomeTeam: $("#editHomeTeam").val(),
		AwayTeam: $("#editAwayTeam").val(),
		HTS: halfTS,
		FTR: fullTR,
		Winner: win
	};
	
	$.ajax({
		url: '/teams',
		type: 'POST',
		data: JSON.stringify(match),
		contentType: "application/json;charset=utf-8",
		success: function (data) {
			$("#editFormBox").html("");
			getAllTeams();
		},
		error: function (jqXHR, textStatus, errorThrown) {
            alert(jqXHR + '\n' + textStatus + '\n' + errorThrown);
        }
    });
	
	
}

function fillEditCombos(league, num, awayTeam)
{
	$.ajax({
		url: '/teams/' + league,
		type: 'GET',
		cache: false,
		dataType: 'json',
		success: function (data) {
			if(num == 1)
			{
				populateNewMatchComboBoxes(data);
			}
			else
			{
				populateEditMatchCombos(data, awayTeam);
			}
		},
		error: function (jqXHR, textStatus, errorThrown) {
            alert(jqXHR + '\n' + textStatus + '\n' + errorThrown);
        }
    });
}	
		
function populateNewMatchComboBoxes(teams)
{
	$("#editHomeTeam").empty();
	$("#editAwayTeam").empty();
	$.each(teams, function (index, team)
	{
		$("#editHomeTeam").append($('<option></option>').val(team).html(team));
		$("#editAwayTeam").append($('<option></option>').val(team).html(team));
	});	
	
}

function populateEditMatchCombos(teams, awayTeam)
{
	$("#editAwayTeam").empty();
	$.each(teams, function (index, team)
	{
		if(team == awayTeam)
		{
			$("#editAwayTeam").append($('<option selected></option>').val(team).html(team));
		}
		else
		{
		 $("#editAwayTeam").append($('<option></option>').val(team).html(team));
		}
	});	
}

function DeleteMatch(team, date)
{
	console.log(team);
	$.ajax({
        url: '/teams/' + team + '/' + date,
        type: 'DELETE',
        dataType: 'json',
        success: function (data) {
            getAllTeams();
        },
        error: function (jqXHR, textStatus, errorThrown) {
            alert(jqXHR + '\n' + textStatus + '\n' + errorThrown);
        }
    });
}




