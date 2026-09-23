export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      designs: {
        Row: {
          created_at: string | null;
          engraving: boolean;
          id: string;
          product_id: string;
          updated_at: string | null;
          user_id: string;
          variant_id: string | null;
        };
        Insert: {
          created_at?: string | null;
          engraving?: boolean;
          id?: string;
          product_id: string;
          updated_at?: string | null;
          user_id: string;
          variant_id?: string | null;
        };
        Update: {
          created_at?: string | null;
          engraving?: boolean;
          id?: string;
          product_id?: string;
          updated_at?: string | null;
          user_id?: string;
          variant_id?: string | null;
        };
        Relationships: [
          { foreignKeyName: 'designs_product_id_fkey'; columns: ['product_id']; referencedRelation: 'products'; referencedColumns: ['id'] },
          { foreignKeyName: 'designs_variant_id_fkey'; columns: ['variant_id']; referencedRelation: 'product_variants'; referencedColumns: ['id'] },
        ];
      };
      order_items: {
        Row: {
          created_at: string | null;
          design_id: string | null;
          id: string;
          order_id: string;
          product_id: string;
          qty: number;
          unit_price: number;
          variant_id: string | null;
        };
        Insert: {
          created_at?: string | null;
          design_id?: string | null;
          id?: string;
          order_id: string;
          product_id: string;
          qty?: number;
          unit_price?: number;
          variant_id?: string | null;
        };
        Update: {
          created_at?: string | null;
          design_id?: string | null;
          id?: string;
          order_id?: string;
          product_id?: string;
          qty?: number;
          unit_price?: number;
          variant_id?: string | null;
        };
        Relationships: [
          { foreignKeyName: 'order_items_design_id_fkey'; columns: ['design_id']; referencedRelation: 'designs'; referencedColumns: ['id'] },
          { foreignKeyName: 'order_items_order_id_fkey'; columns: ['order_id']; referencedRelation: 'orders'; referencedColumns: ['id'] },
          { foreignKeyName: 'order_items_product_id_fkey'; columns: ['product_id']; referencedRelation: 'products'; referencedColumns: ['id'] },
          { foreignKeyName: 'order_items_variant_id_fkey'; columns: ['variant_id']; referencedRelation: 'product_variants'; referencedColumns: ['id'] },
        ];
      };
      orders: {
        Row: {
          created_at: string | null;
          design_id: string | null;
          id: string;
          shipping_address: string | null;
          status: string;
          total: number;
          updated_at: string | null;
          user_id: string;
        };
        Insert: {
          created_at?: string | null;
          design_id?: string | null;
          id?: string;
          shipping_address?: string | null;
          status?: string;
          total?: number;
          updated_at?: string | null;
          user_id: string;
        };
        Update: {
          created_at?: string | null;
          design_id?: string | null;
          id?: string;
          shipping_address?: string | null;
          status?: string;
          total?: number;
          updated_at?: string | null;
          user_id?: string;
        };
        Relationships: [
          { foreignKeyName: 'orders_design_id_fkey'; columns: ['design_id']; referencedRelation: 'designs'; referencedColumns: ['id'] },
        ];
      };
      product_variants: {
        Row: {
          active: boolean;
          color_hex: string;
          created_at: string | null;
          id: string;
          image_url: string | null;
          name: string;
          price_adj: number;
          product_id: string;
          stock: number;
          updated_at: string | null;
        };
        Insert: {
          active?: boolean;
          color_hex: string;
          created_at?: string | null;
          id?: string;
          image_url?: string | null;
          name: string;
          price_adj?: number;
          product_id: string;
          stock?: number;
          updated_at?: string | null;
        };
        Update: {
          active?: boolean;
          color_hex?: string;
          created_at?: string | null;
          id?: string;
          image_url?: string | null;
          name?: string;
          price_adj?: number;
          product_id?: string;
          stock?: number;
          updated_at?: string | null;
        };
        Relationships: [
          { foreignKeyName: 'product_variants_product_id_fkey'; columns: ['product_id']; referencedRelation: 'products'; referencedColumns: ['id'] },
        ];
      };
      products: {
        Row: {
          active: boolean;
          base_price: number;
          cover_image: string | null;
          created_at: string | null;
          description: string | null;
          id: string;
          name: string;
          slug: string;
          updated_at: string | null;
        };
        Insert: {
          active?: boolean;
          base_price?: number;
          cover_image?: string | null;
          created_at?: string | null;
          description?: string | null;
          id?: string;
          name: string;
          slug: string;
          updated_at?: string | null;
        };
        Update: {
          active?: boolean;
          base_price?: number;
          cover_image?: string | null;
          created_at?: string | null;
          description?: string | null;
          id?: string;
          name?: string;
          slug?: string;
          updated_at?: string | null;
        };
        Relationships: [];
      };
      profiles: {
        Row: {
          avatar_url: string | null;
          created_at: string | null;
          id: string;
          name: string | null;
          phone: string | null;
          role: string;
          updated_at: string | null;
        };
        Insert: {
          avatar_url?: string | null;
          created_at?: string | null;
          id: string;
          name?: string | null;
          phone?: string | null;
          role?: string;
          updated_at?: string | null;
        };
        Update: {
          avatar_url?: string | null;
          created_at?: string | null;
          id?: string;
          name?: string | null;
          phone?: string | null;
          role?: string;
          updated_at?: string | null;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};

export type Tables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Row'];
export type TablesInsert<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Insert'];
export type TablesUpdate<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Update'];

export type Product = Tables<'products'>;
export type ProductVariant = Tables<'product_variants'>;
export type Profile = Tables<'profiles'>;
export type Design = Tables<'designs'>;
export type Order = Tables<'orders'>;
export type OrderItem = Tables<'order_items'>;