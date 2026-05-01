import React from 'react';

interface DateAnchorProps {
  date: Date;
}

const DateAnchor: React.FC<DateAnchorProps> = ({ date }) => {
  const formatter = new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  const formattedDate = formatter.format(date);

  return (
    <p className="text-base md:text-lg text-amber-400 font-bold tracking-wider drop-shadow-lg">
      📅 {formattedDate}
    </p>
  );
};

export default DateAnchor;
