import { ButtonHTMLAttributes } from 'react';

export function PrimaryButton(
  props: ButtonHTMLAttributes<HTMLButtonElement>
): React.ReactElement {
  return (
    <button
      {...props}
      className={`px-4 py-2 border border-celo-gold rounded shadow-sm text-base font-medium text-slate-900 bg-celo-gold ${
        props.disabled ? 'cursor-not-allowed' : 'hover:bg-celo-gold-light'
      } mt-2 ${props.className || ''}`}
    />
  );
}

export function SecondaryButton(
  props: ButtonHTMLAttributes<HTMLButtonElement>
): React.ReactElement {
  return (
    <button
      {...props}
      className={`px-3 py-1 my-1 border border-transparent bg-rc-violet-light rounded text-base font-medium outline-none focus:outline-none ${
        props.className || ''
      } ${
        props.disabled
          ? 'cursor-not-allowed text-slate-400'
          : 'text-rc-violet hover:text-rc-violet-light hover:bg-rc-violet'
      }`}
    />
  );
}
