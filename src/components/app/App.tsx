import React, { ChangeEvent, useEffect, useState } from 'react';
import axios from 'axios';

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
        console.log(teams);
        return teams;
      })
      .catch(function (error) {
        console.log(error);
      });
  };

  const fetchGameData = (newActiveTeam: TeamObject) => {
    return axios
      .get(
        'https://www.balldontlie.io/api/v1/games?seasons[]=2022&team_ids[]=' +
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

  console.log('currentDateString: ' + currentDateString);

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

    fetchGameData(newActiveTeam).then((fetchedData) => {
      setGames(fetchedData || []);
      setGamesAreVisible(true);
    });
  };

  const sortedGames: JSONObject[] = games.sort((a: JSONObject, b: JSONObject) =>
    a.date.localeCompare(b.date)
  );
  console.log(sortedGames);

  const MainGame: Function = () => {
    const firstGame = sortedGames.find((oneGame: JSONObject, idx: number) => {
      return idx === 0;
    });
    if (!firstGame) {
      console.log('No first game data found');
      return null;
    } else {
      const firstGameTime: Date = new Date(firstGame.date);
      const firstGameDate: string = firstGameTime.toDateString();
      return (
        <>
          <div className="main-game">
            <div className="next-game-label">Next game</div>
            <div className="game-container">
              <div className="game-item-first">
                <a className="lg-team-abbreviation">
                  {firstGame.home_team.abbreviation}
                </a>
                <h2>{firstGame.home_team.full_name}</h2>
              </div>
              <div className="game-item-second">
                <a className="lg-team-abbreviation">
                  {firstGame.visitor_team.abbreviation}
                </a>

                <h2>{firstGame.visitor_team.full_name}</h2>
              </div>
            </div>
            <p className="main-datetime">{firstGameDate}</p>
            <p className="main-datetime">{firstGame.status}</p>

            <h2></h2>
          </div>
        </>
      );
    }
  };

  const ManyGames: Function = () => {
    return sortedGames.slice(1, 6).map((oneGame: JSONObject, idx: number) => {
      const realGameTime: Date = new Date(oneGame.date);

      return (
        <div key={idx} className="small-game-card">
          <h4>{oneGame.home_team.city}</h4>
          <h3>{oneGame.home_team.name}</h3>
          <p>vs</p>
          <h4>{oneGame.visitor_team.city}</h4>
          <h3>{oneGame.visitor_team.name}</h3>
          <br></br>
          <p className="datetime">{realGameTime.toDateString()}</p>
          <p className="datetime">{oneGame.status}</p>
        </div>
      );
    });
  };

  // const fetchGameData = (newActiveTeam: TeamObject) => {
  //   return axios
  //     .get(
  //       'https://www.balldontlie.io/api/v1/games?seasons[]=2022&team_ids[]=' +
  //         newActiveTeam.id +
  //         '&start_date=' +
  //         currentDateString
  //     )
  //     .then(function (response) {
  //       const games: JSONObject[] = response.data.data;
  //       const moreData = response.data;
  //       console.log(moreData);
  //       return games;
  //     })
  //     .catch(function (error) {
  //       console.log(error);
  //     });
  // };

  // useEffect(() => {
  //   fetchTeamData().then((fetchedTeamData) => {
  //     setTeams(fetchedTeamData || []);
  //   });
  // }, []);

  return (
    <div className="App">
      <div className="content-container">
        {activeTeam.id === 0 ? <h1>Never miss an NBA game!</h1> : null}
        <SelectTeam />
        {gamesAreVisible ? <MainGame /> : null}
        {gamesAreVisible ? (
          <div className="many-games-container">
            <ManyGames />
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default App;
