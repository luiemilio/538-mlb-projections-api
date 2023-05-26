import type {
    GameSearchOptions,
    AllGameData,
    Sport,
    GameDataInfo,
    SearchOptions,
    CurrentEloSearchOptions,
    AllData,
    EloRatings
} from './types';
import { GameData } from './gameData';
import { sortDates, getCurrentDateString } from './utils';
import { SPORTS } from './constants';

export class FiveThirtyEight {
    private dataPromises: AllData;

    constructor() {
        this.dataPromises = {
            ...this.getDataPromisesObj()
        };
    }

    private getDataPromisesObj = (): AllData => {
        const obj: AllData = {};

        Object.entries(SPORTS).forEach(([sport, details]) => {
            obj[sport] = {};

            Object.entries(details).forEach(([key, detail]) => {
                if (key === 'csv') {
                    Object.entries(detail).forEach(([type, url]) => {
                        obj[sport][type] = new GameData(url).data;
                    });
                }
            });
        });

        return obj;
    };

    public getGames = async (options: GameSearchOptions): Promise<AllGameData<Sport>> => {
        const { sport, type } = options;
        return this.dataPromises[sport][type];
    };

    public getTodaysGames = async (options: SearchOptions): Promise<GameDataInfo<Sport>[]> => {
        const { sport } = options;
        const data = await this.dataPromises[sport]['latest'];
        return data[getCurrentDateString()] || [];
    };

    public getCurrentEloRating = async (options: CurrentEloSearchOptions): Promise<number> => {
        const { sport, team } = options;
        const allGames = await this.getGames({ sport, type: 'latest' });
        const teamName = team.toLocaleUpperCase();
        let elo = '0';

        const sortedDates = Object.keys(allGames).sort(sortDates);

        for (const date of sortedDates) {
            const games = allGames[date];

            for (const game of games) {
                const { team1, team2 } = game;
                const team1Name = team1.toLocaleUpperCase();
                const team2Name = team2.toLocaleUpperCase();

                if (team1Name === teamName || team2Name === teamName) {
                    const teamNumber = team1Name === teamName ? '1' : '2';
                    const fields = SPORTS[sport].eloFields;
                    const field = fields.find((field) => field.includes(teamNumber));

                    if (field) {
                        elo = game[field as keyof typeof game];
                        break;
                    }
                }
            }

            if (elo !== '0') {
                break;
            }
        }

        return Math.round(parseFloat(elo));
    };

    private assignElo = (sport: string, allTeams: EloRatings, teams: string[], game: GameDataInfo<Sport>): void => {
        teams.forEach((team, i) => {
            if (!Object.keys(allTeams).includes(team)) {
                const fields = SPORTS[sport].eloFields;
                const field = fields.find((field) => field.includes(`${i + 1}`));

                if (field) {
                    console.log(game);
                    allTeams[team] = Math.round(parseFloat(game[field as keyof typeof game]));
                }
            }
        });
    };

    public getAllEloRatings = async (options: SearchOptions): Promise<EloRatings> => {
        const { sport } = options;
        const allGames = await this.getGames({ sport, type: 'latest' });
        const allTeams: EloRatings = {};

        const sortedDates = Object.keys(allGames).sort(sortDates);

        for (const date of sortedDates) {
            const games = allGames[date];

            for (const game of games) {
                const { team1, team2 } = game;
                const team1Name = team1.toLocaleUpperCase();
                const team2Name = team2.toLocaleUpperCase();

                this.assignElo(sport, allTeams, [team1Name, team2Name], game);
            }

            if (Object.keys(allTeams).length === SPORTS[sport].teams) {
                break;
            }
        }

        return allTeams;
    };
}
