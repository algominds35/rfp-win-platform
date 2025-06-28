import { supabaseAdmin } from './supabase';

export interface User {
  id: string;
  email: string;
  name?: string;
  created_at: string;
}

export class AuthService {
  // Get current user from session/token
  static async getCurrentUser(): Promise<User | null> {
    try {
      // In a real app, this would validate JWT token from headers/cookies
      // For now, we'll use localStorage as session storage
      if (typeof window !== 'undefined') {
        const userEmail = localStorage.getItem('userEmail');
        const userName = localStorage.getItem('userName');
        
        if (userEmail) {
          return {
            id: userEmail, // Using email as ID for simplicity
            email: userEmail,
            name: userName || undefined,
            created_at: new Date().toISOString()
          };
        }
      }
      return null;
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  }

  // Login user
  static async login(email: string, password: string): Promise<{ success: boolean; user?: User; error?: string }> {
    try {
      // Check if user exists in customers table
      const { data: customer, error } = await supabaseAdmin
        .from('customers')
        .select('*')
        .eq('email', email)
        .single();

      if (error && error.code !== 'PGRST116') {
        return { success: false, error: 'Database error' };
      }

      if (!customer) {
        return { success: false, error: 'User not found' };
      }

      // In production, you'd verify password hash here
      // For now, we'll accept any password for existing users

      const user: User = {
        id: customer.email,
        email: customer.email,
        name: customer.email.split('@')[0],
        created_at: customer.created_at
      };

      // Store in localStorage (in production, use secure cookies/JWT)
      if (typeof window !== 'undefined') {
        localStorage.setItem('userEmail', user.email);
        localStorage.setItem('userName', user.name || '');
      }

      return { success: true, user };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'Login failed' };
    }
  }

  // Register new user
  static async register(email: string, password: string, name?: string): Promise<{ success: boolean; user?: User; error?: string }> {
    try {
      // Check if user already exists
      const { data: existingCustomer } = await supabaseAdmin
        .from('customers')
        .select('email')
        .eq('email', email)
        .single();

      if (existingCustomer) {
        return { success: false, error: 'User already exists' };
      }

      // Create new customer with free plan
      const { data: newCustomer, error } = await supabaseAdmin
        .from('customers')
        .insert({
          email,
          plan_type: 'free',
          analyses_limit: 3,
          analyses_used: 0,
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        console.error('Registration error:', error);
        return { success: false, error: 'Failed to create account' };
      }

      const user: User = {
        id: newCustomer.email,
        email: newCustomer.email,
        name: name || email.split('@')[0],
        created_at: newCustomer.created_at
      };

      // Store in localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('userEmail', user.email);
        localStorage.setItem('userName', user.name || '');
      }

      return { success: true, user };
    } catch (error) {
      console.error('Registration error:', error);
      return { success: false, error: 'Registration failed' };
    }
  }

  // Logout user
  static async logout(): Promise<void> {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('userEmail');
      localStorage.removeItem('userName');
    }
  }

  // Check if user is authenticated
  static async isAuthenticated(): Promise<boolean> {
    const user = await this.getCurrentUser();
    return user !== null;
  }
} 