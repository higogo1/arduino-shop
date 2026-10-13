// Supabase MCP generate_typescript_types 로 생성 (스키마 변경 시 다시 생성)
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

type OrderRow = {
  created_at: string
  id: string
  items_amount: number
  order_no: string
  paid_at: string | null
  payment_key: string | null
  recipient_name: string
  recipient_phone: string
  shipping_address: string
  shipping_fee: number
  status: string
  total_amount: number
  user_id: string
}

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      categories: {
        Row: { id: number; name: string; slug: string; sort_order: number }
        Insert: { id?: number; name: string; slug: string; sort_order?: number }
        Update: { id?: number; name?: string; slug?: string; sort_order?: number }
        Relationships: []
      }
      order_items: {
        Row: {
          id: number
          order_id: string
          product_id: string | null
          product_name: string
          quantity: number
          unit_price: number
        }
        Insert: {
          id?: number
          order_id: string
          product_id?: string | null
          product_name: string
          quantity: number
          unit_price: number
        }
        Update: {
          id?: number
          order_id?: string
          product_id?: string | null
          product_name?: string
          quantity?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: OrderRow
        Insert: Partial<OrderRow> &
          Pick<
            OrderRow,
            | "items_amount"
            | "order_no"
            | "recipient_name"
            | "recipient_phone"
            | "shipping_address"
            | "shipping_fee"
            | "total_amount"
            | "user_id"
          >
        Update: Partial<OrderRow>
        Relationships: []
      }
      products: {
        Row: {
          category_id: number
          created_at: string
          description: string
          devicemart_no: number | null
          id: string
          image_url: string | null
          is_active: boolean
          is_featured: boolean
          name: string
          price: number
          slug: string
          specs: Json
          stock: number
          summary: string
        }
        Insert: {
          category_id: number
          created_at?: string
          description?: string
          devicemart_no?: number | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          is_featured?: boolean
          name: string
          price: number
          slug: string
          specs?: Json
          stock?: number
          summary?: string
        }
        Update: {
          category_id?: number
          created_at?: string
          description?: string
          devicemart_no?: number | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          is_featured?: boolean
          name?: string
          price?: number
          slug?: string
          specs?: Json
          stock?: number
          summary?: string
        }
        Relationships: [
          {
            foreignKeyName: "products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          address: string | null
          created_at: string
          id: string
          name: string | null
          phone: string | null
          role: string
        }
        Insert: {
          address?: string | null
          created_at?: string
          id: string
          name?: string | null
          phone?: string | null
          role?: string
        }
        Update: {
          address?: string | null
          created_at?: string
          id?: string
          name?: string | null
          phone?: string | null
          role?: string
        }
        Relationships: []
      }
    }
    Views: { [_ in never]: never }
    Functions: {
      create_order: {
        Args: {
          items: Json
          recipient_name: string
          recipient_phone: string
          shipping_address: string
        }
        Returns: OrderRow
        SetofOptions: { from: "*"; to: "orders"; isOneToOne: true; isSetofReturn: false }
      }
      is_admin: { Args: never; Returns: boolean }
      mark_order_paid: {
        Args: { p_amount: number; p_order_id: string; p_payment_key: string }
        Returns: OrderRow
        SetofOptions: { from: "*"; to: "orders"; isOneToOne: true; isSetofReturn: false }
      }
    }
    Enums: { [_ in never]: never }
    CompositeTypes: { [_ in never]: never }
  }
}

type PublicSchema = Database["public"]
export type Tables<T extends keyof PublicSchema["Tables"]> = PublicSchema["Tables"][T]["Row"]

export type Product = Tables<"products">
export type Category = Tables<"categories">
export type Order = Tables<"orders">
export type OrderItem = Tables<"order_items">
export type Profile = Tables<"profiles">
