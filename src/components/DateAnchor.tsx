import React from 'react';

interface DateAnchorProps {
  date: Date;
  location?: string;
}

const DateAnchor: React.FC<DateAnchorProps> = ({ date, location = 'Tagum City' }) => {
  const formatter = new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  const formattedDate = formatter.format(date);

  return (
    <p className="text-sm text-amber-600/90 font-semibold tracking-wide">
      Forecast for {formattedDate} — {location}
    </p>
  );
};

export default DateAnchor;
