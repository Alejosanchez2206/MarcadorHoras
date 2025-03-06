const getWeekRange = () => {
    const now = new Date(); // Fecha actual en UTC
    const utcOffset = -5 * 60; // UTC-5 en minutos

    // Convertir la fecha actual a UTC-5
    const nowUtc5 = new Date(now.getTime() + utcOffset * 60000);
    const dayOfWeek = nowUtc5.getDay(); // Día de la semana (0 = Domingo, ..., 6 = Sábado)

    // Calcular el inicio de la semana (lunes a las 00:00 en UTC-5)
    const startOfWeek = new Date(nowUtc5);
    startOfWeek.setDate(nowUtc5.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1));
    startOfWeek.setHours(0, 0, 0, 0);

    // Calcular el final de la semana (domingo a las 23:59:59 en UTC-5)
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);

    return { startOfWeek, endOfWeek };
};

module.exports = getWeekRange;
