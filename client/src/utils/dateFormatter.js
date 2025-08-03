// Utility function to format dates consistently as DD/MM/YYYY
export const formatDateDDMMYYYY = (date) => {
  if (!date) return '';
  
  const d = new Date(date);
  if (isNaN(d.getTime())) return '';
  
  const day = d.getDate().toString().padStart(2, '0');
  const month = (d.getMonth() + 1).toString().padStart(2, '0');
  const year = d.getFullYear();
  
  return `${day}/${month}/${year}`;
};

// Utility function to format dates for Hebrew locale consistently
export const formatDateHebrew = (date) => {
  if (!date) return '';
  
  const d = new Date(date);
  if (isNaN(d.getTime())) return '';
  
  return d.toLocaleDateString('he-IL', {
    day: '2-digit',
    month: '2-digit', 
    year: 'numeric'
  });
};
