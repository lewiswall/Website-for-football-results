
/* Use in sql to make the table*/
CREATE TABLE teams
(
    division varchar(5) not null,
    game_date date not null,
    home_team varchar(30) not null,
    away_team varchar(30) not null,
    fthg int(11) not null,
    ftag int(11) not null,
    ftr varchar(1) not null,
    hthg int(11) not null,
    htag int(11) not null,
    htr varchar(1),
    PRIMARY KEY(game_date, home_team)
);

/* after creating the table import the data sets in the folder with this file by using the import tab in phpmyadmin */