export const formatTime = (miliseconds: number) => {
    const seconds = miliseconds / 1000
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
        .toFixed(0)
        .toString()
        .padStart(2, "0")}`;
};