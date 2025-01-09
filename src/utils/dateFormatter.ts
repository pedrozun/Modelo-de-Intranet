const months = [
  'janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
  'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'
];

export function formatDatePtBR(date: Date): string {
  const day = date.getDate();
  const month = months[date.getMonth()];
  const year = date.getFullYear();
  return `${day} de ${month} de ${year}`;
}

export function formatTime(date: Date): string {
  return date.toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit'
  });
}