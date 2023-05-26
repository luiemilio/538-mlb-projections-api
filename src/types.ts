export type Sports = {
    [key: string]: {
        eloFields: string[];
        teams: number;
        csv: {
            latest: string;
            historical: string;
        };
    };
};

export type Sport = 'mlb' | 'nba';
export type DataType = 'latest' | 'historical';

export type SearchOptions = {
    sport: Sport;
};

export type GameSearchOptions = SearchOptions & {
    type: DataType;
};

export type CurrentEloSearchOptions = SearchOptions & {
    team: string;
};

export type EloRatings = {
    [key: string]: number;
};

export type MLBGameData = {
    date: string;
    season: string;
    neutral: string;
    playoff: string;
    team1: string;
    team2: string;
    elo1_pre: string;
    elo2_pre: string;
    elo_prob1: string;
    elo_prob2: string;
    elo1_post: string;
    elo2_post: string;
    rating1_pre: string;
    rating2_pre: string;
    pitcher1: string;
    pitcher2: string;
    pitcher1_rgs: string;
    pitcher2_rgs: string;
    pitcher1_adj: string;
    pitcher2_adj: string;
    rating_prob1: string;
    rating_prob2: string;
    rating1_post: string;
    rating2_post: string;
    score1: string;
    score2: string;
};

export type NBAGameData = {
    date: string;
    season: string;
    neutral: string;
    playoff: string;
    team1: string;
    team2: string;
    elo1_pre: string;
    elo2_pre: string;
    elo_prob1: string;
    elo_prob2: string;
    elo1_post: string;
    elo2_post: string;
    carmElo1Pre: string;
    carmElo2Pre: string;
    carmEloProb1: string;
    carmEloProb2: string;
    carmElo1Post: string;
    carmElo2Post: string;
    rapt: string;
};

export type GameDataInfo<Sport> = Sport extends 'mlb' ? MLBGameData : NBAGameData;

export type AllGameData<Sport> = { [key: string]: GameDataInfo<Sport>[] };

export type AllData = {
    [key: string]: {
        [key: string]: Promise<AllGameData<Sport>>;
    };
};
