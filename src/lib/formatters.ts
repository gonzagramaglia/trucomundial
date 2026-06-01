export const formatTournamentDate = (dateStr: string) => {
  if (!dateStr) return '';
  const match = dateStr.match(/(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/);
  if (!match) return dateStr;
  
  const [_, year, month, day, hour, min] = match;
  
  const months = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
  const monthName = months[parseInt(month, 10) - 1];
  
  return `${parseInt(day, 10)} de ${monthName} de ${year} a las ${hour}:${min}hs (GMT-3)`;
};
