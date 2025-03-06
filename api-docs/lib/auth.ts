import { NextAuthOptions } from 'next-auth';
import GithubProvider from 'next-auth/providers/github';
import { getAppConfig } from './config';

// Sample whitelist for client-side preview
// In production, this would be loaded from the server or via an API
const SAMPLE_WHITELIST = ['arbeitandy', 'partneruser1', 'partneruser2'];

// Load whitelist of GitHub handles
const loadWhitelist = (): string[] => {
  const appConfig = getAppConfig();
  if (!appConfig.features.auth.enabled) {
    return []; // Return empty array if auth is disabled
  }

  // Check if we're on the server side
  if (typeof window === 'undefined') {
    try {
      // Only import fs and path on the server side
      const fs = require('fs');
      const path = require('path');
      
      const whitelistPath = path.join(process.cwd(), 'config', appConfig.features.auth.whitelist);
      const whitelistContent = fs.readFileSync(whitelistPath, 'utf8');
      
      // Parse whitelist, removing comments and empty lines
      return whitelistContent
        .split('\n')
        .map(line => line.trim())
        .filter(line => line && !line.startsWith('#'));
    } catch (error) {
      console.error('Error loading whitelist:', error);
      return SAMPLE_WHITELIST;
    }
  } else {
    // We're on the client side, return the sample whitelist
    // In a real app, you would fetch this via an API
    return SAMPLE_WHITELIST;
  }
};

export const authOptions: NextAuthOptions = {
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_ID || '',
      clientSecret: process.env.GITHUB_SECRET || '',
      profile(profile) {
        return {
          id: profile.id.toString(),
          name: profile.name || profile.login,
          email: profile.email,
          image: profile.avatar_url,
          login: profile.login || profile.username || profile.name,
        };
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      // Allow sign in if auth is disabled
      const appConfig = getAppConfig();
      if (!appConfig.features.auth.enabled) {
        return true;
      }

      // Check if user's GitHub handle is in the whitelist
      if (account?.provider === 'github' && user?.login) {
        const whitelist = loadWhitelist();
        return whitelist.includes(user.login);
      }
      
      return false;
    },
    async session({ session, token }) {
      // Add GitHub username to session
      if (session.user && token.login) {
        session.user.login = token.login as string;
      }
      return session;
    },
    async jwt({ token, account, user }) {
      // Add GitHub username to JWT token
      if (account?.provider === 'github' && user?.login) {
        token.login = user.login;
      }
      return token;
    },
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
};