import React from 'react';

function StarRating({ value, onChange, size = 24 }) {
  const stars = [1, 2, 3, 4, 5];

  return (
    <div style={{ display: 'flex', gap: 4 }}>
      {stars.map((star) => (
        <span
          key={star}
          onClick={() => onChange && onChange(star)}
          style={{
            fontSize: size,
            cursor: onChange ? 'pointer' : 'default',
            color: star <= value ? 'var(--color-star)' : '#d1d5db',
            lineHeight: 1,
          }}
        >
          ★
        </span>
      ))}
    </div>
  );
}

export default StarRating;
