import React, { ChangeEvent, useEffect, useState } from 'react';
import axios from 'axios';
import { inject } from '@vercel/analytics';

import './App.css';

const App: React.FC = () => {
  // type JSONValue = string | number | boolean | JSONObject | JSONArray;

  interface Team {
    id: number;
    abbreviation: string;
    city: string;
    conference: string;
    division: string;
    full_name: string;
    name: string;
  }

  interface JSONObject {
    // [x: string]: JSONValue | Team;
    id: number;
    date: string;
    home_team: Team;
    home_team_score: number;
    period: number;
    postseason: boolean;
    season: number;
    status: string;
    time: string;
    visitor_team: Team;
    visitor_team_score: number;
  }

  interface TeamObject {
    id: number;
    abbreviation: string;
    full_name: string;
    city: string;
    division: string;
    name: string;
  }

  // interface JSONArray extends Array<JSONValue> {}

  const fetchTeamData = () => {
    return axios
      .get('https://www.balldontlie.io/api/v1/teams') 
      .then(function (response) {
        const teams: TeamObject[] = response.data.data;
        return teams;
      })
      .catch(function (error) {
        console.log(error);
      });
  };

  const fetchGameData = (newActiveTeam: TeamObject) => {
    return axios
      .get(
        'https://www.balldontlie.io/api/v1/games?seasons[]=2023&team_ids[]=' +
          newActiveTeam.id +
          '&start_date=' +
          currentDateString
      )
      .then(function (response) {
        const games: JSONObject[] = response.data.data;
        const moreData = response.data;
        console.log(moreData);
        return games;
      })
      .catch(function (error) {
        console.log(error);
      });
  };

  const [teams, setTeams] = useState<Array<TeamObject>>([]);
  const [activeTeam, setActiveTeam] = useState<TeamObject>({
    id: 0,
    abbreviation: '',
    full_name: '',
    city: '',
    division: '',
    name: '',
  });

  useEffect(() => {
    fetchTeamData().then((fetchedTeamData) => {
      setTeams(fetchedTeamData || []);
    });
  }, []);

  const currentDate: Date = new Date();
  const currentYear: number = currentDate.getFullYear();
  const currentMonth: number = currentDate.getMonth() + 1; // January is 0
  const currentDayOfMonth: number = currentDate.getDate();

  const currentDateString: String =
    currentYear + '-' + currentMonth + '-' + currentDayOfMonth;

  const [gamesAreVisible, setGamesAreVisible] = useState<boolean>(false);
  const [games, setGames] = useState<JSONObject[]>([]);

  const SelectTeam: Function = () => {
    return (
      <>
        <select
          value={activeTeam.abbreviation}
          onChange={handleTeamSelect}
          className="team-select"
        >
          <option hidden>Select your team</option>
          {teams.map((oneTeam) => {
            return (
              <option
                key={oneTeam.id}
                value={oneTeam.abbreviation}
                className="team-select-option"
              >
                {oneTeam.full_name}
              </option>
            );
          })}
        </select>
      </>
    );
  };

  const handleTeamSelect = (event: ChangeEvent<HTMLSelectElement>) => {
    const newActiveTeam: TeamObject =
      teams.find((team) => team.abbreviation === event.target.value) ||
      activeTeam;
    setActiveTeam(newActiveTeam);
    console.log(newActiveTeam);


    fetchGameData(newActiveTeam).then((fetchedData) => {
      setGames(fetchedData || []);
      setGamesAreVisible(true);
    });
  };

  const sortedGames: JSONObject[] = games.sort((a: JSONObject, b: JSONObject) =>
    a.date.localeCompare(b.date)
  );

  const handleGameDateAndTime: Function = (timeStamp: string) => {
    //Detect user's timezone
    const userTimeZone: string = Intl.DateTimeFormat().resolvedOptions().timeZone;
    
    //Convert UTC timestamp to user's local date and time
    const utcDate: Date = new Date(timeStamp);
    const timeOptions: Intl.DateTimeFormatOptions = {timeZone: userTimeZone, weekday: "long",  hour: "numeric",  minute: "numeric"};
    const dateOptions: Intl.DateTimeFormatOptions = {timeZone: userTimeZone, year: "numeric", month: "short", day: "numeric",};
    const localDayAndTime: string = new Intl.DateTimeFormat("en-GB", timeOptions).format(utcDate);
    const localDate: string = new Intl.DateTimeFormat("en-GB", dateOptions).format(utcDate);
    return [ localDayAndTime, localDate ]
  }

  const MainGame: Function = () => {
    const firstGame = sortedGames.find((oneGame: JSONObject, idx: number) => {
      return idx === 0;
    });
    if (!firstGame) {
      console.log('No first game data found');
      return null;
    } else {

      const utcTimeStamp: string = firstGame.status;
      const [localDayAndTime, localDate] = handleGameDateAndTime(utcTimeStamp)

      const started: number = firstGame.period;

      return (
        <>
          <div className="main-game">
            <div className="next-game-label">Next game</div>
            <div className="game-container">
              <div className="game-item-first">
                <p className="lg-team-abbreviation">
                  {firstGame.home_team.abbreviation}
                </p>
                <h2>{firstGame.home_team.full_name}</h2>
              </div>
              <div className="game-item-second">
                <p className="lg-team-abbreviation">
                  {firstGame.visitor_team.abbreviation}
                </p>

                <h2>{firstGame.visitor_team.full_name}</h2>
              </div>
            </div>
            <p className="main-datetime">{started !== 0 ? "The game has started" : localDayAndTime}</p>
            <p className="main-datetime">{started !== 0 ? "The game has started" : localDate}</p>

          </div>
        </>
      );
    }
  };

  const ManyGames: Function = () => {
   
    return  sortedGames.slice(1, 6).map((oneGame: JSONObject, idx: number) => {
      const utcTimeStamp: string = oneGame.status;
      const [localDayAndTime, localDate] = handleGameDateAndTime(utcTimeStamp)
      const homeGame: boolean = activeTeam.id === oneGame.home_team.id; 

      return (
        <div key={idx} className="small-game-card">
          <h4>{homeGame ? "vs" : "at"}</h4>
          <h3>{homeGame ? oneGame.visitor_team.city : oneGame.home_team.city }</h3>
          <br></br>
          <p className="datetime">{localDayAndTime}</p>
          <p className="datetime">{localDate}</p>

        </div>
      );
    });
  };

  return (
    <div className="App">
      <div className="content-container">
        {activeTeam.id === 0 ? <h1>Never miss an NBA game!</h1> : null}
        <SelectTeam />
        {gamesAreVisible ? (
          <>
            <MainGame />
            <p className="next5-label">and next 5 games...</p>
          </>
        ) : null}
        {gamesAreVisible ? (
          <div className="many-games-container">
            <ManyGames />
          </div>
        ) : null}
      </div>
    </div>
  );
};

inject();

export default App;
