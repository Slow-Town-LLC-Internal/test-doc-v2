import fs from 'fs';
import path from 'path';
import { NextAuthOptions } from 'next-auth';
import GithubProvider from 'next-auth/providers/github';
import { getAppConfig } from './config';

// Load whitelist of GitHub handles
const loadWhitelist = (): string[] => {
  try {
    const appConfig = getAppConfig();
    if (!appConfig.features.auth.enabled) {
      return []; // Return empty array if auth is disabled
    }

    const whitelistPath = path.join(process.cwd(), 'config', appConfig.features.auth.whitelist);
    const whitelistContent = fs.readFileSync(whitelistPath, 'utf8');
    
    // Parse whitelist, removing comments and empty lines
    return whitelistContent
      .split('\n')
      .map(line => line.trim())
      .filter(line => line && !line.startsWith('#'));
  } catch (error) {
    console.error('Error loading whitelist:', error);
    return [];
  }
};

export const authOptions: NextAuthOptions = {
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_ID || '',
      clientSecret: process.env.GITHUB_SECRET || '',
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
    async jwt({ token, account, profile }) {
      // Add GitHub username to JWT token
      if (account?.provider === 'github' && profile) {
        token.login = profile.login;
      }
      return token;
    },
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
};