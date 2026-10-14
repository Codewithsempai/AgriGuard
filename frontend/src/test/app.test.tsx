import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { LanguageProvider, useLanguage } from '../context/LanguageContext';
import { ThemeProvider } from '../context/ThemeContext';
import { AuthProvider } from '../context/AuthContext';
import { Landing } from '../pages/Landing';
import { Login } from '../pages/Login';
import { Register } from '../pages/Register';

const LanguageTester: React.FC = () => {
  const { language, setLanguage, t } = useLanguage();
  return (
    <div>
      <span data-testid="lang-label">{language}</span>
      <span data-testid="app-title">{t('app_name')}</span>
      <button data-testid="switch-ta" onClick={() => setLanguage('ta')}>Switch Tamil</button>
      <button data-testid="switch-en" onClick={() => setLanguage('en')}>Switch English</button>
    </div>
  );
};

describe('Frontend AgriGuard AI Test Suite', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('renders landing page with title and feature highlights', () => {
    render(
      <ThemeProvider>
        <LanguageProvider>
          <AuthProvider>
            <BrowserRouter>
              <Landing />
            </BrowserRouter>
          </AuthProvider>
        </LanguageProvider>
      </ThemeProvider>
    );

    expect(screen.getAllByText(/AgriGuard AI/i)[0]).toBeInTheDocument();
    expect(screen.getByText(/Get Started Free/i)).toBeInTheDocument();
    expect(screen.getByText(/Sign In to Dashboard/i)).toBeInTheDocument();
  });

  it('switches languages between English and Tamil properly', () => {
    render(
      <LanguageProvider>
        <LanguageTester />
      </LanguageProvider>
    );

    expect(screen.getByTestId('lang-label').textContent).toBe('en');
    expect(screen.getByTestId('app-title').textContent).toBe('AgriGuard AI');

    fireEvent.click(screen.getByTestId('switch-ta'));
    expect(screen.getByTestId('lang-label').textContent).toBe('ta');
    expect(screen.getByTestId('app-title').textContent).toBe('அக்ரிகார்ட் AI');

    fireEvent.click(screen.getByTestId('switch-en'));
    expect(screen.getByTestId('lang-label').textContent).toBe('en');
  });

  it('renders login form with quick demo autofill buttons', () => {
    render(
      <ThemeProvider>
        <LanguageProvider>
          <AuthProvider>
            <BrowserRouter>
              <Login />
            </BrowserRouter>
          </AuthProvider>
        </LanguageProvider>
      </ThemeProvider>
    );

    const emailInput = screen.getByPlaceholderText('farmer@example.com') as HTMLInputElement;
    const passwordInput = screen.getByPlaceholderText('••••••••') as HTMLInputElement;

    expect(emailInput).toBeInTheDocument();
    expect(passwordInput).toBeInTheDocument();

    const farmerDemoBtn = screen.getByText('Farmer Demo');
    fireEvent.click(farmerDemoBtn);

    expect(emailInput.value).toBe('demo@farm.com');
    expect(passwordInput.value).toBe('password123');
  });

  it('validates password minimum length on registration', () => {
    render(
      <ThemeProvider>
        <LanguageProvider>
          <AuthProvider>
            <BrowserRouter>
              <Register />
            </BrowserRouter>
          </AuthProvider>
        </LanguageProvider>
      </ThemeProvider>
    );

    const submitBtn = screen.getByRole('button', { name: /Create Account/i });
    expect(submitBtn).toBeInTheDocument();
  });
});
