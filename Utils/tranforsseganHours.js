// Define the function
const transformSecondsToHours = (duration) => {
    const hours = Math.floor(duration / 3600);
    const minutes = Math.floor((duration % 3600) / 60);
    const seconds = duration % 60;
    return `${hours}h ${minutes}m ${seconds}s`;
};

// Export it if needed (if it's in a separate module)
module.exports = transformSecondsToHours;
