export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export type Database = {
    public: {
        Tables: {
            profiles: {
                Row: {
                    id: string
                    email: string
                    full_name: string | null
                    timezone: string
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id: string
                    email: string
                    full_name?: string | null
                    timezone?: string
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    email?: string
                    full_name?: string | null
                    timezone?: string
                    created_at?: string
                    updated_at?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "profiles_id_fkey"
                        columns: ["id"]
                        referencedRelation: "users"
                        referencedColumns: ["id"]
                    }
                ]
            }
            work_sessions: {
                Row: {
                    id: string
                    user_id: string
                    start_time: string
                    end_time: string | null
                    total_duration: string | null
                    status: 'active' | 'paused' | 'completed' | 'abandoned'
                    notes: string | null
                    device_info: Json | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    user_id: string
                    start_time: string
                    end_time?: string | null
                    total_duration?: string | null
                    status: 'active' | 'paused' | 'completed' | 'abandoned'
                    notes?: string | null
                    device_info?: Json | null
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    user_id?: string
                    start_time?: string
                    end_time?: string | null
                    total_duration?: string | null
                    status?: 'active' | 'paused' | 'completed' | 'abandoned'
                    notes?: string | null
                    device_info?: Json | null
                    created_at?: string
                    updated_at?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "work_sessions_user_id_fkey"
                        columns: ["user_id"]
                        referencedRelation: "users"
                        referencedColumns: ["id"]
                    }
                ]
            }
            work_pauses: {
                Row: {
                    id: string
                    session_id: string
                    pause_start: string
                    pause_end: string | null
                    created_at: string
                }
                Insert: {
                    id?: string
                    session_id: string
                    pause_start: string
                    pause_end?: string | null
                    created_at?: string
                }
                Update: {
                    id?: string
                    session_id?: string
                    pause_start?: string
                    pause_end?: string | null
                    created_at?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "work_pauses_session_id_fkey"
                        columns: ["session_id"]
                        referencedRelation: "work_sessions"
                        referencedColumns: ["id"]
                    }
                ]
            }
        }
        Views: {
            [_ in never]: never
        }
        Functions: {
            check_abandoned_sessions: {
                Args: Record<string, never>
                Returns: {
                    session_id: string
                    hours_since_start: number
                }[]
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
