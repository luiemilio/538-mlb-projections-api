import csvtojson from 'csvtojson';
import * as https from 'node:https';
import { promises as fsPromises, existsSync } from 'node:fs';
import * as path from 'node:path';
import { normalize538DateString } from './utils';
import type { AllGameData, Sport } from './types';

export class GameData {
    private dataPromise: Promise<AllGameData<Sport>>;
    private url: string;
    private filePath: string;

    constructor(url: string) {
        this.url = url;
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

    private parseCsvData = async (filePath: string): Promise<AllGameData<Sport>> => {
        const gameObj: AllGameData<Sport> = {};

        const parserOptions = {
            trim: true,
            ...(this.url.includes('nba') && {
                headers: [
                    'date',
                    'season',
                    'neutral',
                    'playoff',
                    'team1',
                    'team2',
                    'elo1_pre',
                    'elo2_pre',
                    'elo_prob1',
                    'elo_prob2',
                    'elo1_post',
                    'elo2_post',
                    'carmElo1Pre',
                    'carmElo2Pre',
                    'carmEloProb1',
                    'carmEloProb2',
                    'carmElo1Post',
                    'carmElo2Post',
                    'raptor1_pre',
                    'raptor2_pre',
                    'raptor_prob1',
                    'raptor_prob2',
                    'score1',
                    'score2',
                    'quality',
                    'importance',
                    'total_rating'
                ]
            })
        };

        await new Promise((resolve, reject) => {
            csvtojson(parserOptions)
                .fromFile(filePath)
                .on('data', (data) => {
                    const parsedData = JSON.parse(data.toString('utf8'));
                    const { date } = parsedData;
                    const convertedDate = normalize538DateString(date);

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

    private getData = async (): Promise<AllGameData<Sport>> => {
        if (!existsSync(this.filePath) || (existsSync(this.filePath) && (await this.staleFile(this.filePath)))) {
            await this.fetchFile(this.url, this.filePath);
        }

        return this.parseCsvData(this.filePath);
    };

    public get data(): Promise<AllGameData<Sport>> {
        return this.dataPromise;
    }
}
