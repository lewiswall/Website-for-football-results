<?php
	require "dbinfo.php";
	require "RestService.php";
	require "Match.php";
	
	
class MatchRestService extends RestService
{
	private $matches;
	private $match;
	private $homeTeams;
	
	public function __construct()
	{
		parent::__construct("teams");
	}
	
	public function performGet($url, $parameters, $requestBody, $accept)
	{
		switch (count($parameters))
		{
			case 1:
				header('Content-Type: application/json; charset=utf-8');
				header('no-cache,no-store');
				$this->getAllMatches();
				echo json_encode($this->matches);
				break;
				
			case 2:
				header('Content-Type: application/json; charset=utf-8');
				header('no-cache,no-store');
				$this->getTeamsByLeague($parameters[1]);
				echo json_encode($this->homeTeams);
				break;
				
			case 3:
				header('Content-Type: application/json; charset=utf-8');
				header('no-cache,no-store');
				$this->getTeamByDateAndName($parameters[1], $parameters[2]);
				echo json_encode($this->match);
				break;
				
			case 10:
				$minDay = strval($parameters[3]);
				$minMonth = strval($parameters[4]);
				$minYear = strval($parameters[5]);
				
				$maxDay = strval($parameters[6]);
				$maxMonth = strval($parameters[7]);
				$maxYear = strval($parameters[8]);
				
				$league = strval($parameters[9]);
				header('Content-Type: application/json; charset=utf-8');
				header('no-cache,no-store');
				$this->getFilteredMatches($parameters[1], $parameters[2], $minDay, $minMonth, $minYear, $maxDay, $maxMonth, $maxYear, $league);
				echo json_encode($this->matches);
				break;
			
			default:
				$this->methodNotAllowedResponse();
			
		}
	}
	
	public function performPost($url, $parameters, $requestBody, $accept)
	{
		global $dbserver, $dbusername, $dbpassword, $dbdatabase;
		
		$newMatch = $this->extractMatchFromJSON($requestBody);
		$half = explode("-", $newMatch->getHTS());
		$full = explode("-", $newMatch->getFTR());
		$HTR;
		if($half[0] == $half[1])
		{
			$HTR = "D";
		}
		else if($half[0] > $half[1])
		{
			$HTR = "H";
		}
		else 
		{
			$HTR = "A";
		}
		$connection = new mysqli($dbserver, $dbusername, $dbpassword, $dbdatabase);
		if(!$connection->connect_error)
		{
			
			$sql = "insert into teams (division, game_date, home_team, away_team, fthg, ftag, ftr, hthg, htag, htr) values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
			
			$statement = $connection->prepare($sql);
			$division = $newMatch->getDivision();
			$gameDate = $newMatch->getGameDate();
			$homeTeam = $newMatch->getHomeTeam();
			$awayTeam = $newMatch->getAwayTeam();
			$winner = $newMatch->getWinner();
			
			$statement->bind_param('ssssiisiis', $division, $gameDate, $homeTeam, $awayTeam, $full[0], $full[1], $winner, $half[0], $half[1], $HTR);
			$result = $statement->execute();
			if ($result == FALSE)
			{
				$errorMessage = $statement->error;
			}
			$statement->close();
			$connection->close();
			if ($result == TRUE)
			{
				// We need to return the status as 204 (no content) rather than 200 (OK) since
				// we are not returning any data
				$this->noContentResponse();
			}
			else
			{
				$this->errorResponse($errorMessage);
			}
		}
	}
	
	public function performPut($url, $parameters, $requestBody, $accept)
	{
		global $dbserver, $dbusername, $dbpassword, $dbdatabase;

		$newMatch = $this->extractMatchFromJSON($requestBody);
		$half = explode("-", $newMatch->getHTS());
		$full = explode("-", $newMatch->getFTR());
		$HTR;
		if($half[0] == $half[1])
		{
			$HTR = "D";
		}
		else if($half[0] > $half[1])
		{
			$HTR = "H";
		}
		else 
		{
			$HTR = "A";
		}
		$connection = new mysqli($dbserver, $dbusername, $dbpassword, $dbdatabase);
		if (!$connection->connect_error)
		{
			$sql = "update teams set away_team = ?, fthg = ?, ftag = ?, ftr = ?, hthg = ?, htag = ?, htr = ? where game_date = ? and home_team = ?";
			$statement = $connection->prepare($sql);
			$gameDate = $newMatch->getGameDate();
			$homeTeam = $newMatch->getHomeTeam();
			$awayTeam = $newMatch->getAwayTeam();
			$winner = $newMatch->getWinner();
			$statement->bind_param('siisiisss', $awayTeam, $full[0], $full[1], $winner, $half[0], $half[1], $HTR, $gameDate, $homeTeam);
			$result = $statement->execute();
			if ($result == FALSE)
			{
				$errorMessage = $statement->error;
			}
			$statement->close();
			$connection->close();
			if ($result == TRUE)
			{
				// We need to return the status as 204 (no content) rather than 200 (OK) since
				// we are not returning any data
				$this->noContentResponse();
			}
			else
			{
				$this->errorResponse($errorMessage);
			}
		}
	}
	
	public function performDelete($url, $parameters, $requestBody, $accept)
	{
		global $dbserver, $dbusername, $dbpassword, $dbdatabase;
		
		if(count($parameters) == 3)
		{
			$connection = new mysqli($dbserver, $dbusername, $dbpassword, $dbdatabase);
			if(!$connection->connect_error)
			{
				$team = $parameters[1];
				$gameDate = $parameters[2];
				$sql = "delete from teams where game_date = ? and home_team = ?";
				$statement = $connection->prepare($sql);
				$statement->bind_param('ss', $gameDate, $team);
				$result = $statement->execute();
				if ($result == FALSE)
				{
					$errorMessage = $statement->error;
				}
				$statement->close();
				$connection->close();
				if ($result == TRUE)
				{
					// We need to return the status as 204 (no content) rather than 200 (OK) since
					// we are not returning any data
					$this->noContentResponse();
				}
				else
				{
					$this->errorResponse($errorMessage);
				}
			}
		}
		
	}
	
	
	public function extractMatchFromJSON($requestBody)
	{
		$matchArray = json_decode($requestBody, true);
		$match = new Match($matchArray['Division'],
							$matchArray['GameDate'],
							$matchArray['HomeTeam'],
							$matchArray['AwayTeam'],
							$matchArray['HTS'],
							$matchArray['FTR'],
							$matchArray['Winner']);
		unset($matchArray);
		return $match;
	}
	
	
	private function getAllMatches()
	{
		global $dbserver, $dbusername, $dbpassword, $dbdatabase;
		
		$connection = new mysqli($dbserver, $dbusername, $dbpassword, $dbdatabase);
		if(!$connection->connect_error)
		{
			$query = "select division, game_date, home_team, away_team, fthg, ftag, ftr, hthg, htag from teams order by game_date asc";
			if($result = $connection->query($query))
			{
				while($row = $result->fetch_assoc())
				{
					$halfTime = strval($row["hthg"])."-".strval($row["htag"]);
					$fullTime = strval($row["fthg"])."-".strval($row["ftag"]);
					$this->matches[] = new Match($row["division"], $row["game_date"], $row["home_team"], $row["away_team"], $halfTime, $fullTime, $row["ftr"]); 
				}
				$result->close();
			}
			$connection->close();
		}
	}
	
	private function getTeamsByLeague($league)
	{
		global $dbserver, $dbusername, $dbpassword, $dbdatabase;
		
		$connection = new mysqli($dbserver, $dbusername, $dbpassword, $dbdatabase);
		if(!$connection->connect_error)
		{
			$query = "select distinct home_team from teams where division = ? order by home_team asc";
			$statement = $connection->prepare($query);
			$statement->bind_param('s', $league);
			$statement->execute();
			$statement->store_result();
			$statement->bind_result($HomeTeam);
			while ($statement->fetch())
			{
				$this->homeTeams[] = $HomeTeam;
			}
			$statement->close();
			$connection->close();
		}
	}
	
	private function getFilteredMatches($homeTeam, $awayTeam, $minDay, $minMonth, $minYear, $maxDay, $maxMonth, $maxYear, $league)
	{
		global $dbserver, $dbusername, $dbpassword, $dbdatabase;
		
		$connection = new mysqli($dbserver, $dbusername, $dbpassword, $dbdatabase);
		if(!$connection->connect_error)
		{
			$leagueQuery;
			if($league != 'empty')
			{
				$leagueQuery = "and division = ? ";
			}
			else
			{
				$leagueQuery = "and division <> ? ";
			}
			
			
			if($minDay != 'empty')
			{
				$minDate = $minYear."-".$minMonth."-".$minDay;
				$maxDate = $maxYear."-".$maxMonth."-".$maxDay;
			}
			else
			{
				$minDate = "1999-01-01";
				$maxDate = "9999-99-99";
			}
			
			$query = "select division, game_date, home_team, away_team, fthg, ftag, ftr, hthg, htag from teams where game_date >= ? and game_date <= ? ";
			if($homeTeam != 'Any')
			{
				$homeAdd = "and home_team = ? ";
			}
			else
			{
				$homeAdd = "and home_team <> ? ";
			}
			if($awayTeam != 'Any')
			{
				$awayAdd = "and away_team = ? ";
			}
			else
			{
				$awayAdd = "and away_team <> ? ";
			}
	
			$query = $query.$homeAdd.$awayAdd.$leagueQuery."order by game_date asc";
			$statement = $connection->prepare($query);
			$statement->bind_param('sssss', $minDate, $maxDate, $homeTeam, $awayTeam, $league);
			$statement->execute();
			$statement->store_result();
			$statement->bind_result($Division, $GameDate, $HomeTeam, $AwayTeam, $FTHG, $FTAG, $FTR, $HTHG, $HTAG);
			while ($statement->fetch())
			{
				$halfTime = strval($HTHG)."-".strval($HTAG);
				$fullTime = strval($FTHG)."-".strval($FTAG);
				$this->matches[] = new Match($Division, $GameDate, $HomeTeam, $AwayTeam, $halfTime, $fullTime, $FTR);
			}
			$statement->close();
			$connection->close();
		} 
	}

	private function getTeamByDateAndName($homeTeam, $gameDate)
	{
		global $dbserver, $dbusername, $dbpassword, $dbdatabase;
		
		$connection = new mysqli($dbserver, $dbusername, $dbpassword, $dbdatabase);
		if(!$connection->connect_error)
		{
			$query = "select division, game_date, home_team, away_team, fthg, ftag, ftr, hthg, htag from teams where home_team = ? and game_date = ?";
			$statement = $connection->prepare($query);
			$statement->bind_param('ss', $homeTeam, $gameDate);
			$statement->execute();
			$statement->store_result();
			$statement->bind_result($Division, $GameDate, $HomeTeam, $AwayTeam, $FTHG, $FTAG, $FTR, $HTHG, $HTAG);
			if ($statement->fetch())
			{
				$halfTime = strval($HTHG)."-".strval($HTAG);
				$fullTime = strval($FTHG)."-".strval($FTAG);
				$this->match = new Match($Division, $GameDate, $HomeTeam, $AwayTeam, $halfTime, $fullTime, $FTR);
			}
			$statement->close();
			$connection->close();
		}
	}
}

?>