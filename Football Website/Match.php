<?php
class Match
{
	public $Division;
	public $GameDate;
	public $HomeTeam;
	public $AwayTeam;
	public $HTS;
	public $FTR;
	public $Winner;
	
	public function __construct($division, $date, $home, $away, $halftime, $fulltime, $winner)
	{
		$this->Division = $division;
		$this->GameDate = $date;
		$this->HomeTeam = $home;
		$this->AwayTeam = $away;
		$this->HTS = $halftime;
		$this->FTR = $fulltime;
		$this->Winner = $winner;
	}
	
	public function getDivision()
	{
		return $this->Division;
	}
	
	public function getGameDate()
	{
		return $this->GameDate;
	}
	
	public function getHomeTeam()
	{
		return $this->HomeTeam;
	}
	
	public function getAwayTeam()
	{
		return $this->AwayTeam;
	}
	
	public function getHTS()
	{
		return $this->HTS;
	}
	
	public function getFTR()
	{
		return $this->FTR;
	}
	
	public function getWinner()
	{
		return $this->Winner;
	}
}

?>