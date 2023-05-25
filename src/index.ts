import { AllGameData, historicalGameData, latestGameData, GameDataInfo } from './gameData';
import { gameIsToday, getCurrentDate } from './utils';

export const getLatestGames = async (): Promise<AllGameData> => {
    return Object.freeze(latestGameData);
};

export const getHistoricalGames = async (): Promise<AllGameData> => {
    return Object.freeze(historicalGameData);
};

export const getTodaysGames = async (): Promise<GameDataInfo[]> => {
    const latestGames = await getLatestGames();
    return latestGames[getCurrentDate()];
};

export const getCurrentEloRating = async ({ team }: { team: string }): Promise<number> => {
    const todaysGames = await getTodaysGames();
    const teamName = team.toLocaleLowerCase();
    let elo = '0';

    for (const gameData of todaysGames) {
        const { team1, team2, rating1_pre, rating2_pre } = gameData;
        const team1Name = team1.toLocaleLowerCase();
        const team2Name = team2.toLocaleLowerCase();

        if (gameIsToday(gameData) ) {
            if (team1Name === teamName) {
                elo = rating1_pre;
                break;
            }

            if (team2Name === teamName) {
                elo = rating2_pre;
                break;
            }
        }
    }

    return Math.round(parseFloat(elo));
};

export const getAllCurrentEloRatings = async (): Promise<{ [key: string]: number }> => {
    const latestGames = await getLatestGames();
    const obj: { [key: string]: number } = {};

    for (const gameData of Object.values(latestGames).flat()) {
        const { team1, team2, rating1_pre, rating2_pre } = gameData;

        if (gameIsToday(gameData) ) {
            obj[team1] = Math.round(parseFloat(rating1_pre));
            obj[team2] = Math.round(parseFloat(rating2_pre));
        }

        if (Object.keys.length === 30) {
            break;
        }
    }

    return obj;
};
