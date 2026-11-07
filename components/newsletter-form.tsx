'use client';

import { useState } from 'react';

export default function NewsletterForm() {
  const [done, setDone] = useState(false);

  return (
    <form
      className="subscribe"
      onSubmit={e => {
        e.preventDefault();
        setDone(true);
      }}
    >
      <label htmlFor="email" className="sr-only">
        ایمیل
      </label>
      <input
        id="email"
        type="email"
        placeholder={done ? 'ثبت شد، ممنون' : 'ایمیل شما'}
        autoComplete="email"
        required
        disabled={done}
      />
      <button className="btn btn-primary" type="submit" disabled={done}>
        {done ? 'عضو شدید' : 'عضویت'}
      </button>
    </form>
  );
}
