
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type Database = {
  
  "graphql_public": {
          Tables: {
            [_ in never]: never
          }
          Views: {
            [_ in never]: never
          }
          Functions: {
            "graphql":
{ Args: { "extensions"?: Json,"operationName"?: string,"query"?: string,"variables"?: Json }; Returns: Json
                           }
          }
          Enums: {
            [_ in never]: never
          }
          CompositeTypes: {
            [_ in never]: never
          }
        },"public": {
          Tables: {
            "blocks": {
                  Row: {
                    "blocked_id": string,"blocker_id": string,"created_at": string
                  }
                  Insert: {
                    "blocked_id": string,"blocker_id": string,"created_at"?: string
                  }
                  Update: {
                    "blocked_id"?: string,"blocker_id"?: string,"created_at"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "blocks_blocked_id_fkey"
      columns: ["blocked_id"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "blocks_blocker_id_fkey"
      columns: ["blocker_id"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    }
                  ]
                },"chapters": {
                  Row: {
                    "city": string | null,"code": string,"college": string,"created_at": string,"id": string,"name": string
                  }
                  Insert: {
                    "city"?: string | null,"code": string,"college": string,"created_at"?: string,"id"?: string,"name": string
                  }
                  Update: {
                    "city"?: string | null,"code"?: string,"college"?: string,"created_at"?: string,"id"?: string,"name"?: string
                  }
                  Relationships: [
                    
                  ]
                },"collection_items": {
                  Row: {
                    "collection_id": string,"position": number,"startup_id": string
                  }
                  Insert: {
                    "collection_id": string,"position"?: number,"startup_id": string
                  }
                  Update: {
                    "collection_id"?: string,"position"?: number,"startup_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "collection_items_collection_id_fkey"
      columns: ["collection_id"]
isOneToOne: false
      referencedRelation: "collections"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "collection_items_startup_id_fkey"
      columns: ["startup_id"]
isOneToOne: false
      referencedRelation: "startups"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "collection_items_startup_id_fkey"
      columns: ["startup_id"]
isOneToOne: false
      referencedRelation: "startups_trending"
      referencedColumns: ["id"]
    }
                  ]
                },"collections": {
                  Row: {
                    "created_at": string,"description": string | null,"id": string,"is_published": boolean,"slug": string,"sort_order": number,"theme": string,"title": string
                  }
                  Insert: {
                    "created_at"?: string,"description"?: string | null,"id"?: string,"is_published"?: boolean,"slug": string,"sort_order"?: number,"theme"?: string,"title": string
                  }
                  Update: {
                    "created_at"?: string,"description"?: string | null,"id"?: string,"is_published"?: boolean,"slug"?: string,"sort_order"?: number,"theme"?: string,"title"?: string
                  }
                  Relationships: [
                    
                  ]
                },"connections": {
                  Row: {
                    "created_at": string,"fitkit_done": (number)[],"from_id": string,"id": string,"last_message_at": string | null,"note": string,"responded_at": string | null,"status": Database["public"]['Enums']["connection_status"],"teamed_up_at": string | null,"teamed_up_from": boolean,"teamed_up_to": boolean,"to_id": string
                  }
                  Insert: {
                    "created_at"?: string,"fitkit_done"?: (number)[],"from_id": string,"id"?: string,"last_message_at"?: string | null,"note": string,"responded_at"?: string | null,"status"?: Database["public"]['Enums']["connection_status"],"teamed_up_at"?: string | null,"teamed_up_from"?: boolean,"teamed_up_to"?: boolean,"to_id": string
                  }
                  Update: {
                    "created_at"?: string,"fitkit_done"?: (number)[],"from_id"?: string,"id"?: string,"last_message_at"?: string | null,"note"?: string,"responded_at"?: string | null,"status"?: Database["public"]['Enums']["connection_status"],"teamed_up_at"?: string | null,"teamed_up_from"?: boolean,"teamed_up_to"?: boolean,"to_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "connections_from_id_fkey"
      columns: ["from_id"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "connections_to_id_fkey"
      columns: ["to_id"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    }
                  ]
                },"follows": {
                  Row: {
                    "created_at": string,"startup_id": string,"user_id": string
                  }
                  Insert: {
                    "created_at"?: string,"startup_id": string,"user_id": string
                  }
                  Update: {
                    "created_at"?: string,"startup_id"?: string,"user_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "follows_startup_id_fkey"
      columns: ["startup_id"]
isOneToOne: false
      referencedRelation: "startups"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "follows_startup_id_fkey"
      columns: ["startup_id"]
isOneToOne: false
      referencedRelation: "startups_trending"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "follows_user_id_fkey"
      columns: ["user_id"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    }
                  ]
                },"matches_daily": {
                  Row: {
                    "action": Database["public"]['Enums']["match_action"],"candidate_id": string,"for_date": string,"reasons": (string)[],"score": number,"user_id": string
                  }
                  Insert: {
                    "action"?: Database["public"]['Enums']["match_action"],"candidate_id": string,"for_date": string,"reasons"?: (string)[],"score": number,"user_id": string
                  }
                  Update: {
                    "action"?: Database["public"]['Enums']["match_action"],"candidate_id"?: string,"for_date"?: string,"reasons"?: (string)[],"score"?: number,"user_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "matches_daily_candidate_id_fkey"
      columns: ["candidate_id"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "matches_daily_user_id_fkey"
      columns: ["user_id"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    }
                  ]
                },"members": {
                  Row: {
                    "college": string,"created_at": string,"email": string,"id": string,"image": string | null,"member_id": string,"name": string,"password": string,"tier": string
                  }
                  Insert: {
                    "college": string,"created_at"?: string,"email": string,"id"?: string,"image"?: string | null,"member_id": string,"name": string,"password": string,"tier": string
                  }
                  Update: {
                    "college"?: string,"created_at"?: string,"email"?: string,"id"?: string,"image"?: string | null,"member_id"?: string,"name"?: string,"password"?: string,"tier"?: string
                  }
                  Relationships: [
                    
                  ]
                },"messages": {
                  Row: {
                    "body": string,"connection_id": string,"created_at": string,"id": string,"kind": string,"sender_id": string
                  }
                  Insert: {
                    "body": string,"connection_id": string,"created_at"?: string,"id"?: string,"kind"?: string,"sender_id": string
                  }
                  Update: {
                    "body"?: string,"connection_id"?: string,"created_at"?: string,"id"?: string,"kind"?: string,"sender_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "messages_connection_id_fkey"
      columns: ["connection_id"]
isOneToOne: false
      referencedRelation: "connections"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "messages_sender_id_fkey"
      columns: ["sender_id"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    }
                  ]
                },"open_roles": {
                  Row: {
                    "commitment": Database["public"]['Enums']["commitment"] | null,"created_at": string,"description": string | null,"id": string,"is_open": boolean,"skills": (Database["public"]['Enums']["skill"])[],"startup_id": string,"title": string,"type": Database["public"]['Enums']["role_type"]
                  }
                  Insert: {
                    "commitment"?: Database["public"]['Enums']["commitment"] | null,"created_at"?: string,"description"?: string | null,"id"?: string,"is_open"?: boolean,"skills"?: (Database["public"]['Enums']["skill"])[],"startup_id": string,"title": string,"type": Database["public"]['Enums']["role_type"]
                  }
                  Update: {
                    "commitment"?: Database["public"]['Enums']["commitment"] | null,"created_at"?: string,"description"?: string | null,"id"?: string,"is_open"?: boolean,"skills"?: (Database["public"]['Enums']["skill"])[],"startup_id"?: string,"title"?: string,"type"?: Database["public"]['Enums']["role_type"]
                  }
                  Relationships: [
                    {
      foreignKeyName: "open_roles_startup_id_fkey"
      columns: ["startup_id"]
isOneToOne: false
      referencedRelation: "startups"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "open_roles_startup_id_fkey"
      columns: ["startup_id"]
isOneToOne: false
      referencedRelation: "startups_trending"
      referencedColumns: ["id"]
    }
                  ]
                },"partners": {
                  Row: {
                    "category": string,"created_at": string,"description": string,"id": number,"link": string | null,"location": string | null,"logo_stamp": string,"name": string
                  }
                  Insert: {
                    "category": string,"created_at"?: string,"description": string,"id"?: never,"link"?: string | null,"location"?: string | null,"logo_stamp": string,"name": string
                  }
                  Update: {
                    "category"?: string,"created_at"?: string,"description"?: string,"id"?: never,"link"?: string | null,"location"?: string | null,"logo_stamp"?: string,"name"?: string
                  }
                  Relationships: [
                    
                  ]
                },"profile_contacts": {
                  Row: {
                    "email": string | null,"linkedin_url": string | null,"phone": string | null,"user_id": string
                  }
                  Insert: {
                    "email"?: string | null,"linkedin_url"?: string | null,"phone"?: string | null,"user_id": string
                  }
                  Update: {
                    "email"?: string | null,"linkedin_url"?: string | null,"phone"?: string | null,"user_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "profile_contacts_user_id_fkey"
      columns: ["user_id"]
isOneToOne: true
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    }
                  ]
                },"profile_passes": {
                  Row: {
                    "created_at": string,"target_id": string,"user_id": string
                  }
                  Insert: {
                    "created_at"?: string,"target_id": string,"user_id": string
                  }
                  Update: {
                    "created_at"?: string,"target_id"?: string,"user_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "profile_passes_target_id_fkey"
      columns: ["target_id"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "profile_passes_user_id_fkey"
      columns: ["user_id"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    }
                  ]
                },"profile_saves": {
                  Row: {
                    "created_at": string,"target_id": string,"user_id": string
                  }
                  Insert: {
                    "created_at"?: string,"target_id": string,"user_id": string
                  }
                  Update: {
                    "created_at"?: string,"target_id"?: string,"user_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "profile_saves_target_id_fkey"
      columns: ["target_id"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "profile_saves_user_id_fkey"
      columns: ["user_id"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    }
                  ]
                },"profiles": {
                  Row: {
                    "available_from": string | null,"avatar_url": string | null,"bio": string | null,"chapter_id": string | null,"chapter_verified": boolean,"city": string | null,"college": string | null,"college_email_verified": boolean,"commitment": Database["public"]['Enums']["commitment"] | null,"created_at": string,"equity_pref": string | null,"full_name": string | null,"headline": string | null,"hidden": boolean,"hide_from_own_college": boolean,"id": string,"industries": (string)[],"is_admin": boolean,"is_fellow": boolean,"last_active_at": string,"linkedin_verified": boolean,"looking_for_skills": (Database["public"]['Enums']["skill"])[],"onboarding_complete": boolean,"open_to_join": boolean,"primary_skill": Database["public"]['Enums']["skill"] | null,"proof_links": NonNullable<Json>,"remote_ok": boolean,"role": Database["public"]['Enums']["founder_role"] | null,"secondary_skills": (Database["public"]['Enums']["skill"])[],"still_looking_at": string,"tags": (string)[],"updated_at": string,"why_startup": string | null,"work_style": NonNullable<Json>
                  }
                  Insert: {
                    "available_from"?: string | null,"avatar_url"?: string | null,"bio"?: string | null,"chapter_id"?: string | null,"chapter_verified"?: boolean,"city"?: string | null,"college"?: string | null,"college_email_verified"?: boolean,"commitment"?: Database["public"]['Enums']["commitment"] | null,"created_at"?: string,"equity_pref"?: string | null,"full_name"?: string | null,"headline"?: string | null,"hidden"?: boolean,"hide_from_own_college"?: boolean,"id": string,"industries"?: (string)[],"is_admin"?: boolean,"is_fellow"?: boolean,"last_active_at"?: string,"linkedin_verified"?: boolean,"looking_for_skills"?: (Database["public"]['Enums']["skill"])[],"onboarding_complete"?: boolean,"open_to_join"?: boolean,"primary_skill"?: Database["public"]['Enums']["skill"] | null,"proof_links"?: NonNullable<Json>,"remote_ok"?: boolean,"role"?: Database["public"]['Enums']["founder_role"] | null,"secondary_skills"?: (Database["public"]['Enums']["skill"])[],"still_looking_at"?: string,"tags"?: (string)[],"updated_at"?: string,"why_startup"?: string | null,"work_style"?: NonNullable<Json>
                  }
                  Update: {
                    "available_from"?: string | null,"avatar_url"?: string | null,"bio"?: string | null,"chapter_id"?: string | null,"chapter_verified"?: boolean,"city"?: string | null,"college"?: string | null,"college_email_verified"?: boolean,"commitment"?: Database["public"]['Enums']["commitment"] | null,"created_at"?: string,"equity_pref"?: string | null,"full_name"?: string | null,"headline"?: string | null,"hidden"?: boolean,"hide_from_own_college"?: boolean,"id"?: string,"industries"?: (string)[],"is_admin"?: boolean,"is_fellow"?: boolean,"last_active_at"?: string,"linkedin_verified"?: boolean,"looking_for_skills"?: (Database["public"]['Enums']["skill"])[],"onboarding_complete"?: boolean,"open_to_join"?: boolean,"primary_skill"?: Database["public"]['Enums']["skill"] | null,"proof_links"?: NonNullable<Json>,"remote_ok"?: boolean,"role"?: Database["public"]['Enums']["founder_role"] | null,"secondary_skills"?: (Database["public"]['Enums']["skill"])[],"still_looking_at"?: string,"tags"?: (string)[],"updated_at"?: string,"why_startup"?: string | null,"work_style"?: NonNullable<Json>
                  }
                  Relationships: [
                    {
      foreignKeyName: "profiles_chapter_id_fkey"
      columns: ["chapter_id"]
isOneToOne: false
      referencedRelation: "chapters"
      referencedColumns: ["id"]
    }
                  ]
                },"reports": {
                  Row: {
                    "created_at": string,"details": string | null,"id": string,"reason": string,"reporter_id": string,"resolved_by": string | null,"status": Database["public"]['Enums']["review_status"],"target_id": string,"target_type": string
                  }
                  Insert: {
                    "created_at"?: string,"details"?: string | null,"id"?: string,"reason": string,"reporter_id": string,"resolved_by"?: string | null,"status"?: Database["public"]['Enums']["review_status"],"target_id": string,"target_type": string
                  }
                  Update: {
                    "created_at"?: string,"details"?: string | null,"id"?: string,"reason"?: string,"reporter_id"?: string,"resolved_by"?: string | null,"status"?: Database["public"]['Enums']["review_status"],"target_id"?: string,"target_type"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "reports_reporter_id_fkey"
      columns: ["reporter_id"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "reports_resolved_by_fkey"
      columns: ["resolved_by"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    }
                  ]
                },"role_applications": {
                  Row: {
                    "applicant_id": string,"created_at": string,"id": string,"note": string,"role_id": string,"status": Database["public"]['Enums']["connection_status"]
                  }
                  Insert: {
                    "applicant_id": string,"created_at"?: string,"id"?: string,"note": string,"role_id": string,"status"?: Database["public"]['Enums']["connection_status"]
                  }
                  Update: {
                    "applicant_id"?: string,"created_at"?: string,"id"?: string,"note"?: string,"role_id"?: string,"status"?: Database["public"]['Enums']["connection_status"]
                  }
                  Relationships: [
                    {
      foreignKeyName: "role_applications_applicant_id_fkey"
      columns: ["applicant_id"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "role_applications_role_id_fkey"
      columns: ["role_id"]
isOneToOne: false
      referencedRelation: "open_roles"
      referencedColumns: ["id"]
    }
                  ]
                },"startup_members": {
                  Row: {
                    "created_at": string,"is_owner": boolean,"met_on_tfc": boolean,"role_title": string | null,"startup_id": string,"user_id": string
                  }
                  Insert: {
                    "created_at"?: string,"is_owner"?: boolean,"met_on_tfc"?: boolean,"role_title"?: string | null,"startup_id": string,"user_id": string
                  }
                  Update: {
                    "created_at"?: string,"is_owner"?: boolean,"met_on_tfc"?: boolean,"role_title"?: string | null,"startup_id"?: string,"user_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "startup_members_startup_id_fkey"
      columns: ["startup_id"]
isOneToOne: false
      referencedRelation: "startups"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "startup_members_startup_id_fkey"
      columns: ["startup_id"]
isOneToOne: false
      referencedRelation: "startups_trending"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "startup_members_user_id_fkey"
      columns: ["user_id"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    }
                  ]
                },"startup_updates": {
                  Row: {
                    "author_id": string,"body": string,"created_at": string,"id": string,"startup_id": string
                  }
                  Insert: {
                    "author_id": string,"body": string,"created_at"?: string,"id"?: string,"startup_id": string
                  }
                  Update: {
                    "author_id"?: string,"body"?: string,"created_at"?: string,"id"?: string,"startup_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "startup_updates_author_id_fkey"
      columns: ["author_id"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "startup_updates_startup_id_fkey"
      columns: ["startup_id"]
isOneToOne: false
      referencedRelation: "startups"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "startup_updates_startup_id_fkey"
      columns: ["startup_id"]
isOneToOne: false
      referencedRelation: "startups_trending"
      referencedColumns: ["id"]
    }
                  ]
                },"startups": {
                  Row: {
                    "city": string | null,"claimed": boolean,"cover_url": string | null,"created_at": string,"created_by": string | null,"deck_path": string | null,"demo_video_url": string | null,"founded_year": number | null,"funding_raised": string | null,"id": string,"industry": string,"is_hidden": boolean,"last_update_at": string,"logo_url": string | null,"metrics": NonNullable<Json>,"name": string,"one_liner": string,"problem": string | null,"slug": string,"solution": string | null,"stage": Database["public"]['Enums']["startup_stage"],"status_tags": (string)[],"updated_at": string,"verification_tier": Database["public"]['Enums']["verification_tier"],"website": string | null
                  }
                  Insert: {
                    "city"?: string | null,"claimed"?: boolean,"cover_url"?: string | null,"created_at"?: string,"created_by"?: string | null,"deck_path"?: string | null,"demo_video_url"?: string | null,"founded_year"?: number | null,"funding_raised"?: string | null,"id"?: string,"industry": string,"is_hidden"?: boolean,"last_update_at"?: string,"logo_url"?: string | null,"metrics"?: NonNullable<Json>,"name": string,"one_liner": string,"problem"?: string | null,"slug": string,"solution"?: string | null,"stage"?: Database["public"]['Enums']["startup_stage"],"status_tags"?: (string)[],"updated_at"?: string,"verification_tier"?: Database["public"]['Enums']["verification_tier"],"website"?: string | null
                  }
                  Update: {
                    "city"?: string | null,"claimed"?: boolean,"cover_url"?: string | null,"created_at"?: string,"created_by"?: string | null,"deck_path"?: string | null,"demo_video_url"?: string | null,"founded_year"?: number | null,"funding_raised"?: string | null,"id"?: string,"industry"?: string,"is_hidden"?: boolean,"last_update_at"?: string,"logo_url"?: string | null,"metrics"?: NonNullable<Json>,"name"?: string,"one_liner"?: string,"problem"?: string | null,"slug"?: string,"solution"?: string | null,"stage"?: Database["public"]['Enums']["startup_stage"],"status_tags"?: (string)[],"updated_at"?: string,"verification_tier"?: Database["public"]['Enums']["verification_tier"],"website"?: string | null
                  }
                  Relationships: [
                    {
      foreignKeyName: "startups_created_by_fkey"
      columns: ["created_by"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    }
                  ]
                },"upvotes": {
                  Row: {
                    "created_at": string,"startup_id": string,"user_id": string
                  }
                  Insert: {
                    "created_at"?: string,"startup_id": string,"user_id": string
                  }
                  Update: {
                    "created_at"?: string,"startup_id"?: string,"user_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "upvotes_startup_id_fkey"
      columns: ["startup_id"]
isOneToOne: false
      referencedRelation: "startups"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "upvotes_startup_id_fkey"
      columns: ["startup_id"]
isOneToOne: false
      referencedRelation: "startups_trending"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "upvotes_user_id_fkey"
      columns: ["user_id"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    }
                  ]
                },"verification_requests": {
                  Row: {
                    "created_at": string,"evidence": string | null,"id": string,"kind": string,"reviewed_at": string | null,"reviewed_by": string | null,"reviewer_note": string | null,"status": Database["public"]['Enums']["review_status"],"submitted_by": string,"target_id": string
                  }
                  Insert: {
                    "created_at"?: string,"evidence"?: string | null,"id"?: string,"kind": string,"reviewed_at"?: string | null,"reviewed_by"?: string | null,"reviewer_note"?: string | null,"status"?: Database["public"]['Enums']["review_status"],"submitted_by": string,"target_id": string
                  }
                  Update: {
                    "created_at"?: string,"evidence"?: string | null,"id"?: string,"kind"?: string,"reviewed_at"?: string | null,"reviewed_by"?: string | null,"reviewer_note"?: string | null,"status"?: Database["public"]['Enums']["review_status"],"submitted_by"?: string,"target_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "verification_requests_reviewed_by_fkey"
      columns: ["reviewed_by"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "verification_requests_submitted_by_fkey"
      columns: ["submitted_by"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    }
                  ]
                }
          }
          Views: {
            "startup_team_public": {
                  Row: {
                    "avatar_url": string | null,"college": string | null,"full_name": string | null,"is_owner": boolean | null,"met_on_tfc": boolean | null,"role_title": string | null,"startup_id": string | null,"user_id": string | null
                  }
                  Relationships: [
                    {
      foreignKeyName: "startup_members_startup_id_fkey"
      columns: ["startup_id"]
isOneToOne: false
      referencedRelation: "startups"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "startup_members_startup_id_fkey"
      columns: ["startup_id"]
isOneToOne: false
      referencedRelation: "startups_trending"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "startup_members_user_id_fkey"
      columns: ["user_id"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    }
                  ]
                },"startups_trending": {
                  Row: {
                    "city": string | null,"claimed": boolean | null,"cover_url": string | null,"created_at": string | null,"created_by": string | null,"deck_path": string | null,"demo_video_url": string | null,"follows_count": number | null,"founded_year": number | null,"funding_raised": string | null,"id": string | null,"industry": string | null,"is_hidden": boolean | null,"is_inactive": boolean | null,"last_update_at": string | null,"logo_url": string | null,"metrics": Json | null,"name": string | null,"one_liner": string | null,"problem": string | null,"slug": string | null,"solution": string | null,"stage": Database["public"]['Enums']["startup_stage"] | null,"status_tags": (string)[] | null,"trending_score": number | null,"updated_at": string | null,"upvotes_count": number | null,"verification_tier": Database["public"]['Enums']["verification_tier"] | null,"website": string | null
                  }
                  Relationships: [
                    {
      foreignKeyName: "startups_created_by_fkey"
      columns: ["created_by"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    }
                  ]
                }
          }
          Functions: {
            "compute_daily_matches":
{ Args: { "per_user"?: number }; Returns: number
                           },
"compute_user_matches":
{ Args: { "per_user"?: number,"target_user": string }; Returns: number
                           },
"expire_old_requests":
{ Args: Record<PropertyKey, never>; Returns: number
                           },
"is_admin":
{ Args: Record<PropertyKey, never>; Returns: boolean
                           },
"is_blocked":
{ Args: { "a": string,"b": string }; Returns: boolean
                           },
"is_connected":
{ Args: { "a": string,"b": string }; Returns: boolean
                           },
"is_startup_member":
{ Args: { "sid": string }; Returns: boolean
                           },
"is_startup_owner":
{ Args: { "sid": string }; Returns: boolean
                           },
"match_eligible":
{ Args: { "a": Database["public"]['Tables']["profiles"]['Row'],"b": Database["public"]['Tables']["profiles"]['Row'] }; Returns: boolean
                           },
"match_score":
{ Args: { "a": Database["public"]['Tables']["profiles"]['Row'],"b": Database["public"]['Tables']["profiles"]['Row'] }; Returns: Record<string, unknown>
                           },
"skill_label":
{ Args: { "s": Database["public"]['Enums']["skill"] }; Returns: string
                           }
          }
          Enums: {
            "commitment": "full_time"|"part_time"|"after_grad","connection_status": "pending"|"accepted"|"declined"|"expired"|"archived","founder_role": "idea"|"join"|"either","match_action": "none"|"connected"|"saved"|"not_fit","review_status": "pending"|"approved"|"rejected"|"needs_info","role_type": "cofounder"|"intern"|"freelance","skill": "tech"|"product"|"design"|"growth"|"sales"|"ops"|"domain","startup_stage": "idea"|"building"|"launched"|"revenue"|"funded","verification_tier": "listed"|"verified"|"tfc_backed"
          }
          CompositeTypes: {
            [_ in never]: never
          }
        }
}

type DatabaseWithoutInternals = Omit<Database, '__InternalSupabase'>

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
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
  ? (DefaultSchema["Tables"] & DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
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
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
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
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
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
    : never = never
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
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
    : never = never
> = PublicCompositeTypeNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
  ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
  : never

export const Constants = {
  "graphql_public": {
          Enums: {
            
          }
        },"public": {
          Enums: {
            "commitment": ["full_time", "part_time", "after_grad"],"connection_status": ["pending", "accepted", "declined", "expired", "archived"],"founder_role": ["idea", "join", "either"],"match_action": ["none", "connected", "saved", "not_fit"],"review_status": ["pending", "approved", "rejected", "needs_info"],"role_type": ["cofounder", "intern", "freelance"],"skill": ["tech", "product", "design", "growth", "sales", "ops", "domain"],"startup_stage": ["idea", "building", "launched", "revenue", "funded"],"verification_tier": ["listed", "verified", "tfc_backed"]
          }
        }
} as const

