/**
 * Stub router primitives so the dashboard component compiles in environments
 * without react-router-dom. In the host app, the dashboard is mounted in
 * "embedded" mode (props.onNavigate) and never touches the URL directly.
 *
 * If react-router-dom is later added, replace these with real
 * `Link`, `useParams`, `Navigate` from the package — the call sites
 * already match that API.
 */
import React from 'react';

interface LinkProps {
  to: string;
  children: React.ReactNode;
  className?: string;
  title?: string;
}

export const Link: React.FC<LinkProps> = ({ to, children, className }) => (
  <a href={to} className={className} onClick={(e) => e.preventDefault()}>
    {children}
  </a>
);