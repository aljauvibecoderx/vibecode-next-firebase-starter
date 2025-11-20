// Database types for the application
// This file contains type definitions for database tables

export interface Database {
  public: {
    Tables: {
      prices: {
        Row: {
          id: string;
          product_id: string;
          unit_amount: number;
          currency: string;
          interval: string | null;
          interval_count: number | null;
          trial_period_days: number | null;
          metadata: Record<string, any> | null;
          created: string;
          description: string | null;
          active: boolean;
          type: string;
        };
        Insert: Omit<Database['public']['Tables']['prices']['Row'], 'id' | 'created'>;
        Update: Partial<Database['public']['Tables']['prices']['Insert']>;
      };
      // Add other tables here as needed
    };
    Views: {
      // Add views here as needed
    };
    Functions: {
      // Add functions here as needed
    };
    Enums: {
      // Add enums here as needed
    };
    CompositeTypes: {
      // Add composite types here as needed
    };
  };
}

// Generic table type helper
export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row'];