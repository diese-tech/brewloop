export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      cafe_users: {
        Row: {
          cafe_id: string
          created_at: string
          id: string
          role: string
          user_id: string
        }
        Insert: {
          cafe_id: string
          created_at?: string
          id?: string
          role: string
          user_id: string
        }
        Update: {
          cafe_id?: string
          created_at?: string
          id?: string
          role?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "cafe_users_cafe_id_fkey"
            columns: ["cafe_id"]
            isOneToOne: false
            referencedRelation: "cafes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cafe_users_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      cafes: {
        Row: {
          accepting_orders: boolean
          address: string | null
          created_at: string
          external_label: string | null
          hours: string | null
          id: string
          logo_url: string | null
          name: string
          primary_color: string | null
          square_location_id: string | null
          square_tax_ids: string[]
          slug: string
          tagline: string | null
        }
        Insert: {
          accepting_orders?: boolean
          address?: string | null
          created_at?: string
          external_label?: string | null
          hours?: string | null
          id?: string
          logo_url?: string | null
          name: string
          primary_color?: string | null
          square_location_id?: string | null
          square_tax_ids?: string[]
          slug: string
          tagline?: string | null
        }
        Update: {
          accepting_orders?: boolean
          address?: string | null
          created_at?: string
          external_label?: string | null
          hours?: string | null
          id?: string
          logo_url?: string | null
          name?: string
          primary_color?: string | null
          square_location_id?: string | null
          square_tax_ids?: string[]
          slug?: string
          tagline?: string | null
        }
        Relationships: []
      }
      customers: {
        Row: {
          auth_user_id: string | null
          cafe_id: string
          created_at: string
          email: string | null
          id: string
          name: string | null
          phone: string | null
        }
        Insert: {
          auth_user_id?: string | null
          cafe_id: string
          created_at?: string
          email?: string | null
          id?: string
          name?: string | null
          phone?: string | null
        }
        Update: {
          auth_user_id?: string | null
          cafe_id?: string
          created_at?: string
          email?: string | null
          id?: string
          name?: string | null
          phone?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "customers_cafe_id_fkey"
            columns: ["cafe_id"]
            isOneToOne: false
            referencedRelation: "cafes"
            referencedColumns: ["id"]
          },
        ]
      }
      loyalty_accounts: {
        Row: {
          cafe_id: string
          created_at: string
          customer_id: string
          id: string
          points: number
          visits: number
        }
        Insert: {
          cafe_id: string
          created_at?: string
          customer_id: string
          id?: string
          points?: number
          visits?: number
        }
        Update: {
          cafe_id?: string
          created_at?: string
          customer_id?: string
          id?: string
          points?: number
          visits?: number
        }
        Relationships: [
          {
            foreignKeyName: "loyalty_accounts_cafe_id_fkey"
            columns: ["cafe_id"]
            isOneToOne: false
            referencedRelation: "cafes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "loyalty_accounts_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      loyalty_transactions: {
        Row: {
          account_id: string
          created_at: string
          id: string
          points: number
          reason: string | null
          type: string
        }
        Insert: {
          account_id: string
          created_at?: string
          id?: string
          points: number
          reason?: string | null
          type: string
        }
        Update: {
          account_id?: string
          created_at?: string
          id?: string
          points?: number
          reason?: string | null
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "loyalty_transactions_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "loyalty_accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      menu_categories: {
        Row: {
          cafe_id: string
          created_at: string
          id: string
          name: string
          sort_order: number
        }
        Insert: {
          cafe_id: string
          created_at?: string
          id?: string
          name: string
          sort_order?: number
        }
        Update: {
          cafe_id?: string
          created_at?: string
          id?: string
          name?: string
          sort_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "menu_categories_cafe_id_fkey"
            columns: ["cafe_id"]
            isOneToOne: false
            referencedRelation: "cafes"
            referencedColumns: ["id"]
          },
        ]
      }
      menu_items: {
        Row: {
          cafe_id: string
          category_id: string | null
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          is_active: boolean
          name: string
          price_cents: number
        }
        Insert: {
          cafe_id: string
          category_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          name: string
          price_cents?: number
        }
        Update: {
          cafe_id?: string
          category_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          name?: string
          price_cents?: number
        }
        Relationships: [
          {
            foreignKeyName: "menu_items_cafe_id_fkey"
            columns: ["cafe_id"]
            isOneToOne: false
            referencedRelation: "cafes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "menu_items_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "menu_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      order_items: {
        Row: {
          created_at: string
          id: string
          menu_item_id: string | null
          name_snapshot: string
          order_id: string
          quantity: number
          unit_price_cents: number
        }
        Insert: {
          created_at?: string
          id?: string
          menu_item_id?: string | null
          name_snapshot: string
          order_id: string
          quantity?: number
          unit_price_cents?: number
        }
        Update: {
          created_at?: string
          id?: string
          menu_item_id?: string | null
          name_snapshot?: string
          order_id?: string
          quantity?: number
          unit_price_cents?: number
        }
        Relationships: [
          {
            foreignKeyName: "order_items_menu_item_id_fkey"
            columns: ["menu_item_id"]
            isOneToOne: false
            referencedRelation: "menu_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          cafe_id: string
          created_at: string
          customer_id: string | null
          customer_name: string | null
          customer_phone: string | null
          id: string
          idempotency_key: string
          loyalty_awarded_at: string | null
          notes: string | null
          order_type: string
          payment_status: string
          square_order_id: string | null
          square_payment_id: string | null
          status: string
          subtotal_cents: number
          table_number: string | null
          tax_cents: number
          tip_cents: number
          total_cents: number
        }
        Insert: {
          cafe_id: string
          created_at?: string
          customer_id?: string | null
          customer_name?: string | null
          customer_phone?: string | null
          id?: string
          idempotency_key?: string
          loyalty_awarded_at?: string | null
          notes?: string | null
          order_type: string
          payment_status?: string
          square_order_id?: string | null
          square_payment_id?: string | null
          status?: string
          subtotal_cents?: number
          table_number?: string | null
          tax_cents?: number
          tip_cents?: number
          total_cents?: number
        }
        Update: {
          cafe_id?: string
          created_at?: string
          customer_id?: string | null
          customer_name?: string | null
          customer_phone?: string | null
          id?: string
          idempotency_key?: string
          loyalty_awarded_at?: string | null
          notes?: string | null
          order_type?: string
          payment_status?: string
          square_order_id?: string | null
          square_payment_id?: string | null
          status?: string
          subtotal_cents?: number
          table_number?: string | null
          tax_cents?: number
          tip_cents?: number
          total_cents?: number
        }
        Relationships: [
          {
            foreignKeyName: "orders_cafe_id_fkey"
            columns: ["cafe_id"]
            isOneToOne: false
            referencedRelation: "cafes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          display_name: string | null
          email: string | null
          id: string
          phone: string | null
        }
        Insert: {
          created_at?: string
          display_name?: string | null
          email?: string | null
          id: string
          phone?: string | null
        }
        Update: {
          created_at?: string
          display_name?: string | null
          email?: string | null
          id?: string
          phone?: string | null
        }
        Relationships: []
      }
      payment_events: {
        Row: {
          created_at: string
          event_type: string
          id: string
          payload: Json
        }
        Insert: {
          created_at?: string
          event_type: string
          id: string
          payload: Json
        }
        Update: {
          created_at?: string
          event_type?: string
          id?: string
          payload?: Json
        }
        Relationships: []
      }
      promotions: {
        Row: {
          active: boolean
          cafe_id: string
          created_at: string
          id: string
          message: string
          title: string
        }
        Insert: {
          active?: boolean
          cafe_id: string
          created_at?: string
          id?: string
          message: string
          title: string
        }
        Update: {
          active?: boolean
          cafe_id?: string
          created_at?: string
          id?: string
          message?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "promotions_cafe_id_fkey"
            columns: ["cafe_id"]
            isOneToOne: false
            referencedRelation: "cafes"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      apply_paid_order: {
        Args: {
          p_order_id: string
          p_square_order_id: string
          p_square_payment_id: string
          p_tax_cents: number
          p_total_cents: number
        }
        Returns: undefined
      }
      create_pending_order: {
        Args: {
          p_auth_user_id?: string | null
          p_cafe_id: string
          p_customer_name: string
          p_customer_phone: string
          p_idempotency_key: string
          p_items: Json
          p_notes: string
          p_order_type: string
          p_table_number: string
          p_tip_cents: number
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">
type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
