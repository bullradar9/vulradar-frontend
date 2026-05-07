export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      cisa_kev: {
        Row: {
          cve_id: string
          date_added: string | null
          due_date: string | null
          known_ransomware_use: string | null
          product: string | null
          required_action: string | null
          short_description: string | null
          synced_at: string
          vendor_project: string | null
          vulnerability_name: string | null
        }
        Insert: {
          cve_id: string
          date_added?: string | null
          due_date?: string | null
          known_ransomware_use?: string | null
          product?: string | null
          required_action?: string | null
          short_description?: string | null
          synced_at?: string
          vendor_project?: string | null
          vulnerability_name?: string | null
        }
        Update: {
          cve_id?: string
          date_added?: string | null
          due_date?: string | null
          known_ransomware_use?: string | null
          product?: string | null
          required_action?: string | null
          short_description?: string | null
          synced_at?: string
          vendor_project?: string | null
          vulnerability_name?: string | null
        }
        Relationships: []
      }
      client_alerts: {
        Row: {
          alert_type: string
          created_at: string
          cve_id: string | null
          cvss_score: number | null
          cvss_severity: string | null
          description: string | null
          device_id: string
          eol_date: string | null
          fix_version: string | null
          id: string
          in_cisa_kev: boolean | null
          latest_stable: string | null
          latest_version: string | null
          priority_score: number
          scan_id: string
          software_name: string
          software_version: string | null
          status: string
          tenant_id: string
          updated_at: string
          versions_behind: number | null
        }
        Insert: {
          alert_type: string
          created_at?: string
          cve_id?: string | null
          cvss_score?: number | null
          cvss_severity?: string | null
          description?: string | null
          device_id: string
          eol_date?: string | null
          fix_version?: string | null
          id?: string
          in_cisa_kev?: boolean | null
          latest_stable?: string | null
          latest_version?: string | null
          priority_score?: number
          scan_id: string
          software_name: string
          software_version?: string | null
          status?: string
          tenant_id: string
          updated_at?: string
          versions_behind?: number | null
        }
        Update: {
          alert_type?: string
          created_at?: string
          cve_id?: string | null
          cvss_score?: number | null
          cvss_severity?: string | null
          description?: string | null
          device_id?: string
          eol_date?: string | null
          fix_version?: string | null
          id?: string
          in_cisa_kev?: boolean | null
          latest_stable?: string | null
          latest_version?: string | null
          priority_score?: number
          scan_id?: string
          software_name?: string
          software_version?: string | null
          status?: string
          tenant_id?: string
          updated_at?: string
          versions_behind?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "client_alerts_device_id_fkey"
            columns: ["device_id"]
            isOneToOne: false
            referencedRelation: "devices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_alerts_scan_id_fkey"
            columns: ["scan_id"]
            isOneToOne: false
            referencedRelation: "scans"
            referencedColumns: ["id"]
          },
        ]
      }
      device_inventory: {
        Row: {
          detected_at: string
          device_id: string
          id: string
          install_path: string | null
          publisher: string | null
          purl: string | null
          scan_id: string
          sha256: string | null
          software_name: string
          software_name_raw: string
          source: string
          tenant_id: string
          version: string | null
        }
        Insert: {
          detected_at?: string
          device_id: string
          id?: string
          install_path?: string | null
          publisher?: string | null
          purl?: string | null
          scan_id: string
          sha256?: string | null
          software_name: string
          software_name_raw: string
          source?: string
          tenant_id: string
          version?: string | null
        }
        Update: {
          detected_at?: string
          device_id?: string
          id?: string
          install_path?: string | null
          publisher?: string | null
          purl?: string | null
          scan_id?: string
          sha256?: string | null
          software_name?: string
          software_name_raw?: string
          source?: string
          tenant_id?: string
          version?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "device_inventory_device_id_fkey"
            columns: ["device_id"]
            isOneToOne: false
            referencedRelation: "devices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "device_inventory_scan_id_fkey"
            columns: ["scan_id"]
            isOneToOne: false
            referencedRelation: "scans"
            referencedColumns: ["id"]
          },
        ]
      }
      devices: {
        Row: {
          agent_id: string
          agent_pubkey: string | null
          agent_version: string | null
          architecture: string | null
          created_at: string
          device_name: string
          id: string
          last_scanned: string | null
          os: string
          os_version: string | null
          tenant_id: string
        }
        Insert: {
          agent_id: string
          agent_pubkey?: string | null
          agent_version?: string | null
          architecture?: string | null
          created_at?: string
          device_name: string
          id?: string
          last_scanned?: string | null
          os: string
          os_version?: string | null
          tenant_id: string
        }
        Update: {
          agent_id?: string
          agent_pubkey?: string | null
          agent_version?: string | null
          architecture?: string | null
          created_at?: string
          device_name?: string
          id?: string
          last_scanned?: string | null
          os?: string
          os_version?: string | null
          tenant_id?: string
        }
        Relationships: []
      }
      scans: {
        Row: {
          alerts_generated: number
          completed_at: string | null
          device_id: string
          error_msg: string | null
          id: string
          sbom_path: string | null
          software_count: number
          started_at: string
          status: string
          tenant_id: string
        }
        Insert: {
          alerts_generated?: number
          completed_at?: string | null
          device_id: string
          error_msg?: string | null
          id?: string
          sbom_path?: string | null
          software_count?: number
          started_at?: string
          status?: string
          tenant_id: string
        }
        Update: {
          alerts_generated?: number
          completed_at?: string | null
          device_id?: string
          error_msg?: string | null
          id?: string
          sbom_path?: string | null
          software_count?: number
          started_at?: string
          status?: string
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "scans_device_id_fkey"
            columns: ["device_id"]
            isOneToOne: false
            referencedRelation: "devices"
            referencedColumns: ["id"]
          },
        ]
      }
      software_versions: {
        Row: {
          latest_date: string | null
          latest_stable: string
          product: string
          updated_at: string
        }
        Insert: {
          latest_date?: string | null
          latest_stable: string
          product: string
          updated_at?: string
        }
        Update: {
          latest_date?: string | null
          latest_stable?: string
          product?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
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
