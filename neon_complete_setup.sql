-- =====================================================
-- SCIRA DATABASE COMPLETE SETUP FOR NEON
-- =====================================================
-- This script creates all tables, constraints, and indexes
-- needed for the Scira AI Search Application
-- =====================================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- USER MANAGEMENT TABLES
-- =====================================================

-- Users table - Core user authentication and profile
CREATE TABLE "user" (
  "id" text PRIMARY KEY NOT NULL,
  "name" text NOT NULL,
  "email" text NOT NULL,
  "email_verified" boolean NOT NULL,
  "image" text,
  "created_at" timestamp NOT NULL,
  "updated_at" timestamp NOT NULL,
  CONSTRAINT "user_email_unique" UNIQUE("email")
);

-- Sessions table - User authentication sessions
CREATE TABLE "session" (
  "id" text PRIMARY KEY NOT NULL,
  "expires_at" timestamp NOT NULL,
  "token" text NOT NULL,
  "created_at" timestamp NOT NULL,
  "updated_at" timestamp NOT NULL,
  "ip_address" text,
  "user_agent" text,
  "user_id" text NOT NULL,
  CONSTRAINT "session_token_unique" UNIQUE("token")
);

-- Accounts table - OAuth and external provider accounts
CREATE TABLE "account" (
  "id" text PRIMARY KEY NOT NULL,
  "account_id" text NOT NULL,
  "provider_id" text NOT NULL,
  "user_id" text NOT NULL,
  "access_token" text,
  "refresh_token" text,
  "id_token" text,
  "access_token_expires_at" timestamp,
  "refresh_token_expires_at" timestamp,
  "scope" text,
  "password" text,
  "created_at" timestamp NOT NULL,
  "updated_at" timestamp NOT NULL
);

-- Verification table - Email verification and password resets
CREATE TABLE "verification" (
  "id" text PRIMARY KEY NOT NULL,
  "identifier" text NOT NULL,
  "value" text NOT NULL,
  "expires_at" timestamp NOT NULL,
  "created_at" timestamp,
  "updated_at" timestamp
);

-- =====================================================
-- CHAT AND MESSAGING TABLES
-- =====================================================

-- Chat table - User conversations
CREATE TABLE "chat" (
  "id" text PRIMARY KEY NOT NULL,
  "userId" text NOT NULL,
  "title" text DEFAULT 'New Chat' NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL,
  "visibility" varchar DEFAULT 'private' NOT NULL
);

-- Message table - Individual messages in chats
CREATE TABLE "message" (
  "id" text PRIMARY KEY NOT NULL,
  "chat_id" text NOT NULL,
  "role" text NOT NULL,
  "parts" json NOT NULL,
  "attachments" json NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "model" text,
  "input_tokens" integer,
  "output_tokens" integer,
  "total_tokens" integer,
  "completion_time" real
);

-- Stream table - Real-time message streaming
CREATE TABLE "stream" (
  "id" text PRIMARY KEY NOT NULL,
  "chatId" text NOT NULL,
  "createdAt" timestamp DEFAULT now() NOT NULL
);

-- =====================================================
-- SUBSCRIPTION AND BILLING TABLES
-- =====================================================

-- Subscription table - User subscription management
CREATE TABLE "subscription" (
  "id" text PRIMARY KEY NOT NULL,
  "createdAt" timestamp NOT NULL,
  "modifiedAt" timestamp,
  "amount" integer NOT NULL,
  "currency" text NOT NULL,
  "recurringInterval" text NOT NULL,
  "status" text NOT NULL,
  "currentPeriodStart" timestamp NOT NULL,
  "currentPeriodEnd" timestamp NOT NULL,
  "cancelAtPeriodEnd" boolean NOT NULL DEFAULT false,
  "canceledAt" timestamp,
  "startedAt" timestamp NOT NULL,
  "endsAt" timestamp,
  "endedAt" timestamp,
  "customerId" text NOT NULL,
  "productId" text NOT NULL,
  "discountId" text,
  "checkoutId" text NOT NULL,
  "customerCancellationReason" text,
  "customerCancellationComment" text,
  "metadata" text,
  "customFieldData" text,
  "userId" text
);

-- Payment table - Payment transaction records
CREATE TABLE "payment" (
  "id" text PRIMARY KEY NOT NULL,
  "created_at" timestamp NOT NULL,
  "updated_at" timestamp,
  "brand_id" text,
  "business_id" text,
  "card_issuing_country" text,
  "card_last_four" text,
  "card_network" text,
  "card_type" text,
  "currency" text NOT NULL,
  "digital_products_delivered" boolean DEFAULT false,
  "discount_id" text,
  "error_code" text,
  "error_message" text,
  "payment_link" text,
  "payment_method" text,
  "payment_method_type" text,
  "settlement_amount" integer,
  "settlement_currency" text,
  "settlement_tax" integer,
  "status" text,
  "subscription_id" text,
  "tax" integer,
  "total_amount" integer NOT NULL,
  "billing" json,
  "customer" json,
  "disputes" json,
  "metadata" json,
  "product_cart" json,
  "refunds" json,
  "user_id" text
);

-- =====================================================
-- USAGE TRACKING TABLES
-- =====================================================

-- Message usage tracking table
CREATE TABLE "message_usage" (
  "id" text PRIMARY KEY NOT NULL,
  "user_id" text NOT NULL,
  "message_count" integer NOT NULL DEFAULT 0,
  "date" timestamp NOT NULL DEFAULT now(),
  "reset_at" timestamp NOT NULL,
  "created_at" timestamp NOT NULL DEFAULT now(),
  "updated_at" timestamp NOT NULL DEFAULT now()
);

-- Extreme search usage tracking table
CREATE TABLE "extreme_search_usage" (
  "id" text PRIMARY KEY NOT NULL,
  "user_id" text NOT NULL,
  "search_count" integer NOT NULL DEFAULT 0,
  "date" timestamp NOT NULL DEFAULT now(),
  "reset_at" timestamp NOT NULL,
  "created_at" timestamp NOT NULL DEFAULT now(),
  "updated_at" timestamp NOT NULL DEFAULT now()
);

-- =====================================================
-- USER PREFERENCES AND AUTOMATION TABLES
-- =====================================================

-- Custom instructions table - User-defined AI instructions
CREATE TABLE "custom_instructions" (
  "id" text PRIMARY KEY NOT NULL,
  "user_id" text NOT NULL,
  "content" text NOT NULL,
  "created_at" timestamp NOT NULL DEFAULT now(),
  "updated_at" timestamp NOT NULL DEFAULT now()
);

-- Lookout table - Scheduled automated searches
CREATE TABLE "lookout" (
  "id" text PRIMARY KEY NOT NULL,
  "user_id" text NOT NULL,
  "title" text NOT NULL,
  "prompt" text NOT NULL,
  "frequency" text NOT NULL,
  "cron_schedule" text NOT NULL,
  "timezone" text NOT NULL DEFAULT 'UTC',
  "next_run_at" timestamp NOT NULL,
  "qstash_schedule_id" text,
  "status" text NOT NULL DEFAULT 'active',
  "last_run_at" timestamp,
  "last_run_chat_id" text,
  "run_history" json DEFAULT '[]',
  "created_at" timestamp NOT NULL DEFAULT now(),
  "updated_at" timestamp NOT NULL DEFAULT now()
);

-- =====================================================
-- FOREIGN KEY CONSTRAINTS
-- =====================================================

-- User relationships
ALTER TABLE "session" ADD CONSTRAINT "session_user_id_user_id_fk" 
  FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE cascade;

ALTER TABLE "account" ADD CONSTRAINT "account_user_id_user_id_fk" 
  FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE cascade;

-- Chat relationships
ALTER TABLE "chat" ADD CONSTRAINT "chat_userId_user_id_fk" 
  FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE no action;

ALTER TABLE "message" ADD CONSTRAINT "message_chat_id_chat_id_fk" 
  FOREIGN KEY ("chat_id") REFERENCES "chat"("id") ON DELETE cascade;

ALTER TABLE "stream" ADD CONSTRAINT "stream_chatId_chat_id_fk" 
  FOREIGN KEY ("chatId") REFERENCES "chat"("id") ON DELETE cascade;

-- Subscription relationships
ALTER TABLE "subscription" ADD CONSTRAINT "subscription_userId_user_id_fk" 
  FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE set null;

ALTER TABLE "payment" ADD CONSTRAINT "payment_user_id_user_id_fk" 
  FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE set null;

-- Usage tracking relationships
ALTER TABLE "message_usage" ADD CONSTRAINT "message_usage_user_id_user_id_fk" 
  FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE cascade;

ALTER TABLE "extreme_search_usage" ADD CONSTRAINT "extreme_search_usage_user_id_user_id_fk" 
  FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE cascade;

-- User preferences relationships
ALTER TABLE "custom_instructions" ADD CONSTRAINT "custom_instructions_user_id_user_id_fk" 
  FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE cascade;

ALTER TABLE "lookout" ADD CONSTRAINT "lookout_user_id_user_id_fk" 
  FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE cascade;

-- =====================================================
-- PERFORMANCE INDEXES
-- =====================================================

-- Critical auth and session indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_email ON "user"(email);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_session_token ON session(token);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_session_user_id ON session(user_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_session_token_expires ON session(token, expires_at);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_session_active ON session(token, expires_at, user_id);

-- Chat and message performance indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_chat_user_created ON chat("userId", created_at DESC);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_message_chat_created ON message(chat_id, created_at ASC);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_message_role_created ON message(role, created_at DESC);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_stream_chat_created ON stream("chatId", "createdAt" DESC);

-- Subscription and billing indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_subscription_user_id ON subscription("userId");
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_subscription_status ON subscription(status, "currentPeriodEnd");
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_subscription_customer ON subscription("customerId");
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_payment_user_id ON payment(user_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_payment_status_created ON payment(status, created_at DESC);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_payment_subscription ON payment(subscription_id) WHERE subscription_id IS NOT NULL;

-- Usage tracking performance indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_message_usage_user_date ON message_usage(user_id, date);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_message_usage_today ON message_usage(user_id, date DESC, message_count);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_extreme_search_usage_user_date ON extreme_search_usage(user_id, date);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_extreme_usage_month ON extreme_search_usage(user_id, date DESC, search_count);

-- User preferences and automation indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_custom_instructions_user ON custom_instructions(user_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_lookout_user_status ON lookout(user_id, status);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_lookout_next_run ON lookout(next_run_at, status);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_lookout_last_run ON lookout(last_run_at DESC) WHERE last_run_at IS NOT NULL;

-- Account and verification indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_account_user_id ON account(user_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_account_provider ON account(provider_id, account_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_verification_identifier ON verification(identifier, expires_at);

-- =====================================================
-- SETUP COMPLETE
-- =====================================================
-- All tables, constraints, and indexes have been created
-- Your Neon database is now ready for the Scira application
-- =====================================================