export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      nonces: {
        Row: {
          created_at: string | null;
          id: string;
          wallet_address: string;
        };
        Insert: {
          created_at?: string | null;
          id: string;
          wallet_address: string;
        };
        Update: {
          created_at?: string | null;
          id?: string;
          wallet_address?: string;
        };
        Relationships: [];
      };
      orders: {
        Row: {
          created_at: string;
          id: string;
          price: number;
          status: string | null;
          stock: string;
          type: string;
          user: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          price: number;
          status?: string | null;
          stock: string;
          type: string;
          user: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          price?: number;
          status?: string | null;
          stock?: string;
          type?: string;
          user?: string;
        };
        Relationships: [
          {
            foreignKeyName: "orders_stock_fkey";
            columns: ["stock"];
            referencedRelation: "stocks";
            referencedColumns: ["symbol"];
          },
          {
            foreignKeyName: "orders_user_fkey";
            columns: ["user"];
            referencedRelation: "users";
            referencedColumns: ["wallet_address"];
          }
        ];
      };
      stocks: {
        Row: {
          address: string | null;
          created_at: string | null;
          id: string;
          image_url: string | null;
          name: string;
          symbol: string;
        };
        Insert: {
          address?: string | null;
          created_at?: string | null;
          id?: string;
          image_url?: string | null;
          name: string;
          symbol: string;
        };
        Update: {
          address?: string | null;
          created_at?: string | null;
          id?: string;
          image_url?: string | null;
          name?: string;
          symbol?: string;
        };
        Relationships: [];
      };
      users: {
        Row: {
          created_at: string | null;
          id: string;
          kyc: boolean;
          name: string | null;
          wallet_address: string;
        };
        Insert: {
          created_at?: string | null;
          id?: string;
          kyc?: boolean;
          name?: string | null;
          wallet_address: string;
        };
        Update: {
          created_at?: string | null;
          id?: string;
          kyc?: boolean;
          name?: string | null;
          wallet_address?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}
