import type { Sports } from './types';

export const SPORTS: Sports = {
    mlb: {
        eloFields: ['rating1_pre', 'rating2_pre'],
        teams: 30,
        csv: {
            latest: 'https://projects.fivethirtyeight.com/mlb-api/mlb_elo_latest.csv',
            historical: 'https://projects.fivethirtyeight.com/mlb-api/mlb_elo.csv'
        }
    },
    nba: {
        eloFields: ['raptor1_pre', 'raptor2_pre'],
        teams: 30,
        csv: {
            historical: 'https://projects.fivethirtyeight.com/nba-model/nba_elo.csv',
            latest: 'https://projects.fivethirtyeight.com/nba-model/nba_elo_latest.csv'
        }
    }
};
