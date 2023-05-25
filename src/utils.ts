import { GameDataInfo } from './gameData';

export const getCurrentDate = (): string => {
    const currentDate = new Date();
    return formatDate(currentDate);
};

const padTo2Digits = (num: number): string => {
    return num.toString().padStart(2, '0');
};

const formatDate = (date: Date): string => {
    date.setHours(0, 0, 0, 0);
    return [date.getFullYear(), padTo2Digits(date.getMonth() + 1), padTo2Digits(date.getDate())].join('-');
};

export const convertDate = (dateStr: string): string => {
    const date = new Date(dateStr.replace(/-/g, '/'));
    return formatDate(date);
};

export const gameIsToday = (gameData: GameDataInfo): boolean => {
    const currentDate = getCurrentDate();
    return convertDate(gameData.date) === currentDate;
};