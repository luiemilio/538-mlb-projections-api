import { CSV } from './constants';
import csvtojson from 'csvtojson';
import * as https from 'node:https';
import { promises as fsPromises, existsSync } from 'node:fs';
import * as path from 'node:path';
import { convertDate } from './utils';

type DataType = 'latest' | 'historical';

export type GameDataInfo = {
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

export type AllGameData = { [key: string]: GameDataInfo[] }; 

class GameData {
    private dataPromise: Promise<AllGameData>;
    private url: string;
    private filePath: string;

    constructor(type: DataType) {
        this.url = type === 'historical' ? CSV.historical : CSV.latest;
        this.filePath = this.getFilenameFromUrl(this.url);
        this.dataPromise = this.getData();
    }

    private getFilenameFromUrl = (url: string): string => {
        return path.basename(new URL(url).pathname);
    };

    private fetchFile = (url: string, filePath: string): Promise<void> => {
        return new Promise((resolve, reject) => {
            https
                .get(url, (response) => {
                    let data = '';

                    response.on('data', (chunk) => {
                        data += chunk;
                    });

                    response.on('end', async () => {
                        await fsPromises.writeFile(filePath, data);
                        resolve();
                    });
                })
                .on('error', (error) => {
                    reject(error);
                });
        });
    };

    private staleFile = async (filePath: string): Promise<boolean> => {
        const fileStats = await fsPromises.stat(filePath);

        const fileDate = fileStats.mtime;
        const compareDate = new Date(fileDate);
        compareDate.setDate(compareDate.getDate() + 1);
        const currentDate = new Date();
        return currentDate > compareDate;
    };

    private parseCsvData = async (filePath: string): Promise<AllGameData> => {
        const gameObj: AllGameData = {};

        await new Promise((resolve, reject) => {
            csvtojson({ trim: true })
                .fromFile(filePath)
                .on('data', (data) => {
                    const parsedData = JSON.parse(data.toString('utf8'));
                    const { date } = parsedData;
                    const convertedDate = convertDate(date);

                    const gameDate = gameObj[convertedDate];

                    if (gameDate) {
                        gameDate.push(parsedData);
                    } else {
                        gameObj[convertedDate] = [parsedData];
                    }
                })
                .on('finish', resolve)
                .on('error', reject);
        });

        return gameObj;
    };

    private getData = async (): Promise<AllGameData> => {
        if (!existsSync(this.filePath) || (existsSync(this.filePath) && (await this.staleFile(this.filePath)))) {
            await this.fetchFile(this.url, this.filePath);
        }

        return this.parseCsvData(this.filePath);
    };

    public get data(): Promise<AllGameData> {
        return this.dataPromise;
    }
}

export const latestGameData = new GameData('latest').data;
export const historicalGameData = new GameData('historical').data;
