/**
 * Date and currency formatters matching Feedants UI
 */

export const formatCurrency = (amount) => {
  if (amount === undefined || amount === null) return '₹ 0';
  return `₹ ${Number(amount).toLocaleString('en-IN')}`;
};

export const formatDisplayDate = (dateString) => {
  if (!dateString) return '';
  const d = new Date(dateString);
  
  // Format day and month e.g. "10 Aug 26"
  const day = d.getDate();
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec'];
  const month = months[d.getMonth()];
  const year = String(d.getFullYear()).slice(-2);

  // Format time e.g. "11:50 PM"
  let hours = d.getHours();
  const minutes = String(d.getMinutes()).padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12; // 0 becomes 12
  const formattedHours = String(hours).padStart(2, '0');

  return {
    datePart: `${day} ${month} ${year}`,
    timePart: `${formattedHours}:${minutes} ${ampm}`,
  };
};

export const formatCountdownValues = (totalSeconds) => {
  if (!totalSeconds || totalSeconds <= 0) {
    return {
      days: '00',
      hours: '00',
      minutes: '00',
      seconds: '00',
      isExpired: true,
      text: '00d : 00h : 00m : 00s',
    };
  }

  const d = Math.floor(totalSeconds / (3600 * 24));
  const h = Math.floor((totalSeconds % (3600 * 24)) / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;

  const pad = (n) => String(n).padStart(2, '0');

  return {
    days: pad(d),
    hours: pad(h),
    minutes: pad(m),
    seconds: pad(s),
    isExpired: false,
    text: `${pad(d)}d : ${pad(h)}h : ${pad(m)}m : ${pad(s)}s`,
  };
};
