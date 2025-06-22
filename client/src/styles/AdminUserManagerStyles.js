import { css } from '@emotion/css';

export const adminUserManagerStyles = css`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1rem;
  background-color: #f9f9f9;
  border-radius: 8px;
`;

export const userListStyles = css`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

export const userItemStyles = css`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem;
  background-color: #fff;
  border-radius: 4px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
`;

export const userActionsStyles = css`
  display: flex;
  gap: 0.5rem;
`;

// ...existing code for other styles (userFormStyles, buttonStyles, etc.)
